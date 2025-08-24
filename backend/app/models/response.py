
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class OCRTextItem(BaseModel):
    """Individual OCR text item"""
    type: str = Field(..., description="Type of content (text, heading)")
    text: str = Field(..., description="Extracted text")
    confidence: float = Field(..., ge=0.0, le=1.0, description="OCR confidence score")
    bbox: Optional[List[List[int]]] = Field(None, description="Bounding box coordinates")

class DiagramBox(BaseModel):
    """Diagram bounding box"""
    x: int = Field(..., description="X coordinate")
    y: int = Field(..., description="Y coordinate") 
    w: int = Field(..., description="Width")
    h: int = Field(..., description="Height")
    shape: Optional[str] = Field(None, description="Detected shape type")
    confidence: Optional[float] = Field(None, description="Detection confidence")

class DiagramContent(BaseModel):
    """Diagram content structure"""
    type: str = Field(default="diagram", description="Content type")
    title: str = Field(..., description="Diagram title")
    description: str = Field(..., description="Diagram description")
    nodes: List[Dict[str, Any]] = Field(default_factory=list, description="Diagram nodes")
    connections: List[Dict[str, Any]] = Field(default_factory=list, description="Diagram connections")
    boxes: List[DiagramBox] = Field(..., description="Detected bounding boxes")

class FlashCard(BaseModel):
    """Flashcard structure"""
    question: str = Field(..., description="Flashcard question")
    answer: str = Field(..., description="Flashcard answer")
    category: Optional[str] = Field(None, description="Flashcard category")

class KnowledgeMapNode(BaseModel):
    """Knowledge map node"""
    id: str = Field(..., description="Node ID")
    label: str = Field(..., description="Node label")
    type: Optional[str] = Field(None, description="Node type")

class KnowledgeMapEdge(BaseModel):
    """Knowledge map edge"""
    from_node: str = Field(..., alias="from", description="Source node ID")
    to_node: str = Field(..., alias="to", description="Target node ID")
    label: Optional[str] = Field(None, description="Edge label")

class KnowledgeMapData(BaseModel):
    """Knowledge map structure"""
    nodes: List[KnowledgeMapNode] = Field(..., description="Map nodes")
    edges: List[KnowledgeMapEdge] = Field(..., description="Map edges")

class OCRResponse(BaseModel):
    """OCR processing response"""
    lecture_id: str = Field(..., description="Lecture identifier")
    course: str = Field(..., description="Course name")
    topic: str = Field(..., description="Topic name")
    date: str = Field(..., description="Processing date")
    content: List[OCRTextItem] = Field(..., description="Extracted content")

class DiagramResponse(BaseModel):
    """Diagram detection response"""
    lecture_id: str = Field(..., description="Lecture identifier")
    course: str = Field(..., description="Course name")
    topic: str = Field(..., description="Topic name")
    date: str = Field(..., description="Processing date")
    content: List[DiagramContent] = Field(..., description="Detected diagrams")

class ExtractResponse(BaseModel):
    """Combined extraction response with optional AI enhancements"""
    lecture_id: str = Field(..., description="Lecture identifier")
    course: str = Field(..., description="Course name")
    topic: str = Field(..., description="Topic name")
    date: str = Field(..., description="Processing date")
    content: List[Dict[str, Any]] = Field(..., description="Combined content")
    
    # Optional AI enhancements
    groq_enhanced: Optional[bool] = Field(None, description="Whether enhanced by Groq AI")
    flashcards: Optional[List[FlashCard]] = Field(None, description="Generated flashcards")
    summary: Optional[str] = Field(None, description="Content summary")
    key_concepts: Optional[List[str]] = Field(None, description="Key concepts")
    study_questions: Optional[List[str]] = Field(None, description="Study questions")
    knowledge_map: Optional[KnowledgeMapData] = Field(None, description="Knowledge map")
    difficulty_level: Optional[str] = Field(None, description="Difficulty level")
    estimated_study_time: Optional[str] = Field(None, description="Estimated study time")

class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    components: Dict[str, str] = Field(..., description="Component statuses")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ErrorResponse(BaseModel):
    """Error response"""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
