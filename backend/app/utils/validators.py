import re
from typing import List, Optional
from fastapi import HTTPException

def validate_lecture_id(lecture_id: str) -> str:
    """
    Validate lecture ID format
    
    Args:
        lecture_id: Lecture identifier
        
    Returns:
        Validated lecture ID
        
    Raises:
        HTTPException: If invalid format
    """
    pattern = r'^[a-zA-Z0-9_-]+$'
    if not re.match(pattern, lecture_id):
        raise HTTPException(
            status_code=400, 
            detail="Lecture ID must contain only alphanumeric characters, underscores, and hyphens"
        )
    
    if len(lecture_id) > 50:
        raise HTTPException(
            status_code=400, 
            detail="Lecture ID must be 50 characters or less"
        )
    
    return lecture_id

def validate_course_name(course: str) -> str:
    """
    Validate course name
    
    Args:
        course: Course name
        
    Returns:
        Validated course name
        
    Raises:
        HTTPException: If invalid
    """
    if len(course.strip()) == 0:
        raise HTTPException(status_code=400, detail="Course name cannot be empty")
    
    if len(course) > 100:
        raise HTTPException(
            status_code=400, 
            detail="Course name must be 100 characters or less"
        )
    
    return course.strip()

def validate_topic(topic: str) -> str:
    """
    Validate topic name
    
    Args:
        topic: Topic name
        
    Returns:
        Validated topic name
        
    Raises:
        HTTPException: If invalid
    """
    if len(topic.strip()) == 0:
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    
    if len(topic) > 200:
        raise HTTPException(
            status_code=400, 
            detail="Topic must be 200 characters or less"
        )
    
    return topic.strip()

def validate_date_format(date_str: str) -> str:
    """
    Validate date format (YYYY-MM-DD)
    
    Args:
        date_str: Date string
        
    Returns:
        Validated date string
        
    Raises:
        HTTPException: If invalid format
    """
    pattern = r'^\d{4}-\d{2}-\d{2}$'
    if not re.match(pattern, date_str):
        raise HTTPException(
            status_code=400, 
            detail="Date must be in YYYY-MM-DD format"
        )
    
    return date_str

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe storage
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Remove or replace invalid characters
    sanitized = re.sub(r'[^\w\-_\.]', '_', filename)
    
    # Limit length
    if len(sanitized) > 255:
        name, ext = os.path.splitext(sanitized)
        sanitized = name[:255-len(ext)] + ext
    
    return sanitized

def validate_content_type(content_type: str, allowed_types: List[str]) -> bool:
    """
    Validate content type
    
    Args:
        content_type: MIME content type
        allowed_types: List of allowed content types
        
    Returns:
        True if valid, False otherwise
    """
    return content_type.lower() in [t.lower() for t in allowed_types]
