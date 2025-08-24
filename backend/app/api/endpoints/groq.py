from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any
from datetime import datetime

from app.services.groq_service import groq_service
from app.models.response import ExtractResponse
from app.utils.file_handler import save_output_json

router = APIRouter()

@router.post("/enhance")
async def enhance_with_groq(
    ocr_data: Dict[str, Any],
    save_output: bool = True
):
    """
    Enhance existing OCR/CV data with Groq AI processing
    """
    try:
        # Validate input data
        if not ocr_data or "content" not in ocr_data:
            raise HTTPException(status_code=400, detail="Invalid OCR data format")
        
        # Enhance with Groq AI
        enhanced_data = await groq_service.enhance_ocr_content(ocr_data)
        
        # Save output if requested
        if save_output:
            output_filename = f"groq_enhanced_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            await save_output_json(enhanced_data, output_filename)
        
        return JSONResponse(content=enhanced_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq enhancement failed: {str(e)}")

@router.get("/health")
async def groq_health():
    """
    Check Groq service health
    """
    try:
        is_available = groq_service.is_available()
        
        return JSONResponse(content={
            "groq_available": is_available,
            "service_status": "operational" if is_available else "unavailable",
            "model": groq_service.client.model if is_available else None,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "groq_available": False,
                "service_status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

@router.post("/generate-flashcards")
async def generate_flashcards_only(
    text_content: str,
    course: str = "General Studies",
    topic: str = "Study Notes",
    num_cards: int = 5
):
    """
    Generate flashcards from text content using Groq AI
    """
    try:
        if not text_content.strip():
            raise HTTPException(status_code=400, detail="Text content cannot be empty")
        
        # Create simplified OCR data for flashcard generation
        mock_ocr_data = {
            "lecture_id": f"cards_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "course": course,
            "topic": topic,
            "date": datetime.today().strftime("%Y-%m-%d"),
            "content": [
                {"type": "text", "text": text_content}
            ]
        }
        
        # Enhance with Groq to get flashcards
        enhanced_data = await groq_service.enhance_ocr_content(mock_ocr_data)
        
        # Return just the flashcards
        flashcards = enhanced_data.get("flashcards", [])[:num_cards]
        
        return JSONResponse(content={
            "flashcards": flashcards,
            "course": course,
            "topic": topic,
            "generated_count": len(flashcards),
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flashcard generation failed: {str(e)}")
