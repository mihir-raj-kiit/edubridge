from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
import tempfile
import shutil
import os
from datetime import datetime
from typing import Optional

from app.dependencies import get_validated_file
from app.core.imageOCR import process_image
from app.core.diagram_detector import detect_diagrams_json
from app.models.response import OCRResponse, DiagramResponse, ExtractResponse
from app.utils.file_handler import save_output_json, create_temp_file
from app.services.groq_service import groq_service

router = APIRouter()

@router.post("/ocr", response_model=OCRResponse)
async def extract_text(
    file: UploadFile = Depends(get_validated_file),
    save_output: bool = True
):
    """
    Extract text from uploaded image using OCR
    """
    temp_path = None
    try:
        # Create temporary file
        temp_path = await create_temp_file(file)
        
        # Process image with OCR
        ocr_result = process_image(temp_path, output_file=None)
        
        if not ocr_result:
            raise HTTPException(status_code=422, detail="Failed to process image")
        
        # Save output if requested
        if save_output:
            output_filename = f"ocr_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            await save_output_json(ocr_result, output_filename)
        
        return OCRResponse(**ocr_result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")
    finally:
        # Cleanup temporary file
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)

@router.post("/diagram-detect", response_model=DiagramResponse)
async def detect_diagrams(
    file: UploadFile = Depends(get_validated_file),
    save_output: bool = True
):
    """
    Detect diagrams and flowcharts in uploaded image
    """
    temp_path = None
    try:
        # Create temporary file
        temp_path = await create_temp_file(file)
        
        # Detect diagrams
        boxes = detect_diagrams_json(temp_path)
        
        # Create response
        response_data = {
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
        
        # Save output if requested
        if save_output:
            output_filename = f"diagrams_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            await save_output_json(response_data, output_filename)
        
        return DiagramResponse(**response_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagram detection failed: {str(e)}")
    finally:
        # Cleanup temporary file
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)

@router.post("/extract", response_model=ExtractResponse)
async def extract_all(
    file: UploadFile = Depends(get_validated_file),
    save_output: bool = True,
    enable_groq: bool = True
):
    """
    Combined OCR, diagram detection, and AI enhancement with Groq
    """
    temp_path = None
    try:
        # Create temporary file
        temp_path = await create_temp_file(file)

        # OCR processing
        ocr_result = process_image(temp_path, output_file=None)
        if not ocr_result:
            raise HTTPException(status_code=422, detail="Failed to process image with OCR")

        # Diagram detection
        boxes = detect_diagrams_json(temp_path)

        # Merge OCR and diagram results
        combined_data = {
            "lecture_id": ocr_result.get("lecture_id", "lec_001"),
            "course": ocr_result.get("course", "Operating Systems"),
            "topic": ocr_result.get("topic", "Process Management"),
            "date": ocr_result.get("date", datetime.today().strftime("%Y-%m-%d")),
            "content": []
        }

        # Add OCR content
        if "content" in ocr_result:
            combined_data["content"].extend(ocr_result["content"])

        # Add diagram content
        combined_data["content"].append({
            "type": "diagram",
            "title": "Detected Diagram(s)",
            "description": "Auto-detected diagrams with bounding boxes.",
            "nodes": [],
            "connections": [],
            "boxes": boxes
        })

        # 🚀 NEW: Enhance with Groq AI if enabled
        if enable_groq and groq_service.is_available():
            print("🤖 Enhancing content with Groq AI...")
            enhanced_data = await groq_service.enhance_ocr_content(combined_data)
            response_data = enhanced_data
        else:
            print("📄 Using standard OCR/CV output (Groq disabled or unavailable)")
            response_data = combined_data

        # Save output if requested
        if save_output:
            output_filename = f"extract_groq_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            await save_output_json(response_data, output_filename)

        return ExtractResponse(**response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Combined extraction failed: {str(e)}")
    finally:
        # Cleanup temporary file
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
