from pydantic import BaseModel, Field
from typing import Optional, List

class OCRRequest(BaseModel):
    """Request model for OCR processing"""
    save_output: bool = Field(default=True, description="Whether to save the output JSON file")
    enable_spell_correction: bool = Field(default=True, description="Enable automatic spell correction")
    confidence_threshold: float = Field(default=0.5, ge=0.0, le=1.0, description="OCR confidence threshold")

class DiagramRequest(BaseModel):
    """Request model for diagram detection"""
    save_output: bool = Field(default=True, description="Whether to save the output JSON file")
    min_area: int = Field(default=1000, ge=100, description="Minimum contour area for diagram detection")
    threshold: int = Field(default=150, ge=50, le=255, description="Threshold for image processing")

class ExtractRequest(BaseModel):
    """Request model for combined extraction"""
    save_output: bool = Field(default=True, description="Whether to save the output JSON file")
    enable_spell_correction: bool = Field(default=True, description="Enable automatic spell correction")
    ocr_confidence_threshold: float = Field(default=0.5, ge=0.0, le=1.0, description="OCR confidence threshold")
    diagram_min_area: int = Field(default=1000, ge=100, description="Minimum contour area for diagram detection")
    diagram_threshold: int = Field(default=150, ge=50, le=255, description="Threshold for image processing")
