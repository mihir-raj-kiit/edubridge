# 🚀 Backend Startup Guide

## Quick Start for Image → JSON Processing

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Backend Server
```bash
# Option 1: Using the run script
python run_server.py

# Option 2: Using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Test the Backend
```bash
# Test with a sample image
python test_upload.py path/to/your/image.jpg
```

## 📡 API Endpoints

Once running at `http://localhost:8000`:

- **Health Check**: `GET /health`
- **OCR Processing**: `POST /api/ocr` (upload image file)
- **Diagram Detection**: `POST /api/diagram-detect` (upload image file)
- **Combined Processing**: `POST /api/extract` (upload image file)
- **API Documentation**: `http://localhost:8000/docs`

## 🔄 Image Processing Flow

```
Image Upload → OCR Text Extraction → Diagram Detection → JSON Output
```

### Example JSON Output:
```json
{
  "lecture_id": "lec_001",
  "course": "Operating Systems",
  "topic": "Process Management", 
  "date": "2024-01-18",
  "content": [
    {
      "type": "heading",
      "text": "PROCESS MANAGEMENT",
      "confidence": 0.95
    },
    {
      "type": "text", 
      "text": "A process is a program in execution...",
      "confidence": 0.87
    },
    {
      "type": "diagram",
      "title": "Detected Diagrams",
      "boxes": [
        {"x": 100, "y": 200, "w": 300, "h": 150, "shape": "rectangle"}
      ]
    }
  ]
}
```

## 🧪 Testing with curl

```bash
# Test OCR endpoint
curl -X POST "http://localhost:8000/api/ocr" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_image.jpg"

# Test health endpoint
curl http://localhost:8000/health
```

## 🔧 Configuration

Edit `backend/.env` to customize:
- Upload file size limits
- OCR confidence thresholds  
- Diagram detection parameters
- Output directories

## 📁 Output Files

Generated JSON files are saved in:
- `backend/outputs/` - Processed results
- Check `test_ocr_output.json` and `test_combined_output.json` after testing

## 🐛 Troubleshooting

**Import Errors**: Make sure you're in the backend directory and dependencies are installed
**File Upload Issues**: Check file size (max 10MB) and format (JPG, PNG, WEBP)
**OCR Not Working**: Verify EasyOCR installation: `pip install easyocr`
**OpenCV Issues**: Install system dependencies: `apt-get install libgl1-mesa-glx` (Linux)

## 🔗 Frontend Connection

The frontend at `http://localhost:3000` should automatically connect to this backend. Make sure both are running simultaneously.
