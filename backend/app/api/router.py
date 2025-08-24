
from fastapi import APIRouter
from app.api.endpoints import health, ocr, groq, outputs

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(ocr.router, prefix="", tags=["ocr"])
api_router.include_router(groq.router, prefix="/groq", tags=["groq"])
api_router.include_router(outputs.router, prefix="/outputs", tags=["outputs"])
