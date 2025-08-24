import os
import streamlit as st
import json
import re

# ---- Groq API Setup ----
try:
    from groq import Groq

    api_key = os.environ.get("GROQ_API_KEY") or st.secrets.get("groq", {}).get("api_key")
    if not api_key:
        st.error(
            "Groq API key not found. "
            "Please set GROQ_API_KEY as an environment variable or add it to .streamlit/secrets.toml"
        )
        st.stop()

    client = Groq(api_key=api_key)

except ImportError:
    st.error("Please install Groq: pip install groq")
    st.stop()
except Exception as e:
    st.error(f"Error initializing Groq API: {e}")
    st.stop()

st.success("Groq API initialized successfully!")

# ---- Load Notes ----
with open("notes.json", "r") as f:
    cv_json = json.load(f)
print(cv_json["content"])

# ---- Groq Query Function ----
def query_groq_api(messages):
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            temperature=1
        )
        return response.choices[0].message.content
    except Exception as e:
        st.error(f"Error from Groq API: {e}")
        return "Oops, something went wrong with the AI's response."

# ---- Summarize Lecture ----
prompt = f"""
You are an AI summarizer. 

Input: A lecture JSON containing "heading" and "text" content. Ignore diagrams. 

TASK:
- Generate a concise, structured summary.
- Keep it short (2-3 sentences per main heading).

Input JSON:
<<<JSON
{json.dumps(cv_json['content'])}
JSON>>>
"""
summary_text = query_groq_api([{"role": "user", "content": prompt}])

try:
    summary_json = json.loads(summary_text)
except:
    summary_json = {"raw": summary_text}

with open("summary.json", "w") as f:
    json.dump(summary_json, f, indent=2)

st.subheader("Lecture Summary")
st.json(summary_json)

# ---- Flashcards & Knowledge Graphs ----
text_blocks = [block["text"] for block in cv_json["content"] if block["type"] in ["heading", "text"]]

all_flashcards = []
all_graphs_raw = []

for block_text in text_blocks:
    # Flashcard prompt
    prompt_flashcards = f"""
    Extract key concepts from the following text and create flashcards.
    Output JSON: [{{"question": "...", "answer": "..."}}]
    Text: {block_text} Donot include any commentary just the output json nothing else no instructions 
    """

    # Knowledge graph prompt
    prompt_knowledge = f"""
You are an information extractor. Read the text and return a SINGLE JSON object ONLY.

RULES
- Output EXACTLY one JSON object, no prose.
- Wrap the JSON between markers: <<<JSON and JSON>>>.
- JSON shape:
  {{
    "nodes": [{{"id": "string", "label": "string"}}],
    "edges": [{{"from": "string", "to": "string"}}]
  }}
- Create nodes only for domain concepts/headings from the text.
- Do NOT create nodes from instructions or meta-text (e.g., "Do not include any commentary...").
- Normalize IDs: lowercase, alphanumerics + underscores; unique; no spaces; short slugs of labels.
- Merge synonyms/variants into one node (e.g., "Average Variable Cost", "AVC", "AVC_" → id "avc").
- Edges must reference existing node IDs only.
- Limit: max 20 nodes, max 40 edges.

EXAMPLES
Input:
"Average Cost (AC) and Average Variable Cost (AVC). Marginal Cost (MC) cuts both at their minima."
Output:
<<<JSON
{{
  "nodes": [
    {{"id": "ac", "label": "Average Cost (AC)"}},
    {{"id": "avc", "label": "Average Variable Cost (AVC)"}},
    {{"id": "mc", "label": "Marginal Cost (MC)"}},
    {{"id": "rule_mc_cuts_minima", "label": "MC intersects AC and AVC at minima"}}
  ],
  "edges": [
    {{"from": "mc", "to": "rule_mc_cuts_minima"}},
    {{"from": "ac", "to": "rule_mc_cuts_minima"}},
    {{"from": "avc", "to": "rule_mc_cuts_minima"}}
  ]
}}
JSON>>>

Input:
"AC − AVC = AFC (> 0). As output rises, AC and AVC approach but never coincide."
Output:
<<<JSON
{{
  "nodes": [
    {{"id": "ac", "label": "Average Cost (AC)"}},
    {{"id": "avc", "label": "Average Variable Cost (AVC)"}},
    {{"id": "afc", "label": "Average Fixed Cost (AFC)"}},
    {{"id": "identity_gap", "label": "AC − AVC = AFC (> 0)"}},
    {{"id": "never_coincide", "label": "AC and AVC never coincide"}}
  ],
  "edges": [
    {{"from": "ac", "to": "identity_gap"}},
    {{"from": "avc", "to": "identity_gap"}},
    {{"from": "afc", "to": "identity_gap"}},
    {{"from": "identity_gap", "to": "never_coincide"}}
  ]
}}
JSON>>>

TASK
Text:
{block_text}
Return ONLY the JSON between <<<JSON and JSON>>>.
"""

    # Query for flashcards
    flashcards = query_groq_api([{"role": "user", "content": prompt_flashcards}])
    try:
        flashcards_json = json.loads(flashcards)
    except:
        flashcards_json = {"raw": flashcards}
    all_flashcards.append(flashcards_json)

    # Query for knowledge graph
    graph_response = query_groq_api([{"role": "user", "content": prompt_knowledge}])
    all_graphs_raw.append(graph_response)

st.subheader("Flashcards")
st.json(all_flashcards)  # nicely formatted JSON

# ---- Clean & Save Flashcards ----
all_flashcards_clean = []
for item in all_flashcards:
    if isinstance(item, dict) and "raw" in item:
        raw_text = item["raw"]
        match = re.search(r"\[.*\]", raw_text, re.DOTALL)
        if match:
            try:
                flashcards_json = json.loads(match.group(0))
                all_flashcards_clean.extend(flashcards_json)
            except:
                continue
    elif isinstance(item, list):
        all_flashcards_clean.extend(item)
flashcards_output = {"flashcards": all_flashcards_clean}

with open("output.json", "w") as f:
    json.dump(flashcards_output, f, indent=2)

# ---- Clean & Save Knowledge Graphs ----
all_graphs_clean = []
for raw_text in all_graphs_raw:
    match = re.search(r"\{.*\}", raw_text, re.DOTALL)
    if match:
        try:
            graph_json = json.loads(match.group(0))
            all_graphs_clean.append(graph_json)
        except:
            continue

knowledge_graph_output = {"graphs": all_graphs_clean}

with open("knowledge_graph.json", "w") as f:
    json.dump(knowledge_graph_output, f, indent=2)

st.subheader("Knowledge Graphs")
st.json(knowledge_graph_output)