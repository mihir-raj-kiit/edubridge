from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import logging
from pathlib import Path

from app.api.router import api_router
from app.core.config import get_settings
from app.core.logging import get_logger

# Initialize settings and logger
settings = get_settings()
logger = get_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="StudySync OCR & AI Processing API",
    description="Backend API for converting handwritten notes to digital flashcards and knowledge maps",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create output directory if it doesn't exist
output_dir = Path("outputs")
output_dir.mkdir(exist_ok=True)

# Mount static files for output downloads
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Include API router
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "StudySync OCR & AI Processing API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "endpoints": {
            "ocr": "/api/ocr",
            "diagram_detect": "/api/diagram-detect", 
            "extract_all": "/api/extract",
            "groq_enhance": "/api/groq/enhance",
            "groq_health": "/api/groq/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "components": {
            "ocr": "operational",
            "diagram_detection": "operational", 
            "groq_ai": "available" if settings.groq_api_key else "disabled",
            "file_storage": "operational"
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc),
            "path": str(request.url)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )