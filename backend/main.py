"""
FastAPI Backend for OCR and Diagram Detection

A comprehensive backend service for processing images to extract text (OCR)
and detect diagrams/flowcharts with structured JSON output.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn

from app.config import settings
from app.api.router import api_router
from app.utils.file_handler import ensure_directories

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for startup and shutdown
    """
    # Startup
    print("🚀 Starting OCR & Diagram Detection API...")
    ensure_directories()
    print(f"📁 Upload directory: {settings.upload_dir}")
    print(f"📁 Output directory: {settings.output_dir}")
    print(f"🔧 Debug mode: {settings.debug}")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down OCR & Diagram Detection API...")

# Create FastAPI application
app = FastAPI(
    title="OCR & Diagram Detection API",
    description="A FastAPI backend for extracting text and detecting diagrams from images",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for unhandled errors
    """
    if settings.debug:
        # In debug mode, show detailed error information
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "detail": str(exc),
                "type": type(exc).__name__
            }
        )
    else:
        # In production mode, show generic error message
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "detail": "An unexpected error occurred"
            }
        )

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with API information
    """
    return {
        "message": "OCR & Diagram Detection API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "ocr": "/api/ocr",
            "diagram_detection": "/api/diagram-detect",
            "combined_extraction": "/api/extract"
        }
    }

# Legacy endpoints for backward compatibility
@app.post("/diagram-detect")
async def legacy_diagram_detect(file):
    """Legacy endpoint - redirects to new API structure"""
    return HTTPException(
        status_code=301, 
        detail="This endpoint has moved to /api/diagram-detect"
    )

@app.post("/extract")
async def legacy_extract(file):
    """Legacy endpoint - redirects to new API structure"""
    return HTTPException(
        status_code=301, 
        detail="This endpoint has moved to /api/extract"
    )

# Development server
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
        log_level="debug" if settings.debug else "info"
    )
