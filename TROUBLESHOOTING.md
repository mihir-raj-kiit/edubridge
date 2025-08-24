# 🔧 Troubleshooting Guide

## Fixed: "Failed to fetch" Error

The original error was caused by the frontend trying to connect to a backend server that wasn't running. Here's what was implemented:

### ✅ What's Fixed:

1. **Enhanced Error Handling**: The frontend now gracefully falls back to mock data when the backend is unavailable
2. **Backend Health Check**: Added automatic detection of whether the backend is running
3. **Better Logging**: Added detailed console logs to help debug API calls
4. **Development Scripts**: Created easy ways to start both frontend and backend servers

### 🚀 How to Start Development:

**Method 1: Quick Start (Both servers)**
```bash
npm install
npm run dev:full
```

**Method 2: Separate Terminals**
```bash
# Terminal 1: Backend
npm run backend

# Terminal 2: Frontend
npm run dev
```

**Method 3: Manual**
```bash
# Start backend manually
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Start frontend (new terminal)
npm run dev
```

### 🎯 Expected Behavior:

- **With Backend**: Image uploads → OCR processing → Real JSON output
- **Without Backend**: Image uploads → Automatic fallback → Mock data
- **No Errors**: The "Failed to fetch" error should no longer occur

### 🔍 Debugging Steps:

1. **Check Backend Status**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check Frontend Console**:
   - Should see: "Backend not available, using mock data" OR
   - Should see: "✅ Got backend response, transforming..."

3. **Verify Image Processing**:
   - Upload an image through the file upload component
   - Check browser developer tools → Console tab
   - Should see processing logs without errors

### 🌐 Port Configuration:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000  
- **API Docs**: http://localhost:8000/docs

### 📁 Key Files Modified:

- `lib/api.ts` - Enhanced error handling and fallback
- `package.json` - Added backend development scripts
- `.env.local` - API URL configuration
- `scripts/start-backend.js` - Backend startup automation

### 🐛 If Problems Persist:

1. **Clear browser cache** and reload
2. **Check browser network tab** for failed requests
3. **Verify Python/Node versions** meet requirements
4. **Run health check**: `curl http://localhost:8000/health`
5. **Check console logs** in both frontend and backend

The app should now work smoothly whether the backend is running or not!
