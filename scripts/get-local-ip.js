import fs from 'fs/promises';
import { networkInterfaces } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lấy local IP address của máy (Wi-Fi hoặc Ethernet)
 */
function getLocalIP() {
  const networks = networkInterfaces();
  
  // Prioritize Wi-Fi over Ethernet, then other connections
  const priorityOrder = ['Wi-Fi', 'Ethernet', 'en0', 'eth0'];
  
  for (const networkName of priorityOrder) {
    const network = networks[networkName];
    if (network) {
      for (const details of network) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (details.family === 'IPv4' && !details.internal) {
          return details.address;
        }
      }
    }
  }
  
  // Fallback: find first available IPv4 address
  for (const networkName in networks) {
    const network = networks[networkName];
    for (const details of network) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
  
  return 'localhost'; // Fallback
}

/**
 * Cập nhật EXPO_PUBLIC_BACKEND_URL trong file .env
 */
async function updateEnvFile(ip) {
  const envPath = path.join(__dirname, '../.env');
  
  try {
    const envContent = await fs.readFile(envPath, 'utf8');
    const backendUrl = `http://${ip}:3000`;
    
    // Regex để tìm và thay thế EXPO_PUBLIC_BACKEND_URL
    const updatedContent = envContent.replace(
      /^EXPO_PUBLIC_BACKEND_URL=.*/m,
      `EXPO_PUBLIC_BACKEND_URL=${backendUrl}`
    );
    
    await fs.writeFile(envPath, updatedContent, 'utf8');
    
    console.log(`✅ Updated .env file:`);
    console.log(`   EXPO_PUBLIC_BACKEND_URL=${backendUrl}`);
    return backendUrl;
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    return null;
  }
}

/**
 * Tạo file backend-config.json với thông tin IP hiện tại
 */
async function createBackendConfig(ip, backendUrl) {
  const configPath = path.join(__dirname, '../backend-config.json');
  
  const config = {
    ip: ip,
    backendUrl: backendUrl,
    port: 3000,
    lastUpdated: new Date().toISOString(),
    platform: process.platform
  };
  
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`✅ Created backend-config.json with IP: ${ip}`);
  } catch (error) {
    console.error('❌ Error creating backend config:', error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Detecting local IP address...');
  
  const localIP = getLocalIP();
  console.log(`📍 Detected IP: ${localIP}`);
  
  const backendUrl = await updateEnvFile(localIP);
  
  if (backendUrl) {
    await createBackendConfig(localIP, backendUrl);
    console.log('\n🎉 Backend IP configuration updated successfully!');
    console.log('💡 Please restart your Expo development server for changes to take effect.');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { createBackendConfig, getLocalIP, updateEnvFile };
