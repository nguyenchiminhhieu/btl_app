#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { createBackendConfig, getLocalIP, updateEnvFile } from './get-local-ip.js';

const execAsync = promisify(exec);

/**
 * Script để tự động cập nhật IP và khởi động backend
 */
async function startBackendWithAutoIP() {
  console.log('🔄 Starting backend with auto IP detection...\n');
  
  try {
    // Step 1: Detect and update IP
    console.log('📍 Step 1: Detecting local IP address...');
    const localIP = getLocalIP();
    console.log(`   Detected IP: ${localIP}`);
    
    // Step 2: Update .env file
    console.log('\n📝 Step 2: Updating .env file...');
    const backendUrl = await updateEnvFile(localIP);
    
    if (!backendUrl) {
      console.error('❌ Failed to update .env file');
      process.exit(1);
    }
    
    // Step 3: Create config file
    console.log('\n📄 Step 3: Creating backend config...');
    await createBackendConfig(localIP, backendUrl);
    
    // Step 4: Start backend server
    console.log('\n🚀 Step 4: Starting backend server...');
    console.log('=' .repeat(50));
    
    // Change to backend directory and start server
    process.chdir('./backend');
    
    // Use spawn for real-time output
    const { spawn } = await import('child_process');
    const backendProcess = spawn('npm', ['start'], {
      stdio: 'inherit',
      shell: true
    });
    
    // Handle process exit
    backendProcess.on('close', (code) => {
      console.log(`\n💤 Backend server exited with code ${code}`);
      process.exit(code);
    });
    
    // Handle CTRL+C
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping backend server...');
      backendProcess.kill('SIGINT');
    });
    
  } catch (error) {
    console.error('❌ Error starting backend:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startBackendWithAutoIP();
}