
#!/usr/bin/env python3
"""
Startup script for StudySync backend with Groq AI integration
"""

import os
import sys
import uvicorn
from pathlib import Path

def check_groq_setup():
    """Check if Groq API key is configured"""
    groq_key = os.getenv("GROQ_API_KEY")
    
    if not groq_key:
        print("⚠️  GROQ_API_KEY not found in environment variables")
        print("🔧 To enable AI features:")
        print("   1. Get API key from https://console.groq.com")
        print("   2. Set environment variable: export GROQ_API_KEY='your_key_here'")
        print("   3. Or add to .env file: GROQ_API_KEY=your_key_here")
        print("📄 Backend will still work with OCR/CV features only\n")
        return False
    else:
        print(f"✅ Groq API key configured: {groq_key[:8]}...")
        print("🤖 AI enhancement features enabled\n")
        return True

def main():
    """Main startup function"""
    print("🚀 Starting StudySync Backend Server")
    print("=" * 50)
    
    # Check Groq setup
    groq_available = check_groq_setup()
    
    # Display server info
    print("📡 Server Configuration:")
    print(f"   Host: 0.0.0.0")
    print(f"   Port: 8000")
    print(f"   Docs: http://localhost:8000/docs")
    print(f"   Health: http://localhost:8000/health")
    print()
    
    print("🎯 Available Endpoints:")
    print("   POST /api/ocr - OCR text extraction")
    print("   POST /api/diagram-detect - Diagram detection")
    print("   POST /api/extract - Combined processing")
    if groq_available:
        print("   POST /api/groq/enhance - AI enhancement")
        print("   GET  /api/groq/health - AI service status")
    print("   GET  /api/outputs - List output files")
    print()
    
    print("🔄 Starting server...")
    print("-" * 50)
    
    # Start server
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
