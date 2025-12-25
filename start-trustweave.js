#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🎯 TrustWeave Quick Start');
console.log('========================');

// Start backend
console.log('🔄 Starting backend...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Start frontend
console.log('🔄 Starting frontend...');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down TrustWeave...');
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
});

console.log('🎉 TrustWeave is starting up!');
console.log('📱 Frontend will be available at: http://localhost:5173');
console.log('🔧 Backend API will be available at: http://localhost:3001');
console.log('\nPress Ctrl+C to stop all services');