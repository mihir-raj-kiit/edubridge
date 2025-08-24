from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(..., description="Response timestamp")
    version: str = Field(..., description="API version")
    uptime: float = Field(..., description="Service uptime in seconds")
    system_info: Dict[str, Any] = Field(..., description="System information")

class ContentItem(BaseModel):
    """Content item in structured notes"""
    type: str = Field(..., description="Content type: text, heading, diagram")
    text: Optional[str] = Field(None, description="Text content for text/heading types")
    title: Optional[str] = Field(None, description="Title for diagram type")
    description: Optional[str] = Field(None, description="Description for diagram type")
    nodes: Optional[List[Dict]] = Field(default_factory=list, description="Diagram nodes")
    connections: Optional[List[Dict]] = Field(default_factory=list, description="Diagram connections")
    boxes: Optional[List[Dict]] = Field(default_factory=list, description="Bounding boxes for diagrams")

class FlashCard(BaseModel):
    """Flashcard model"""
    question: str = Field(..., description="Flashcard question")
    answer: str = Field(..., description="Flashcard answer")
    category: str = Field(default="general", description="Category/type of flashcard")

class KnowledgeMapNode(BaseModel):
    """Knowledge map node"""
    id: str = Field(..., description="Unique node identifier")
    label: str = Field(..., description="Node label/name")
    type: str = Field(default="concept", description="Node type")

class KnowledgeMapEdge(BaseModel):
    """Knowledge map edge"""
    from_: str = Field(..., alias="from", description="Source node ID")
    to: str = Field(..., description="Target node ID")
    label: str = Field(default="", description="Edge label")

class KnowledgeMapData(BaseModel):
    """Knowledge map structure"""
    nodes: List[KnowledgeMapNode] = Field(default_factory=list, description="Map nodes")
    edges: List[KnowledgeMapEdge] = Field(default_factory=list, description="Map edges")

class BaseNotesResponse(BaseModel):
    """Base response model for structured notes"""
    lecture_id: str = Field(..., description="Lecture identifier")
    course: str = Field(..., description="Course name")
    topic: str = Field(..., description="Topic or subject")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    content: List[ContentItem] = Field(..., description="Structured content items")

    # Groq AI enhancements
    groq_enhanced: bool = Field(default=False, description="Whether content was enhanced by Groq AI")
    flashcards: List[FlashCard] = Field(default_factory=list, description="AI-generated flashcards")
    summary: str = Field(default="", description="AI-generated summary")
    key_concepts: List[str] = Field(default_factory=list, description="Key concepts identified")
    study_questions: List[str] = Field(default_factory=list, description="Study questions")
    knowledge_map: Optional[KnowledgeMapData] = Field(default=None, description="Knowledge map structure")
    difficulty_level: str = Field(default="intermediate", description="Estimated difficulty level")
    estimated_study_time: str = Field(default="15-20 minutes", description="Estimated study time")

class OCRResponse(BaseNotesResponse):
    """Response model for OCR processing"""
    pass

class DiagramResponse(BaseNotesResponse):
    """Response model for diagram detection"""
    pass

class ExtractResponse(BaseNotesResponse):
    """Response model for combined extraction"""
    pass

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")
