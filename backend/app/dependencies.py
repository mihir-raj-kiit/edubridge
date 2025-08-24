from fastapi import HTTPException, UploadFile
from typing import List
import os
from app.config import settings

def validate_file_type(file: UploadFile) -> UploadFile:
    """Validate uploaded file type"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type {file_ext} not allowed. Supported formats: {', '.join(settings.allowed_extensions)}"
        )
    
    return file

def validate_file_size(file: UploadFile) -> UploadFile:
    """Validate uploaded file size"""
    if file.size and file.size > settings.max_file_size:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size: {settings.max_file_size / 1024 / 1024:.1f}MB"
        )
    
    return file

async def get_validated_file(file: UploadFile) -> UploadFile:
    """Get validated file with type and size checks"""
    validate_file_type(file)
    validate_file_size(file)
    return file
