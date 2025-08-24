# from fastapi import FastAPI
# from fastapi.responses import FileResponse
# from pydantic import BaseModel
# from datetime import datetime
# import pandas as pd
# import uuid
# import os

# from analysis_core import analyze_quiz_results, AnalyzeConfig

# # ---------------- FastAPI App ----------------
# app = FastAPI(title="Quiz Analysis API", version="1.0")

# # ---------------- Request Models ----------------
# class Answer(BaseModel):
#     question: str
#     answer: str
#     user_answer: str
#     result: str
#     tags: list[str]

# class QuizRequest(BaseModel):
#     answers: list[Answer]

# # ---------------- Endpoints ----------------
# @app.post("/analyze")
# def analyze_quiz(req: QuizRequest):
#     """Analyze quiz answers and return ML insights"""
#     cfg = AnalyzeConfig(weak_threshold=0.60, strong_threshold=0.80)
#     answers_dict = [a.dict() for a in req.answers]

#     # Run analysis
#     out = analyze_quiz_results(answers_dict, cfg)

#     return {
#         "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
#         "analysis": out
#     }


# @app.post("/pdf")
# def generate_pdf(req: QuizRequest):
#     """Generate PDF report of results and return as download"""
#     try:
#         from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
#         from reportlab.lib.pagesizes import A4
#         from reportlab.lib import colors
#         from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
#         from xml.sax.saxutils import escape as xml_escape
#     except ImportError:
#         return {"error": "ReportLab not installed. Run: pip install reportlab"}

#     cfg = AnalyzeConfig(weak_threshold=0.60, strong_threshold=0.80)
#     answers_dict = [a.dict() for a in req.answers]
#     out = analyze_quiz_results(answers_dict, cfg)

#     df = pd.DataFrame(answers_dict)
#     per_topic = out["per_topic"].copy()
#     per_topic["accuracy(%)"] = (per_topic["accuracy"] * 100).round(1)

#     # Create temp PDF
#     filename = f"report_{uuid.uuid4().hex}.pdf"
#     doc = SimpleDocTemplate(filename, pagesize=A4)
#     styles = getSampleStyleSheet()
#     style_small = ParagraphStyle("small", parent=styles["Normal"], fontSize=9, leading=11, wordWrap="CJK")

#     def P(text, style=style_small):
#         return Paragraph(xml_escape(str(text)), style)

#     def clean_result(label: str) -> str:
#         if "Skipped" in label: return "Skipped"
#         if "Correct" in label: return "Correct"
#         if "Partial" in label: return "Partial"
#         if "Incorrect" in label: return "Incorrect"
#         return label

#     elements = []
#     elements.append(Paragraph("Quiz Report", styles["Title"]))
#     elements.append(Spacer(1, 10))
#     elements.append(Paragraph(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
#     elements.append(Spacer(1, 12))

#     # Quiz Results
#     elements.append(Paragraph("Quiz Results", styles["Heading2"]))
#     quiz_table_data = [["Question", "Your Answer", "Correct Answer", "Result"]]
#     for _, row in df.iterrows():
#         quiz_table_data.append([
#             P(row["question"]),
#             P(row["user_answer"] or "-"),
#             P(row["answer"]),
#             P(clean_result(row["result"])),
#         ])
#     quiz_table = Table(quiz_table_data, repeatRows=1, colWidths=[180, 110, 110, 50])
#     quiz_table.setStyle(TableStyle([
#         ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
#         ("GRID", (0,0), (-1,-1), 0.25, colors.black),
#     ]))
#     elements.append(quiz_table)
#     elements.append(Spacer(1, 12))

