
import os
import tempfile
import shutil
import json
import aiofiles
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import UploadFile, HTTPException
from datetime import datetime

from app.config import settings

async def create_temp_file(file: UploadFile) -> str:
    """
    Create a temporary file from uploaded file
    
    Args:
        file: Uploaded file object
        
    Returns:
        Path to temporary file
    """
    try:
        # Create temporary file
        suffix = Path(file.filename).suffix if file.filename else '.tmp'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = temp_file.name
            
            # Copy uploaded file content to temp file
            content = await file.read()
            temp_file.write(content)
            
        return temp_path
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create temporary file: {str(e)}")

async def save_output_json(data: Dict[str, Any], filename: str) -> str:
    """
    Save JSON data to output directory
    
    Args:
        data: Data to save as JSON
        filename: Output filename
        
    Returns:
        Path to saved file
    """
    try:
        output_dir = Path(settings.output_dir)
        output_dir.mkdir(exist_ok=True)
        
        output_path = output_dir / filename
        
        # Save JSON file
        async with aiofiles.open(output_path, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(data, indent=2, ensure_ascii=False))
        
        return str(output_path)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save output file: {str(e)}")

def cleanup_temp_file(file_path: str) -> None:
    """
    Clean up temporary file
    
    Args:
        file_path: Path to temporary file
    """
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
    except Exception:
        pass  # Ignore cleanup errors

def get_output_files() -> Dict[str, Any]:
    """
    Get list of output files with metadata
    
    Returns:
        Dictionary with file information
    """
    try:
        output_dir = Path(settings.output_dir)
        if not output_dir.exists():
            return {"files": [], "count": 0}
        
        files = []
        for file_path in output_dir.glob("*.json"):
            stat = file_path.stat()
            files.append({
                "filename": file_path.name,
                "size": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
        
        # Sort by creation time (newest first)
        files.sort(key=lambda x: x["created"], reverse=True)
        
        return {
            "files": files,
            "count": len(files),
            "directory": str(output_dir)
        }
        
    except Exception as e:
        return {
            "files": [],
            "count": 0,
            "error": str(e)
        }

async def get_output_file_content(filename: str) -> Optional[Dict[str, Any]]:
    """
    Get content of output file
    
    Args:
        filename: Name of the output file
        
    Returns:
        File content as dictionary or None if not found
    """
    try:
        output_dir = Path(settings.output_dir)
        file_path = output_dir / filename
        
        if not file_path.exists():
            return None
        
        async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
            content = await f.read()
            return json.loads(content)
            
    except Exception:
        return None
