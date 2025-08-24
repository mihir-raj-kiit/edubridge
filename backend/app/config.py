
from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    api_title: str = "StudySync OCR & AI Processing API"
    api_version: str = "1.0.0"
    debug: bool = True
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    # OCR Configuration
    ocr_languages: List[str] = ["en"]
    ocr_confidence_threshold: float = 0.6
    enable_spell_correction: bool = True
    
    # Image Processing
    diagram_detection_threshold: int = 127
    min_contour_area: float = 500.0
    max_image_size: int = 10 * 1024 * 1024  # 10MB
    
    # File Storage
    output_dir: str = "outputs"
    temp_dir: str = "temp"
    
    # Groq AI Configuration
    groq_api_key: Optional[str] = None
    groq_model: str = "llama-3.3-70b-versatile"
    groq_temperature: float = 0.7
    groq_max_tokens: int = 2000
    
    # CORS Configuration
    cors_origins: List[str] = ["*"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# Global settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get application settings"""
    return settings

# Ensure required directories exist
def setup_directories():
    """Create required directories"""
    Path(settings.output_dir).mkdir(exist_ok=True)
    Path(settings.temp_dir).mkdir(exist_ok=True)

# Initialize directories
setup_directories()