#     # Accuracy by Topic
#     elements.append(Paragraph("Accuracy by Topic", styles["Heading2"]))
#     topic_table_data = [["Topic", "Accuracy (%)", "Questions"]]
#     if not per_topic.empty:
#         for _, row in per_topic.iterrows():
#             topic_table_data.append([P(row["tags"]), P(row["accuracy(%)"]), P(int(row["n_questions"]))])
#     else:
#         topic_table_data.append([P("—"), P("—"), P(0)])
#     topic_table = Table(topic_table_data, repeatRows=1, colWidths=[200, 100, 80])
#     topic_table.setStyle(TableStyle([
#         ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
#         ("GRID", (0,0), (-1,-1), 0.25, colors.black),
#     ]))
#     elements.append(topic_table)
#     elements.append(Spacer(1, 12))

#     # Mistake Breakdown
#     elements.append(Paragraph("Mistake Breakdown", styles["Heading2"]))
#     mistake_table_data = [["Mistake Type", "Topic", "Count"]]
#     ms = out["mistake_stats"]
#     if not ms.empty:
#         for _, row in ms.iterrows():
#             mistake_table_data.append([P(row["mistake_type"]), P(row["tags"]), P(int(row["count"]))])
#     else:
#         mistake_table_data.append([P("None"), P("—"), P(0)])
#     mistake_table = Table(mistake_table_data, repeatRows=1, colWidths=[180, 180, 40])
#     mistake_table.setStyle(TableStyle([
#         ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
#         ("GRID", (0,0), (-1,-1), 0.25, colors.black),
#     ]))
#     elements.append(mistake_table)
#     elements.append(Spacer(1, 12))

#     # Weak/Strong Topics
#     elements.append(Paragraph("Weak & Strong Areas", styles["Heading2"]))
#     elements.append(Paragraph("Weak Topics: " + (", ".join(out["weak_topics"]) if out["weak_topics"] else "None"), styles["Normal"]))
#     elements.append(Paragraph("Strong Topics: " + (", ".join(out["strong_topics"]) if out["strong_topics"] else "None"), styles["Normal"]))
#     elements.append(Spacer(1, 12))

#     # Recommendations
#     elements.append(Paragraph("Recommendations", styles["Heading2"]))
#     if out["recommendations"]:
#         for rec in out["recommendations"]:
#             elements.append(Paragraph("• " + rec, styles["Normal"]))
#     else:
#         elements.append(Paragraph("No recommendations at this time.", styles["Normal"]))

#     doc.build(elements)

#     return FileResponse(filename, media_type="application/pdf", filename="quiz_report.pdf")


# # ---------------- Run with ----------------
# # uvicorn backend:app --reload
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware   # ✅ CORS middleware
from pydantic import BaseModel
from datetime import datetime
import pandas as pd
import uuid
import os

from analysis_core import analyze_quiz_results, AnalyzeConfig

# ---------------- FastAPI App ----------------
app = FastAPI(title="Quiz Analysis API", version="1.0")

# ✅ Allow CORS so React frontend can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict later to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Request Models ----------------
class Answer(BaseModel):
    question: str
    answer: str
    user_answer: str
    result: str
    tags: list[str]

class QuizRequest(BaseModel):
    answers: list[Answer]

# ---------------- Endpoints ----------------
@app.post("/analyze")
def analyze_quiz(req: QuizRequest):
    cfg = AnalyzeConfig(weak_threshold=0.60, strong_threshold=0.80)
    answers_dict = [a.dict() for a in req.answers]

    out = analyze_quiz_results(answers_dict, cfg)

    return {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "analysis": out
    }

