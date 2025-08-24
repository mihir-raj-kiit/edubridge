
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime

from app.models.response import HealthResponse
from app.config import settings
from app.services.groq_service import groq_service

router = APIRouter()

@router.get("/", response_model=HealthResponse)
async def health_check():
    """Comprehensive health check"""
    
    components = {
        "ocr": "operational",
        "diagram_detection": "operational",
        "file_storage": "operational",
        "groq_ai": "available" if groq_service.is_available() else "disabled"
    }
    
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        components=components
    )

@router.get("/detailed")
async def detailed_health():
    """Detailed health information"""
    
    return JSONResponse(content={
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "ocr": {
                "status": "operational",
                "languages": settings.ocr_languages,
                "confidence_threshold": settings.ocr_confidence_threshold
            },
            "diagram_detection": {
                "status": "operational", 
                "threshold": settings.diagram_detection_threshold,
                "min_contour_area": settings.min_contour_area
            },
            "groq_ai": {
                "status": "available" if groq_service.is_available() else "disabled",
                "model": "llama-3.3-70b-versatile" if groq_service.is_available() else None
            },
            "storage": {
                "status": "operational",
                "output_directory": settings.output_dir
            }
        },
        "configuration": {
            "max_file_size": "10MB",
            "allowed_formats": ["jpg", "jpeg", "png", "webp", "bmp", "tiff"],
            "spell_correction": settings.enable_spell_correction
        }
    })
