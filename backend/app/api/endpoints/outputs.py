from fastapi import APIRouter, HTTPException, Path
from fastapi.responses import JSONResponse, FileResponse
import os
import json
from datetime import datetime
from typing import List, Dict, Any
from pathlib import Path as PathLib

from app.config import settings

router = APIRouter()

@router.get("/outputs")
async def list_output_files():
    """
    List all generated output files with metadata
    """
    try:
        output_dir = PathLib(settings.output_dir)
        if not output_dir.exists():
            return JSONResponse(content=[])
        
        files = []
        for file_path in output_dir.glob("*.json"):
            try:
                stat = file_path.stat()
                
                # Try to read file content for metadata
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                
                files.append({
                    "filename": file_path.name,
                    "timestamp": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "size": stat.st_size,
                    "groq_enhanced": content.get("groq_enhanced", False),
                    "lecture_id": content.get("lecture_id", "unknown"),
                    "course": content.get("course", "unknown"),
                    "topic": content.get("topic", "unknown"),
                    "flashcard_count": len(content.get("flashcards", [])),
                    "has_knowledge_map": bool(content.get("knowledge_map")),
                    "content_preview": {
                        "summary": content.get("summary", "")[:100],
                        "difficulty": content.get("difficulty_level", ""),
                        "study_time": content.get("estimated_study_time", "")
                    }
                })
                
            except Exception as e:
                # If file is corrupted or not readable, still list it
                files.append({
                    "filename": file_path.name,
                    "timestamp": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "size": stat.st_size,
                    "error": f"Could not read file: {str(e)}"
                })
        
        # Sort by timestamp (newest first)
        files.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return JSONResponse(content=files)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list output files: {str(e)}")

@router.get("/outputs/{filename}")
async def get_output_file(filename: str = Path(..., description="Output file name")):
    """
    Get specific output file content
    """
    try:
        # Sanitize filename to prevent directory traversal
        safe_filename = os.path.basename(filename)
        if not safe_filename.endswith('.json'):
            raise HTTPException(status_code=400, detail="Only JSON files are accessible")
        
        file_path = os.path.join(settings.output_dir, safe_filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = json.load(f)
        
        return JSONResponse(content=content)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")

@router.get("/outputs/{filename}/download")
async def download_output_file(filename: str = Path(..., description="Output file name")):
    """
    Download output file
    """
    try:
        # Sanitize filename
        safe_filename = os.path.basename(filename)
        if not safe_filename.endswith('.json'):
            raise HTTPException(status_code=400, detail="Only JSON files can be downloaded")
        
        file_path = os.path.join(settings.output_dir, safe_filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            path=file_path,
            filename=safe_filename,
            media_type='application/json'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")

@router.get("/outputs/stats")
async def get_output_stats():
    """
    Get processing statistics
    """
    try:
        output_dir = PathLib(settings.output_dir)
        if not output_dir.exists():
            return JSONResponse(content={
                "total_files": 0,
                "groq_enhanced_files": 0,
                "success_rate": 0,
                "recent_activity": []
            })
        
        files = list(output_dir.glob("*.json"))
        groq_files = 0
        recent_activity = []
        
        for file_path in files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                
                if content.get("groq_enhanced", False):
                    groq_files += 1
                
                # Add to recent activity
                stat = file_path.stat()
                recent_activity.append({
                    "filename": file_path.name,
                    "timestamp": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "groq_enhanced": content.get("groq_enhanced", False),
                    "course": content.get("course", "unknown"),
                    "topic": content.get("topic", "unknown")
                })
                
            except Exception:
                # Skip corrupted files
                continue
        
        # Sort recent activity by timestamp
        recent_activity.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return JSONResponse(content={
            "total_files": len(files),
            "groq_enhanced_files": groq_files,
            "success_rate": (groq_files / len(files) * 100) if len(files) > 0 else 0,
            "recent_activity": recent_activity[:10]
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@router.delete("/outputs/{filename}")
async def delete_output_file(filename: str = Path(..., description="Output file name")):
    """
    Delete specific output file
    """
    try:
        # Sanitize filename
        safe_filename = os.path.basename(filename)
        if not safe_filename.endswith('.json'):
            raise HTTPException(status_code=400, detail="Only JSON files can be deleted")
        
        file_path = os.path.join(settings.output_dir, safe_filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        os.remove(file_path)
        
        return JSONResponse(content={"message": f"File {safe_filename} deleted successfully"})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
