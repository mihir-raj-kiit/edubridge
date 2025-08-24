#!/usr/bin/env python3
"""
Simple test script to verify image upload and processing works
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.imageOCR import process_image
from app.core.diagram_detector import detect_diagrams_json
import json

def test_image_processing(image_path=None):
    """Test image processing pipeline"""
    
    if not image_path:
        print("❌ No image path provided")
        print("Usage: python test_upload.py <image_path>")
        return False
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return False
    
    print(f"🔍 Testing image processing for: {image_path}")
    
    try:
        # Test OCR processing
        print("\n📝 Testing OCR processing...")
        ocr_result = process_image(image_path, output_file=None)
        
        if ocr_result:
            print("✅ OCR processing successful")
            print(f"📊 Generated content items: {len(ocr_result.get('content', []))}")
            
            # Save OCR result
            with open('test_ocr_output.json', 'w', encoding='utf-8') as f:
                json.dump(ocr_result, f, indent=2, ensure_ascii=False)
            print("💾 OCR result saved to: test_ocr_output.json")
        else:
            print("❌ OCR processing failed")
            return False
        
        # Test diagram detection
        print("\n🔍 Testing diagram detection...")
        diagram_boxes = detect_diagrams_json(image_path)
        
        print(f"✅ Diagram detection successful")
        print(f"📊 Found {len(diagram_boxes)} potential diagrams")
        
        if diagram_boxes:
            for i, box in enumerate(diagram_boxes):
                print(f"  📦 Box {i+1}: {box['w']}x{box['h']} at ({box['x']}, {box['y']}) - {box.get('shape', 'unknown')} shape")
        
        # Create combined result
        combined_result = {
            "lecture_id": ocr_result.get("lecture_id", "test_001"),
            "course": ocr_result.get("course", "Test Course"),
            "topic": ocr_result.get("topic", "Test Topic"),
            "date": ocr_result.get("date"),
            "content": ocr_result.get("content", [])
        }
        
        # Add diagram information if found
        if diagram_boxes:
            combined_result["content"].append({
                "type": "diagram",
                "title": "Detected Diagrams",
                "description": f"Found {len(diagram_boxes)} potential diagrams",
                "nodes": [],
                "connections": [],
                "boxes": diagram_boxes
            })
        
        # Save combined result
        with open('test_combined_output.json', 'w', encoding='utf-8') as f:
            json.dump(combined_result, f, indent=2, ensure_ascii=False)
        print("💾 Combined result saved to: test_combined_output.json")
        
        print("\n🎉 All tests passed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        success = test_image_processing(image_path)
        sys.exit(0 if success else 1)
    else:
        print("Usage: python test_upload.py <image_path>")
        print("Example: python test_upload.py sample_image.jpg")
        sys.exit(1)
