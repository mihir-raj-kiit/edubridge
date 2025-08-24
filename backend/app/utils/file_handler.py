import aiofiles
import tempfile
import shutil
import json
import os
from typing import Dict, Any
from fastapi import UploadFile
from app.config import settings

async def create_temp_file(upload_file: UploadFile) -> str:
    """
    Create a temporary file from uploaded file
    
    Args:
        upload_file: FastAPI UploadFile object
        
    Returns:
        Path to temporary file
    """
    # Get file extension
    file_ext = os.path.splitext(upload_file.filename or "")[1] or ".jpg"
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
        # Copy uploaded file content to temporary file
        shutil.copyfileobj(upload_file.file, tmp)
        temp_path = tmp.name
    
    return temp_path

async def save_output_json(data: Dict[Any, Any], filename: str) -> str:
    """
    Save output data as JSON file
    
    Args:
        data: Data to save
        filename: Output filename
        
    Returns:
        Path to saved file
    """
    output_path = os.path.join(settings.output_dir, filename)
    
    async with aiofiles.open(output_path, 'w', encoding='utf-8') as f:
        await f.write(json.dumps(data, indent=4, ensure_ascii=False))
    
    return output_path

def cleanup_temp_files(temp_dir: str = None) -> None:
    """
    Clean up temporary files
    
    Args:
        temp_dir: Specific directory to clean, defaults to system temp
    """
    if temp_dir and os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)

def ensure_directories() -> None:
    """Ensure required directories exist"""
    os.makedirs(settings.upload_dir, exist_ok=True)
    os.makedirs(settings.output_dir, exist_ok=True)

def get_file_info(file_path: str) -> Dict[str, Any]:
    """
    Get file information
    
    Args:
        file_path: Path to file
        
    Returns:
        Dictionary with file information
    """
    if not os.path.exists(file_path):
        return {}
    
    stat = os.stat(file_path)
    return {
        "size": stat.st_size,
        "created": stat.st_ctime,
        "modified": stat.st_mtime,
        "extension": os.path.splitext(file_path)[1].lower()
    }
