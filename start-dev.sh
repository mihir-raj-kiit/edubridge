#!/bin/bash

echo "🚀 EduBridge Development Environment"
echo "======================================"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check if Python is available
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.8+ from https://python.org"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Install backend dependencies if needed
if [ ! -d "backend/__pycache__" ]; then
    echo "🐍 Installing backend dependencies..."
    cd backend
    pip install -r requirements.txt
    cd ..
fi

echo ""
echo "🎯 Starting development servers..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev:full
