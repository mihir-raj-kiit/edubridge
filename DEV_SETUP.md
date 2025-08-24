# 🚀 Development Setup Guide

## Quick Start (Frontend + Backend)

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.8+ (for backend)
- **pip** (Python package manager)

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Start Development Environment

**Option A: Start Both (Recommended)**
```bash
# This will start both frontend and backend automatically
npm run dev:full
```

**Option B: Start Separately**
```bash
# Terminal 1: Start Backend
npm run backend

# Terminal 2: Start Frontend  
npm run dev
```

**Option C: Manual Backend Setup**
```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Start backend server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# In another terminal, start frontend
npm run dev
```

## 🌐 Access Points

Once both servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🧪 Testing the Image Processing Flow

1. **Upload an image** through the frontend file upload component
2. **Check console logs** for processing status
3. **Verify JSON output** in browser developer tools

### Expected Flow:
```
Image Upload → Backend OCR/CV Processing → JSON Response → Frontend Display
```

## 🐛 Troubleshooting

### Backend Issues

**"Python not found"**
- Install Python 3.8+ from https://python.org
- Ensure Python is in your PATH

**"pip install fails"**
```bash
# Try upgrading pip
python -m pip install --upgrade pip

# Install with user flag if permissions issue
pip install --user -r requirements.txt
```

**"EasyOCR installation fails"**
```bash
# On Linux, install system dependencies
sudo apt-get update
sudo apt-get install libgl1-mesa-glx libglib2.0-0

# On macOS with M1/M2
pip install --no-deps easyocr
```

**"OpenCV issues"**
```bash
pip install opencv-python-headless
```

### Frontend Issues

**"Failed to fetch" errors**
- Ensure backend is running on port 8000
- Check browser console for detailed errors
- The app will fall back to mock data if backend is unavailable

**CORS errors**
- Make sure backend CORS is configured for localhost:3000
- Check browser network tab for detailed CORS errors

## 📁 Project Structure

```
├── frontend/ (Next.js app)
│   ├── app/
│   ├── components/
│   └── lib/api.ts (API calls)
│
├── backend/ (FastAPI server)
│   ├── main.py (server entry)
│   ├── app/
│   │   ├── api/endpoints/
│   │   ├── core/ (OCR & CV logic)
│   │   └── models/
│   └── requirements.txt
│
└── scripts/
    └── start-backend.js
```

## 🔧 Configuration

### Environment Variables

**Frontend** (.env.local):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (backend/.env):
```bash
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
MAX_FILE_SIZE=10485760
```

## 📈 Development Workflow

1. **Make changes** to frontend or backend code
2. **Hot reload** will automatically update the running servers
3. **Test image uploads** to verify the full pipeline works
4. **Check browser console** and terminal logs for debugging

## 🎯 Next Steps

After setup is complete:
- Upload test images to verify OCR processing
- Check generated JSON in browser developer tools
- Add Groq API integration for enhanced processing
- Deploy to production environment
