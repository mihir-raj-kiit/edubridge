# Backend API Documentation

A FastAPI-based backend service for OCR (Optical Character Recognition) and diagram detection from images.

## Features

- **OCR Processing**: Extract text from handwritten notes and documents
- **Diagram Detection**: Automatically detect and locate diagrams/flowcharts in images
- **Spell Correction**: Enhance OCR accuracy with automatic spelling correction
- **JSON Output**: Structured JSON responses for easy frontend integration
- **File Upload**: Support for multiple image formats

## Quick Start

### Prerequisites

- Python 3.8+
- pip or poetry

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Create required directories:
```bash
mkdir -p uploads outputs
```

4. Run the development server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check
- **GET** `/health` - Service health status

### OCR & Processing
- **POST** `/api/ocr` - Extract text from uploaded image
- **POST** `/api/diagram-detect` - Detect diagrams in uploaded image  
- **POST** `/api/extract` - Combined OCR and diagram detection

## Project Structure

```
backend/
├── main.py                    # FastAPI entry point
├── requirements.txt           # Python dependencies
├── .env                      # Environment variables
├── app/                      # Main application package
│   ├── api/                  # API routes
│   ├── core/                 # Core functionality
│   ├── models/               # Pydantic models
│   └── utils/                # Utility functions
├── uploads/                  # Temporary upload directory
├── outputs/                  # Generated JSON outputs
└── tests/                    # Test files
```

## Environment Variables

See `.env` file for configuration options including:
- API server settings
- File upload limits
- OCR configuration
- Diagram detection parameters

## Development

### Running Tests
```bash
pytest tests/
```

### Code Style
```bash
black .
flake8 .
```

## License

MIT License
