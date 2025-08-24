"""
EduBridge Backend - Main FastAPI Application

This is the main entry point for the EduBridge backend service that provides
OCR processing, diagram detection, and AI-powered learning features.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from pathlib import Path

from app.api.router import api_router
from app.core.config import get_settings
from app.core.logging import setup_logging

# Get application settings
settings = get_settings()

# Setup logging
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 EduBridge Backend starting up...")
    
    # Create necessary directories
    Path("uploads").mkdir(exist_ok=True)
    Path("outputs").mkdir(exist_ok=True)
    Path("temp").mkdir(exist_ok=True)
    
    print("📁 Created necessary directories")
    print(f"🌍 Environment: {settings.ENVIRONMENT}")
    print(f"🔧 Debug mode: {settings.DEBUG}")
    
    yield
    
    # Shutdown
    print("🛑 EduBridge Backend shutting down...")


# Create FastAPI application
app = FastAPI(
    title="EduBridge Backend API",
    description="AI-powered OCR and learning platform backend service",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Mount static files for uploads (if needed)
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
async def root():
    """Root endpoint - health check"""
    return JSONResponse({
        "message": "EduBridge Backend API",
        "version": "1.0.0",
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    })


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse({
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    })


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