@app.post("/pdf")
def generate_pdf(req: QuizRequest):
    try:
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from xml.sax.saxutils import escape as xml_escape
    except ImportError:
        return {"error": "ReportLab not installed. Run: pip install reportlab"}

    cfg = AnalyzeConfig(weak_threshold=0.60, strong_threshold=0.80)
    answers_dict = [a.dict() for a in req.answers]
    out = analyze_quiz_results(answers_dict, cfg)

    df = pd.DataFrame(answers_dict)
    per_topic = out["per_topic"].copy()
    per_topic["accuracy(%)"] = (per_topic["accuracy"] * 100).round(1)

    # Create temp PDF
    filename = f"report_{uuid.uuid4().hex}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=A4)
    styles = getSampleStyleSheet()
    style_small = ParagraphStyle("small", parent=styles["Normal"], fontSize=9, leading=11, wordWrap="CJK")

    def P(text, style=style_small):
        return Paragraph(xml_escape(str(text)), style)

    def clean_result(label: str) -> str:
        if "Skipped" in label: return "Skipped"
        if "Correct" in label: return "Correct"
        if "Partial" in label: return "Partial"
        if "Incorrect" in label: return "Incorrect"
        return label

    elements = []
    elements.append(Paragraph("Quiz Report", styles["Title"]))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    # Quiz Results
    elements.append(Paragraph("Quiz Results", styles["Heading2"]))
    quiz_table_data = [["Question", "Your Answer", "Correct Answer", "Result"]]
    for _, row in df.iterrows():
        quiz_table_data.append([
            P(row["question"]),
            P(row["user_answer"] or "-"),
            P(row["answer"]),
            P(clean_result(row["result"])),
        ])
    quiz_table = Table(quiz_table_data, repeatRows=1, colWidths=[180, 110, 110, 50])
    quiz_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
        ("GRID", (0,0), (-1,-1), 0.25, colors.black),
    ]))
    elements.append(quiz_table)
    elements.append(Spacer(1, 12))

    # Accuracy by Topic
    elements.append(Paragraph("Accuracy by Topic", styles["Heading2"]))
    topic_table_data = [["Topic", "Accuracy (%)", "Questions"]]
    if not per_topic.empty:
        for _, row in per_topic.iterrows():
            topic_table_data.append([P(row["tags"]), P(row["accuracy(%)"]), P(int(row["n_questions"]))])
    else:
        topic_table_data.append([P("—"), P("—"), P(0)])
    topic_table = Table(topic_table_data, repeatRows=1, colWidths=[200, 100, 80])
    topic_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
        ("GRID", (0,0), (-1,-1), 0.25, colors.black),
    ]))
    elements.append(topic_table)
    elements.append(Spacer(1, 12))

    # Mistake Breakdown
    elements.append(Paragraph("Mistake Breakdown", styles["Heading2"]))
    mistake_table_data = [["Mistake Type", "Topic", "Count"]]
    ms = out["mistake_stats"]
    if not ms.empty:
        for _, row in ms.iterrows():
            mistake_table_data.append([P(row["mistake_type"]), P(row["tags"]), P(int(row["count"]))])
    else:
        mistake_table_data.append([P("None"), P("—"), P(0)])
    mistake_table = Table(mistake_table_data, repeatRows=1, colWidths=[180, 180, 40])
    mistake_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
        ("GRID", (0,0), (-1,-1), 0.25, colors.black),
    ]))
    elements.append(mistake_table)
    elements.append(Spacer(1, 12))

    # Weak/Strong Topics
    elements.append(Paragraph("Weak & Strong Areas", styles["Heading2"]))
    elements.append(Paragraph("Weak Topics: " + (", ".join(out["weak_topics"]) if out["weak_topics"] else "None"), styles["Normal"]))
    elements.append(Paragraph("Strong Topics: " + (", ".join(out["strong_topics"]) if out["strong_topics"] else "None"), styles["Normal"]))
    elements.append(Spacer(1, 12))

    # Recommendations
    elements.append(Paragraph("Recommendations", styles["Heading2"]))
    if out["recommendations"]:
        for rec in out["recommendations"]:
            elements.append(Paragraph("• " + rec, styles["Normal"]))
    else:
        elements.append(Paragraph("No recommendations at this time.", styles["Normal"]))

    doc.build(elements)

    return FileResponse(filename, media_type="application/pdf", filename="quiz_report.pdf")


# ---------------- Run with ----------------
# uvicorn backend:app --reload
