import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs/promises';
import multer from 'multer';
import { networkInterfaces } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { assessPronunciation } from './azure-speech.js';
import { convertToWavBuffer } from './ffmpeg.js';
import { assessContent, assessPart2Content } from './openai-assessment.js';

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

// Health check
app.get('/', (req, res) => {
  const localIP = getLocalIP();
  res.json({
    status: 'ok',
    message: 'IELTS Speaking Assessment Backend',
    version: '1.0.0',
    server: {
      ip: localIP,
      port: PORT,
      url: `http://${localIP}:${PORT}`
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  const localIP = getLocalIP();
  res.json({ 
    status: 'healthy',
    server: {
      ip: localIP,
      port: PORT,
      url: `http://${localIP}:${PORT}`
    },
    timestamp: new Date().toISOString()
  });
});

// Server info endpoint để frontend có thể detect IP
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

// Main assessment endpoint
app.post('/api/assess-speaking', upload.single('audioFile'), async (req, res) => {
  try {
    console.log('📥 Received assessment request');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided',
      });
    }

    const { questionText, questionId, topicId } = req.body;

    if (!questionText) {
      return res.status(400).json({
        success: false,
        error: 'Missing questionText',
      });
    }

    console.log(`Question: ${questionText}`);
    console.log(`Audio file: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // Step 1: Convert m4a to WAV (16kHz, mono, PCM)
    console.log('📦 Step 1: Converting audio to WAV...');
    const wavBuffer = await convertToWavBuffer(req.file.path);
    console.log(`✅ WAV buffer created: ${wavBuffer.length} bytes`);

    // Step 2: Assess pronunciation with Azure (using WAV)
    console.log('📦 Step 2: Assessing pronunciation...');
    const pronunciationResult = await assessPronunciation(wavBuffer, questionText);
    console.log(`✅ Transcript: "${pronunciationResult.transcript}"`);

    // Step 3: Assess content with OpenAI (using transcript + pronunciation data from Azure)
    console.log('📦 Step 3: Assessing content...');
    const contentResult = await assessContent(
      pronunciationResult.transcript, 
      questionText,
      {
        pronunciationScore: pronunciationResult.pronunciationScore,
        accuracyScore: pronunciationResult.accuracyScore,
        fluencyScore: pronunciationResult.fluencyScore,
        completenessScore: pronunciationResult.completenessScore,
        prosodyScore: pronunciationResult.prosodyScore,
        words: pronunciationResult.words
      }
    );
    console.log(`✅ Band score: ${contentResult.bandScore}`);

    // Calculate overall band (average of pronunciation and content)
    const pronunciationBand = (pronunciationResult.pronunciationScore / 100) * 9;
    const overallBand = Math.round(((pronunciationBand + contentResult.bandScore) / 2) * 2) / 2;

    // Combine results
    const response = {
      questionId,
      topicId,
      transcript: pronunciationResult.transcript,
      
      // Pronunciation scores from Azure
      pronunciation: {
        overall: pronunciationResult.pronunciationScore,
        accuracy: pronunciationResult.accuracyScore,
        fluency: pronunciationResult.fluencyScore,
        completeness: pronunciationResult.completenessScore,
        prosody: pronunciationResult.prosodyScore,
      },
      
      // Word-level details
      words: pronunciationResult.words,
      
      // Content scores from OpenAI
      content: {
        bandScore: contentResult.bandScore,
        fluencyCoherence: contentResult.fluencyCoherence,
        lexicalResource: contentResult.lexicalResource,
        grammaticalRange: contentResult.grammaticalRange,
        relevance: contentResult.relevance,
      },
      
      // Feedback
      feedback: contentResult.feedback,
      strengths: contentResult.strengths,
      improvements: contentResult.improvements,
      
      // Overall band
      overallBand,
    };

    console.log('✅ Assessment complete!');

    res.json({
      success: true,
      data: response,
    });

    // Clean up uploaded file
    await fs.unlink(req.file.path);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// Part 2 Assessment endpoint (with cue card context)
app.post('/api/assess-part2-speaking', upload.single('audioFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided',
      });
    }

    const { part2Context, questionId, topicId, assessmentType } = req.body;

    if (!part2Context) {
      return res.status(400).json({
        success: false,
        error: 'Missing part2Context for Part 2 assessment',
      });
    }

    const context = JSON.parse(part2Context);
    console.log('📋 Part 2 Cue Card:', context.cueCard.mainPrompt);
    console.log(`🎯 Topic: ${context.topic.title} (${context.topic.category})`);
    console.log(`⏱️ Expected duration: ${context.expectedDuration}`);
    console.log(`Audio file: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // Step 1: Convert m4a to WAV (16kHz, mono, PCM)
    console.log('📦 Step 1: Converting audio to WAV...');
    const wavBuffer = await convertToWavBuffer(req.file.path);
    console.log(`✅ WAV buffer created: ${wavBuffer.length} bytes`);

    // Step 2: Assess pronunciation with Azure (using cue card main prompt as reference)
    console.log('📦 Step 2: Assessing pronunciation...');
    const pronunciationResult = await assessPronunciation(wavBuffer, context.cueCard.mainPrompt);
    console.log(`✅ Transcript: "${pronunciationResult.transcript}"`);

    // Step 3: Assess content with OpenAI for Part 2 (using cue card context)
    console.log('📦 Step 3: Assessing Part 2 content...');
    const contentResult = await assessPart2Content(
      pronunciationResult.transcript,
      context,
      {
        pronunciationScore: pronunciationResult.pronunciationScore,
        accuracyScore: pronunciationResult.accuracyScore,
        fluencyScore: pronunciationResult.fluencyScore,
        completenessScore: pronunciationResult.completenessScore,
        prosodyScore: pronunciationResult.prosodyScore,
        words: pronunciationResult.words
      }
    );
    console.log(`✅ Part 2 Band score: ${contentResult.bandScore}`);

    // Calculate overall band (weighted for Part 2 - more focus on content)
    const pronunciationBand = (pronunciationResult.pronunciationScore / 100) * 9;
    const overallBand = Math.round(((pronunciationBand * 0.3 + contentResult.bandScore * 0.7)) * 2) / 2;

    // Combine results for Part 2
    const response = {
      questionId,
      topicId,
      transcript: pronunciationResult.transcript,
      
      // Pronunciation scores from Azure
      pronunciation: {
        overall: pronunciationResult.pronunciationScore,
        accuracy: pronunciationResult.accuracyScore,
        fluency: pronunciationResult.fluencyScore,
        completeness: pronunciationResult.completenessScore,
        prosody: pronunciationResult.prosodyScore,
      },
      
      // Word-level details
      words: pronunciationResult.words,
      
      // Part 2 specific content scores from OpenAI
      content: {
        bandScore: contentResult.bandScore,
        fluencyCoherence: contentResult.fluencyCoherence,
        lexicalResource: contentResult.lexicalResource,
        grammaticalRange: contentResult.grammaticalRange,
        pronunciation: contentResult.pronunciation,
        feedback: contentResult.feedback,
        strengths: contentResult.strengths,
        improvements: contentResult.improvements,
      },
      
      // Overall assessment
      feedback: contentResult.feedback,
      strengths: contentResult.strengths,
      improvements: contentResult.improvements,
      overallBand,
    };

    res.json({
      success: true,
      data: response,
    });

    // Clean up uploaded file
    await fs.unlink(req.file.path);
  } catch (error) {
    console.error('❌ Part 2 Assessment Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Part 2 assessment failed',
    });
  }
});

// Start server
app.listen(PORT, () => {
  const localIP = getLocalIP();
  
  console.log('\n🚀 IELTS Speaking Backend Started Successfully!');
  console.log('=' .repeat(50));
  console.log(`📍 Local IP: ${localIP}`);
  console.log(`🌐 Server URL: http://${localIP}:${PORT}`);
  console.log(`🏠 Localhost: http://localhost:${PORT}`);
  console.log('=' .repeat(50));
  console.log('📋 Available Endpoints:');
  console.log(`   ✅ Health Check: http://${localIP}:${PORT}/health`);
  console.log(`   ℹ️  Server Info: http://${localIP}:${PORT}/server-info`);
  console.log(`   📝 Part 1 Assessment: http://${localIP}:${PORT}/api/assess-speaking`);
  console.log(`   📋 Part 2 Assessment: http://${localIP}:${PORT}/api/assess-part2-speaking`);
  console.log('=' .repeat(50));
  console.log('💡 Update your .env file with:');
  console.log(`   EXPO_PUBLIC_BACKEND_URL=http://${localIP}:${PORT}`);
  console.log('=' .repeat(50));
});
