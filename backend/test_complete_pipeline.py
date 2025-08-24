
#!/usr/bin/env python3
"""
Complete pipeline test for StudySync backend
Tests: Image Upload → OCR → Diagram Detection → Groq AI → JSON Output
"""

import requests
import json
import os
import sys
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health check passed: {health_data['status']}")
            
            # Check components
            components = health_data.get('components', {})
            for component, status in components.items():
                emoji = "✅" if status in ["operational", "available"] else "⚠️"
                print(f"   {emoji} {component}: {status}")
            
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_ocr(image_path: str):
    """Test OCR endpoint"""
    print("🔍 Testing OCR endpoint...")
    try:
        if not os.path.exists(image_path):
            print(f"❌ Image file not found: {image_path}")
            return None
        
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/api/ocr", files=files)
        
        if response.status_code == 200:
            ocr_data = response.json()
            print(f"✅ OCR successful: {len(ocr_data.get('content', []))} items extracted")
            return ocr_data
        else:
            print(f"❌ OCR failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ OCR error: {e}")
        return None

def test_diagram_detection(image_path: str):
    """Test diagram detection endpoint"""
    print("🔍 Testing diagram detection...")
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/api/diagram-detect", files=files)
        
        if response.status_code == 200:
            diagram_data = response.json()
            diagrams = diagram_data.get('content', [])
            if diagrams:
                boxes = diagrams[0].get('boxes', [])
                print(f"✅ Diagram detection successful: {len(boxes)} elements found")
            else:
                print("✅ Diagram detection completed: no diagrams found")
            return diagram_data
        else:
            print(f"❌ Diagram detection failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Diagram detection error: {e}")
        return None

def test_complete_extraction(image_path: str):
    """Test complete extraction with Groq AI"""
    print("🔍 Testing complete extraction (OCR + Diagrams + AI)...")
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/api/extract", files=files)
        
        if response.status_code == 200:
            extract_data = response.json()
            print(f"✅ Complete extraction successful")
            
            # Check for AI enhancements
            if extract_data.get('groq_enhanced'):
                flashcards = extract_data.get('flashcards', [])
                summary = extract_data.get('summary', '')
                difficulty = extract_data.get('difficulty_level', 'unknown')
                study_time = extract_data.get('estimated_study_time', 'unknown')
                
                print(f"   🤖 AI Enhanced: {len(flashcards)} flashcards generated")
                print(f"   📊 Difficulty: {difficulty}")
                print(f"   ⏱️  Study time: {study_time}")
                if summary:
                    print(f"   📝 Summary: {summary[:100]}...")
            else:
                print("   📄 Standard processing (AI not available)")
            
            return extract_data
        else:
            print(f"❌ Complete extraction failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Complete extraction error: {e}")
        return None

def test_groq_health():
    """Test Groq AI service health"""
    print("🔍 Testing Groq AI service...")
    try:
        response = requests.get(f"{BASE_URL}/api/groq/health")
        if response.status_code == 200:
            groq_health = response.json()
            available = groq_health.get('groq_available', False)
            status = groq_health.get('service_status', 'unknown')
            
            if available:
                print(f"✅ Groq AI available: {status}")
            else:
                print(f"⚠️  Groq AI not available: {status}")
            
            return groq_health
        else:
            print(f"❌ Groq health check failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Groq health error: {e}")
        return None

def test_outputs():
    """Test output file listing"""
    print("🔍 Testing output file management...")
    try:
        response = requests.get(f"{BASE_URL}/api/outputs")
        if response.status_code == 200:
            outputs = response.json()
            file_count = outputs.get('count', 0)
            print(f"✅ Output files: {file_count} files available")
            
            # Show recent files
            files = outputs.get('files', [])[:3]
            for file_info in files:
                print(f"   📄 {file_info['filename']} ({file_info['size']} bytes)")
            
            return outputs
        else:
            print(f"❌ Output listing failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Output listing error: {e}")
        return None

def main():
    """Run complete pipeline test"""
    print("🧪 StudySync Backend Pipeline Test")
    print("=" * 50)
    
    # Test image path
    test_image = "sample_notes.jpg"  # You should provide a test image
    
    if len(sys.argv) > 1:
        test_image = sys.argv[1]
    
    print(f"📸 Test image: {test_image}")
    print()
    
    # Run tests
    results = {}
    
    # 1. Health check
    results['health'] = test_health()
    print()
    
    # 2. Groq health
    results['groq_health'] = test_groq_health()
    print()
    
    # 3. Individual tests (if image provided)
    if os.path.exists(test_image):
        print(f"📁 Image found: {test_image}")
        print()
        
        results['ocr'] = test_ocr(test_image)
        print()
        
        results['diagrams'] = test_diagram_detection(test_image)
        print()
        
        results['complete'] = test_complete_extraction(test_image)
        print()
    else:
        print(f"⚠️  Test image not found: {test_image}")
        print("   You can specify a different image: python test_complete_pipeline.py your_image.jpg")
        print()
    
    # 4. Output files
    results['outputs'] = test_outputs()
    print()
    
    # Summary
    print("📊 Test Summary")
    print("-" * 20)
    
    passed = sum(1 for result in results.values() if result is not None)
    total = len(results)
    
    print(f"✅ Passed: {passed}/{total} tests")
    
    if passed == total:
        print("🎉 All tests passed! Backend is ready for production.")
    else:
        print("⚠️  Some tests failed. Check the output above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
