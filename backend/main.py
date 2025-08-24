from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import tempfile
import shutil
from datetime import datetime
from diagram_detector import detect_diagrams_json
from imageOCR import process_image  # Make sure this exists and is importable

app = FastAPI()

@app.post("/diagram-detect")
async def diagram_detect(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        boxes = detect_diagrams_json(tmp_path)

        response = {
            "lecture_id": "lec_001",
            "course": "Operating Systems",
            "topic": "Process Management",
            "date": datetime.today().strftime("%Y-%m-%d"),
            "content": [
                {
                    "type": "diagram",
                    "title": "Detected Diagram(s)",
                    "description": "Auto-detected diagrams with bounding boxes.",
                    "nodes": [],
                    "connections": [],
                    "boxes": boxes
                }
            ]
        }

        return JSONResponse(content=response)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # OCR part
        ocr_json = process_image(tmp_path, output_file=None)  # should return dict

        # Diagram Detection part
        boxes = detect_diagrams_json(tmp_path)

        # Merge OCR and Diagrams into one response
        response = {
            "lecture_id": ocr_json.get("lecture_id", "lec_001"),
            "course": ocr_json.get("course", "Operating Systems"),
            "topic": ocr_json.get("topic", "Process Management"),
            "date": ocr_json.get("date", datetime.today().strftime("%Y-%m-%d")),
            "content": []
        }

        # Add OCR content if available
        if "content" in ocr_json:
            response["content"].extend(ocr_json["content"])

        # Add diagram info
        response["content"].append({
            "type": "diagram",
            "title": "Detected Diagram(s)",
            "description": "Auto-detected diagrams with bounding boxes.",
            "nodes": [],
            "connections": [],
            "boxes": boxes
        })

        return JSONResponse(content=response)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)