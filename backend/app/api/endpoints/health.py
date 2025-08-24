from fastapi import APIRouter, status
from app.models.response import HealthResponse
import psutil
import time
from datetime import datetime

router = APIRouter()

@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint to verify service status
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        uptime=time.time(),
        system_info={
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent
        }
    )
