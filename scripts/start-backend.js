#!/usr/bin/env node

/**
 * Development script to start the backend server
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendDir = path.join(__dirname, '..', 'backend');
const requirementsPath = path.join(backendDir, 'requirements.txt');

console.log('🚀 Starting Backend Development Server...');
console.log('📁 Backend directory:', backendDir);

// Check if backend directory exists
if (!fs.existsSync(backendDir)) {
  console.error('❌ Backend directory not found:', backendDir);
  process.exit(1);
}

// Check if requirements.txt exists
if (!fs.existsSync(requirementsPath)) {
  console.error('❌ requirements.txt not found. Please ensure backend is properly set up.');
  process.exit(1);
}

// Check if Python is available
const pythonCheck = spawn('python', ['--version'], { stdio: 'pipe' });

pythonCheck.on('error', (error) => {
  console.error('❌ Python not found. Please install Python 3.8+ to run the backend.');
  console.error('   Visit: https://www.python.org/downloads/');
  process.exit(1);
});

pythonCheck.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Python check failed. Please ensure Python is installed and in PATH.');
    process.exit(1);
  }

  console.log('✅ Python found');
  startBackend();
});

function startBackend() {
  console.log('📦 Installing Python dependencies...');
  
  // Install dependencies
  const pip = spawn('pip', ['install', '-r', 'requirements.txt'], {
    cwd: backendDir,
    stdio: 'inherit'
  });

  pip.on('error', (error) => {
    console.error('❌ Failed to install dependencies:', error.message);
    console.log('💡 Try manually: cd backend && pip install -r requirements.txt');
    process.exit(1);
  });

  pip.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }

    console.log('✅ Dependencies installed');
    console.log('🚀 Starting FastAPI server...');

    // Start the FastAPI server
    const server = spawn('python', ['-m', 'uvicorn', 'main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'], {
      cwd: backendDir,
      stdio: 'inherit'
    });

    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    });

    server.on('close', (code) => {
      console.log(`🛑 Backend server stopped with code ${code}`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down backend server...');
      server.kill('SIGINT');
      process.exit(0);
    });

    console.log('');
    console.log('🎉 Backend server started successfully!');
    console.log('📡 API available at: http://localhost:8000');
    console.log('📚 API Documentation: http://localhost:8000/docs');
    console.log('❤️  Health Check: http://localhost:8000/health');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
  });
}
