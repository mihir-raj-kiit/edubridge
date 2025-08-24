
from fastapi import Depends, HTTPException, UploadFile, File
from typing import Optional
import os
from pathlib import Path

from app.config import settings

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def get_validated_file(file: UploadFile = File(...)) -> UploadFile:
    """
    Validate uploaded file
    
    Args:
        file: Uploaded file
        
    Returns:
        Validated file
        
    Raises:
        HTTPException: If file is invalid
    """
    # Check if file was provided
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Reset file pointer for later reading
    await file.seek(0)
    
    return file

def get_settings():
    """Get application settings"""
    return settings

def validate_filename(filename: str) -> str:
    """
    Validate and sanitize filename
    
    Args:
        filename: Input filename
        
    Returns:
        Sanitized filename
    """
    # Remove path components and sanitize
    filename = os.path.basename(filename)
    
    # Remove dangerous characters
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    
    # Ensure filename is not empty
    if not filename or filename.isspace():
        filename = "unnamed_file"
    
    return filename
