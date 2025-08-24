"""
Groq AI Service for processing OCR/CV JSON data
Transforms raw extracted data into educational content
"""

import json
import logging
from typing import Dict, List, Any, Optional
from groq import Groq
from app.config import settings

logger = logging.getLogger(__name__)

class GroqService:
    """Service for processing educational content with Groq AI"""
    
    def __init__(self):
        """Initialize Groq client with API key"""
        if not settings.groq_api_key:
            logger.warning("Groq API key not configured - service will use mock responses")
            self.client = None
        else:
            try:
                self.client = Groq(api_key=settings.groq_api_key)
                logger.info("Groq client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                self.client = None
    
    def is_available(self) -> bool:
        """Check if Groq service is available"""
        return self.client is not None
    
    async def enhance_ocr_content(self, ocr_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance OCR content with AI-generated educational materials
        
        Args:
            ocr_data: Raw OCR data with extracted text and diagrams
            
        Returns:
            Enhanced data with flashcards, summaries, and structured content
        """
        if not self.is_available():
            logger.info("Groq not available, returning enhanced mock data")
            return self._generate_mock_enhanced_content(ocr_data)
        
        try:
            # Extract text content for processing
            text_content = self._extract_text_from_ocr(ocr_data)
            
            if not text_content.strip():
                logger.warning("No text content found in OCR data")
                return self._generate_mock_enhanced_content(ocr_data)
            
            # Generate enhanced content using Groq
            enhanced_content = await self._process_with_groq(text_content, ocr_data)
            
            # Merge with original OCR data
            result = {
                **ocr_data,
                "groq_enhanced": True,
                "flashcards": enhanced_content.get("flashcards", []),
                "summary": enhanced_content.get("summary", ""),
                "key_concepts": enhanced_content.get("key_concepts", []),
                "study_questions": enhanced_content.get("study_questions", []),
                "knowledge_map": enhanced_content.get("knowledge_map", {}),
                "difficulty_level": enhanced_content.get("difficulty_level", "intermediate"),
                "estimated_study_time": enhanced_content.get("estimated_study_time", "15-20 minutes")
            }
            
            logger.info(f"Successfully enhanced content with {len(result.get('flashcards', []))} flashcards")
            return result
            
        except Exception as e:
            logger.error(f"Error enhancing content with Groq: {e}")
            return self._generate_mock_enhanced_content(ocr_data)
    
    def _extract_text_from_ocr(self, ocr_data: Dict[str, Any]) -> str:
        """Extract all text content from OCR data"""
        texts = []
        
        for item in ocr_data.get("content", []):
            if item.get("type") in ["text", "heading"] and item.get("text"):
                texts.append(item["text"])
        
        return "\n".join(texts)
    
    async def _process_with_groq(self, text_content: str, ocr_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process content using Groq AI"""
        
        # Create prompt for educational content generation
        prompt = self._create_educational_prompt(text_content, ocr_data)
        
        try:
            # Call Groq API
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Use Groq's latest model
                messages=[
                    {"role": "system", "content": "You are an educational AI assistant that creates high-quality learning materials from student notes."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Parse response
            result = json.loads(response.choices[0].message.content)
            logger.info("Successfully processed content with Groq AI")
            return result
            
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            raise
    
    def _create_educational_prompt(self, text_content: str, ocr_data: Dict[str, Any]) -> str:
        """Create prompt for Groq AI processing"""
        
        course = ocr_data.get("course", "General Studies")
        topic = ocr_data.get("topic", "Unknown Topic")
        
        prompt = f"""
        I have extracted the following text from a student's handwritten notes for {course} on the topic of {topic}:

        EXTRACTED TEXT:
        {text_content}

        Please create comprehensive educational content based on these notes. Return a JSON object with the following structure:

        {{
            "flashcards": [
                {{"question": "Question based on the content", "answer": "Clear, concise answer", "category": "concept/definition/calculation/etc"}},
                // Generate 4-8 flashcards covering key concepts
            ],
            "summary": "2-3 sentence summary of the main concepts covered",
            "key_concepts": ["concept1", "concept2", "concept3"], // 3-5 key terms or ideas
            "study_questions": [
                "Discussion question 1",
                "Analysis question 2", 
                "Application question 3"
            ], // 3-4 deeper study questions
            "knowledge_map": {{
                "nodes": [
                    {{"id": "main_topic", "label": "{topic}", "type": "main"}},
                    {{"id": "concept1", "label": "Key Concept 1", "type": "concept"}},
                    {{"id": "concept2", "label": "Key Concept 2", "type": "concept"}}
                ],
                "edges": [
                    {{"from": "main_topic", "to": "concept1", "label": "includes"}},
                    {{"from": "main_topic", "to": "concept2", "label": "includes"}}
                ]
            }},
            "difficulty_level": "beginner/intermediate/advanced",
            "estimated_study_time": "X-Y minutes"
        }}

        Guidelines:
        - Make flashcards clear and testable
        - Ensure content is academically accurate
        - Use appropriate terminology for the subject
        - Create meaningful connections in the knowledge map
        - Estimate realistic study time
        """
        
        return prompt
    
    def _generate_mock_enhanced_content(self, ocr_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock enhanced content when Groq is not available"""
        
        course = ocr_data.get("course", "General Studies")
        topic = ocr_data.get("topic", "Study Notes")
        
        # Extract some text for mock generation
        text_items = [item.get("text", "") for item in ocr_data.get("content", []) 
                     if item.get("type") in ["text", "heading"] and item.get("text")]
        
        mock_content = {
            **ocr_data,
            "groq_enhanced": False,
            "flashcards": [
                {
                    "question": f"What is the main topic of these notes about {topic}?",
                    "answer": f"The notes cover key concepts related to {topic} in the context of {course}.",
                    "category": "comprehension"
                },
                {
                    "question": f"What are the key learning objectives for {topic}?",
                    "answer": "Understanding the fundamental principles and their practical applications.",
                    "category": "objectives"
                }
            ],
            "summary": f"These notes cover important concepts in {topic} as part of {course} studies, providing foundational knowledge for further learning.",
            "key_concepts": [topic, "Key Principles", "Applications", "Examples"],
            "study_questions": [
                f"How does {topic} relate to other concepts in {course}?",
                "What are the real-world applications of these concepts?",
                "How can this knowledge be applied to solve practical problems?"
            ],
            "knowledge_map": {
                "nodes": [
                    {"id": "main", "label": topic, "type": "main"},
                    {"id": "concept1", "label": "Key Concept", "type": "concept"},
                    {"id": "application", "label": "Applications", "type": "application"}
                ],
                "edges": [
                    {"from": "main", "to": "concept1", "label": "includes"},
                    {"from": "concept1", "to": "application", "label": "leads to"}
                ]
            },
            "difficulty_level": "intermediate",
            "estimated_study_time": "15-20 minutes"
        }
        
        logger.info("Generated mock enhanced content")
        return mock_content

# Global service instance
groq_service = GroqService()
