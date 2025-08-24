"""
Application Configuration

Centralized configuration management using Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Basic app settings
    APP_NAME: str = "EduBridge Backend"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # Server settings
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://90037a0884fe4f458a68b268e2194f26-15621e91-985b-4b67-aade-a67d0c.fly.dev"
        ],
        env="ALLOWED_ORIGINS"
    )
    
    # File upload settings
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=["image/jpeg", "image/jpg", "image/png", "image/webp"],
        env="ALLOWED_FILE_TYPES"
    )
    
    # OCR settings
    OCR_CONFIDENCE_THRESHOLD: float = Field(default=0.6, env="OCR_CONFIDENCE_THRESHOLD")
    OCR_LANGUAGE: str = Field(default="eng", env="OCR_LANGUAGE")
    
    # AI/ML settings
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    MODEL_NAME: str = Field(default="gpt-3.5-turbo", env="MODEL_NAME")
    
    # Database settings (for future use)
    DATABASE_URL: str = Field(default="sqlite:///./edubridge.db", env="DATABASE_URL")
    
    # Redis settings (for caching, future use)
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # Logging settings
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    # Directory settings
    UPLOAD_DIR: str = Field(default="uploads", env="UPLOAD_DIR")
    OUTPUT_DIR: str = Field(default="outputs", env="OUTPUT_DIR")
    TEMP_DIR: str = Field(default="temp", env="TEMP_DIR")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings"""
    return Settings()
