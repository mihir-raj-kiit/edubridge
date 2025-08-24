#!/usr/bin/env python3
"""
Enhanced backend startup script with Groq AI integration
"""

import os
import sys
import uvicorn
from pathlib import Path

def check_groq_setup():
    """Check if Groq is properly configured"""
    groq_key = os.getenv('GROQ_API_KEY')
    
    if not groq_key or groq_key == 'your_groq_api_key_here':
        print("⚠️  Groq API key not configured")
        print("   📝 To enable AI enhancements:")
        print("   1. Get API key from https://console.groq.com")
        print("   2. Add to backend/.env: GROQ_API_KEY=your_key_here")
        print("   3. Restart server")
        print()
        print("   🎭 Server will run with mock AI responses")
        return False
    else:
        print("✅ Groq API key configured")
        return True

def main():
    """Start the enhanced backend server"""
    print("🚀 Starting EduBridge Backend with Groq AI Integration")
    print("=" * 60)
    
    # Check Python requirements
    try:
        import groq
        print("✅ Groq SDK installed")
    except ImportError:
        print("❌ Groq SDK not found")
        print("   Run: pip install -r requirements.txt")
        sys.exit(1)
    
    # Check environment setup
    env_file = Path('.env')
    if env_file.exists():
        print("✅ Environment file found")
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv()
    else:
        print("⚠️  No .env file found - using defaults")
    
    # Check Groq configuration
    groq_available = check_groq_setup()
    
    # Startup information
    print()
    print("📡 Server Configuration:")
    print(f"   • Host: {os.getenv('API_HOST', '0.0.0.0')}")
    print(f"   • Port: {os.getenv('API_PORT', '8000')}")
    print(f"   • Debug: {os.getenv('DEBUG', 'True')}")
    print(f"   • Groq AI: {'✅ Enabled' if groq_available else '🎭 Mock Mode'}")
    print()
    
    print("🔗 Available Endpoints:")
    print("   • Health Check: http://localhost:8000/health")
    print("   • OCR + AI: http://localhost:8000/api/extract")
    print("   • Groq Health: http://localhost:8000/api/groq/health")
    print("   • API Docs: http://localhost:8000/docs")
    print()
    
    print("🎯 Complete Flow Ready:")
    print("   Image → OCR/CV → JSON → Groq AI → Enhanced Output")
    print()
    
    # Start server
    print("⚡ Starting server...")
    uvicorn.run(
        "main:app",
        host=os.getenv('API_HOST', '0.0.0.0'),
        port=int(os.getenv('API_PORT', '8000')),
        reload=os.getenv('API_RELOAD', 'True').lower() == 'true',
        log_level="info"
    )

if __name__ == "__main__":
    main()
