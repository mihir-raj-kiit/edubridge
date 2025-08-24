
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import JSONResponse, FileResponse
from typing import Dict, Any
from pathlib import Path

from app.utils.file_handler import get_output_files, get_output_file_content
from app.config import settings

router = APIRouter()

@router.get("/")
async def list_output_files():
    """List all output files"""
    return get_output_files()

@router.get("/stats")
async def get_statistics():
    """Get processing statistics"""
    files_info = get_output_files()
    
    stats = {
        "total_files": files_info["count"],
        "storage_location": files_info.get("directory", "unknown"),
        "file_types": {},
        "recent_files": files_info["files"][:5] if files_info["files"] else []
    }
    
    # Count file types
    for file_info in files_info["files"]:
        filename = file_info["filename"]
        if "ocr_" in filename:
            stats["file_types"]["ocr"] = stats["file_types"].get("ocr", 0) + 1
        elif "diagram_" in filename:
            stats["file_types"]["diagrams"] = stats["file_types"].get("diagrams", 0) + 1
        elif "extract_groq_" in filename:
            stats["file_types"]["ai_enhanced"] = stats["file_types"].get("ai_enhanced", 0) + 1
        else:
            stats["file_types"]["other"] = stats["file_types"].get("other", 0) + 1
    
    return JSONResponse(content=stats)

@router.get("/{filename}")
async def get_output_file(filename: str):
    """Get specific output file content"""
    content = await get_output_file_content(filename)
    
    if content is None:
        raise HTTPException(status_code=404, detail="File not found")
    
    return JSONResponse(content=content)

@router.get("/{filename}/download")
async def download_output_file(filename: str):
    """Download output file"""
    output_dir = Path(settings.output_dir)
    file_path = output_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type='application/json'
    )

@router.delete("/{filename}")
async def delete_output_file(filename: str):
    """Delete output file"""
    output_dir = Path(settings.output_dir)
    file_path = output_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_path.unlink()
        return {"message": f"File {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
