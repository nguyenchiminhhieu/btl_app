import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import { networkInterfaces } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Get local IP address for displaying server info
 */
function getLocalIP() {
  const networks = networkInterfaces();
  
  // Prioritize Wi-Fi over Ethernet
  const priorityOrder = ['Wi-Fi', 'Ethernet', 'en0', 'eth0'];
  
  for (const networkName of priorityOrder) {
    const network = networks[networkName];
    if (network) {
      for (const details of network) {
        if (details.family === 'IPv4' && !details.internal) {
          return details.address;
        }
      }
    }
  }
  
  // Fallback
  for (const networkName in networks) {
    const network = networks[networkName];
    for (const details of network) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
  
  return 'localhost';
}

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: join(__dirname, '../temp'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Health check endpoint
app.get('/health', (req, res) => {
  const localIP = getLocalIP();
  res.json({
    status: 'OK',
    message: 'IELTS Speaking Backend is running',
    timestamp: new Date().toISOString(),
    server: {
      ip: localIP,
      port: PORT,
      url: `http://${localIP}:${PORT}`
    }
  });
});

// Server info endpoint
app.get('/server-info', (req, res) => {
  const localIP = getLocalIP();
  res.json({
    ip: localIP,
    port: PORT,
    url: `http://${localIP}:${PORT}`,
    platform: process.platform,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});