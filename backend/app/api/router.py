from fastapi import APIRouter
from app.api.endpoints import health, ocr, groq, outputs

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, tags=["health"])
api_router.include_router(ocr.router, prefix="/api", tags=["ocr"])
api_router.include_router(groq.router, prefix="/api/groq", tags=["groq"])
api_router.include_router(outputs.router, prefix="/api", tags=["outputs"])
