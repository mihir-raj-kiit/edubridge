"""
Request Models

Pydantic models for API request validation.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from enum import Enum


class ProcessingMode(str, Enum):
    """Image processing modes"""
    OCR_ONLY = "ocr_only"
    DIAGRAM_ONLY = "diagram_only"
    FULL_ANALYSIS = "full_analysis"


class OCRRequest(BaseModel):
    """Request model for OCR processing"""
    
    mode: ProcessingMode = Field(
        default=ProcessingMode.FULL_ANALYSIS,
        description="Processing mode for the image"
    )
    
    language: Optional[str] = Field(
        default="eng",
        description="OCR language code (e.g., 'eng', 'spa', 'fra')"
    )
    
    confidence_threshold: Optional[float] = Field(
        default=0.6,
        ge=0.0,
        le=1.0,
        description="Minimum confidence threshold for OCR results"
    )
    
    generate_flashcards: bool = Field(
        default=True,
        description="Whether to generate flashcards from extracted text"
    )
    
    generate_knowledge_map: bool = Field(
        default=True,
        description="Whether to generate knowledge map from diagrams"
    )
    
    preprocess_image: bool = Field(
        default=True,
        description="Whether to preprocess image for better OCR results"
    )

    @validator("language")
    def validate_language(cls, v):
        """Validate language code"""
        # Common OCR language codes
        valid_languages = [
            "eng", "spa", "fra", "deu", "ita", "por", "rus", "chi_sim", 
            "chi_tra", "jpn", "kor", "ara", "hin", "tha", "vie"
        ]
        if v not in valid_languages:
            raise ValueError(f"Unsupported language code: {v}")
        return v


class FlashcardGenerationRequest(BaseModel):
    """Request model for generating flashcards from text"""
    
    text: str = Field(
        ...,
        min_length=10,
        description="Text content to generate flashcards from"
    )
    
    num_flashcards: Optional[int] = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of flashcards to generate"
    )
    
    difficulty_level: Optional[str] = Field(
        default="medium",
        description="Difficulty level: easy, medium, hard"
    )
    
    subject: Optional[str] = Field(
        default="general",
        description="Subject area for the flashcards"
    )

    @validator("difficulty_level")
    def validate_difficulty(cls, v):
        """Validate difficulty level"""
        valid_levels = ["easy", "medium", "hard"]
        if v.lower() not in valid_levels:
            raise ValueError(f"Invalid difficulty level: {v}")
        return v.lower()


class KnowledgeMapRequest(BaseModel):
    """Request model for generating knowledge maps"""
    
    concepts: List[str] = Field(
        ...,
        min_items=2,
        description="List of concepts to include in the knowledge map"
    )
    
    relationships: Optional[List[dict]] = Field(
        default=None,
        description="Optional predefined relationships between concepts"
    )
    
    layout_style: Optional[str] = Field(
        default="hierarchical",
        description="Layout style: hierarchical, circular, force_directed"
    )

    @validator("layout_style")
    def validate_layout_style(cls, v):
        """Validate layout style"""
        valid_styles = ["hierarchical", "circular", "force_directed", "grid"]
        if v.lower() not in valid_styles:
            raise ValueError(f"Invalid layout style: {v}")
        return v.lower()
