import cv2
import easyocr
import json
import os
from datetime import datetime
from spellchecker import SpellChecker
from typing import Optional, Dict, Any, List
from app.config import settings
from app.core.image_processor import ImageProcessor

# Initialize OCR reader
try:
    reader = easyocr.Reader(settings.ocr_languages, recog_network='english_g2')
except Exception:
    reader = easyocr.Reader(settings.ocr_languages)

# Initialize spell checker
spell = SpellChecker()

# Initialize image processor
processor = ImageProcessor()

def correct_spelling(text: str) -> str:
    """
    Correct spelling errors in extracted text
    
    Args:
        text: Input text with potential spelling errors
        
    Returns:
        Text with corrected spelling
    """
    if not settings.enable_spell_correction:
        return text
    
    words = text.split()
    corrected = []
    
    for word in words:
        # Only correct alphabetic words that aren't all uppercase
        if word.isalpha() and not word.isupper():
            fixed = spell.correction(word)
            corrected.append(fixed if fixed else word)
        else:
            corrected.append(word)
    
    return " ".join(corrected)

def extract_text_with_confidence(image_path: str) -> List[Dict[str, Any]]:
    """
    Extract text with confidence scores
    
    Args:
        image_path: Path to the image file
        
    Returns:
        List of extracted text with confidence scores
    """
    # Validate and load image
    image = processor.validate_image(image_path)
    if image is None:
        return []
    
    # Enhance image quality
    enhanced = processor.enhance_image_quality(image)
    
    # Preprocess for OCR
    processed = processor.preprocess_for_ocr(enhanced)
    
    # Run OCR with confidence scores
    try:
        results = reader.readtext(
            processed, 
            detail=True,  # Get confidence scores
            paragraph=True,
            contrast_ths=0.1, 
            adjust_contrast=0.7, 
            decoder='greedy'
        )
    except TypeError:
        # Fallback for older EasyOCR versions
        results = reader.readtext(processed, detail=True, paragraph=True)
    
    # Process results
    extracted_texts = []
    for bbox, text, confidence in results:
        if confidence >= settings.ocr_confidence_threshold:
            corrected_text = correct_spelling(text.strip())
            if corrected_text:
                extracted_texts.append({
                    "text": corrected_text,
                    "confidence": float(confidence),
                    "bbox": bbox
                })
    
    return extracted_texts

def classify_content_type(text: str) -> str:
    """
    Classify extracted text as heading or regular text
    
    Args:
        text: Extracted text
        
    Returns:
        Content type: 'heading' or 'text'
    """
    # Simple heuristic: if text is mostly uppercase, treat as heading
    if text.isupper() and len(text) > 3:
        return "heading"
    
    # Check for heading patterns
    heading_indicators = ["CHAPTER", "SECTION", "PART", "UNIT", "LESSON"]
    text_upper = text.upper()
    
    if any(indicator in text_upper for indicator in heading_indicators):
        return "heading"
    
    return "text"

def process_image(image_path: str, output_file: Optional[str] = "notes.json") -> Optional[Dict[str, Any]]:
    """
    Process image and extract structured notes
    
    Args:
        image_path: Path to the image file
        output_file: Output JSON file path (None to skip saving)
        
    Returns:
        Structured notes data or None if processing fails
    """
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return None
    
    # Extract text with confidence
    extracted_texts = extract_text_with_confidence(image_path)
    
    if not extracted_texts:
        print("⚠️ No text detected in the image")
        return None
    
    print("Detected text blocks:")
    for item in extracted_texts:
        print(f"- {item['text']} (confidence: {item['confidence']:.2f})")
    
    # Create structured notes
    notes_data = {
        "lecture_id": "lec_001",
        "course": "Operating Systems",
        "topic": "Process Management",
        "date": datetime.today().strftime("%Y-%m-%d"),
        "content": []
    }
    
    # Process extracted texts
    for item in extracted_texts:
        text = item["text"]
        content_type = classify_content_type(text)
        
        notes_data["content"].append({
            "type": content_type,
            "text": text,
            "confidence": item["confidence"]
        })
    
    # Save to file if output_file is specified
    if output_file:
        try:
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(notes_data, f, indent=4, ensure_ascii=False)
            print(f"✅ Structured notes saved to {output_file}")
        except Exception as e:
            print(f"❌ Failed to save output file: {e}")
    
    return notes_data

def process_image_advanced(
    image_path: str, 
    lecture_id: str = "lec_001",
    course: str = "Operating Systems",
    topic: str = "Process Management",
    output_file: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Advanced image processing with custom metadata
    
    Args:
        image_path: Path to the image file
        lecture_id: Custom lecture identifier
        course: Course name
        topic: Topic name
        output_file: Output JSON file path (None to skip saving)
        
    Returns:
        Structured notes data or None if processing fails
    """
    if not os.path.exists(image_path):
        return None
    
    # Extract text with confidence
    extracted_texts = extract_text_with_confidence(image_path)
    
    if not extracted_texts:
        return None
    
    # Create structured notes with custom metadata
    notes_data = {
        "lecture_id": lecture_id,
        "course": course,
        "topic": topic,
        "date": datetime.today().strftime("%Y-%m-%d"),
        "content": []
    }
    
    # Process extracted texts
    for item in extracted_texts:
        text = item["text"]
        content_type = classify_content_type(text)
        
        notes_data["content"].append({
            "type": content_type,
            "text": text,
            "confidence": item["confidence"]
        })
    
    # Save to file if output_file is specified
    if output_file:
        try:
            output_path = os.path.join(settings.output_dir, output_file)
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(notes_data, f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"❌ Failed to save output file: {e}")
    
    return notes_data

if __name__ == "__main__":
    # Example usage
    result = process_image(r"C:\Users\KIIT0001\Pictures\mihir_notes.jpg")
    if result:
        print("✅ Processing completed successfully")
    else:
        print("❌ Processing failed")
