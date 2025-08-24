import os
from typing import List, Optional
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings

class Settings(BaseSettings):
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_reload: bool = True
    debug: bool = True

    # Upload Configuration
    max_file_size: int = 10485760  # 10MB
    allowed_extensions: List[str] = [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"]
    upload_dir: str = "uploads"
    output_dir: str = "outputs"

    # OCR Configuration
    ocr_languages: List[str] = ["en"]
    ocr_confidence_threshold: float = 0.5
    enable_spell_correction: bool = True

    # Diagram Detection Configuration
    min_contour_area: int = 1000
    diagram_detection_threshold: int = 150

    # Groq AI Configuration
    groq_api_key: Optional[str] = None
    groq_model: str = "llama-3.3-70b-versatile"
    groq_temperature: float = 0.7
    groq_max_tokens: int = 2000
    enable_groq_processing: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

# Ensure directories exist
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.output_dir, exist_ok=True)
