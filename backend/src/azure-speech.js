import { spawn } from 'child_process';
import { unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Assess pronunciation using Azure Speech Service via Python SDK
 * @param {Buffer} wavBuffer - WAV audio buffer (16kHz, mono, PCM 16-bit)
 * @param {string} referenceText - Expected text for pronunciation assessment
 * @returns {Promise<Object>} Pronunciation scores and transcript
 */
export async function assessPronunciation(wavBuffer, referenceText) {
  let tempWavPath = null;
  
  try {
    console.log('🎤 Assessing pronunciation with Azure Speech (Python SDK)...');
    console.log(`Reference text: ${referenceText}`);
    console.log(`Audio buffer size: ${wavBuffer.length} bytes`);

    // Get Azure credentials from env
    const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
    const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
      throw new Error('Azure Speech credentials not configured');
    }

    // Write WAV buffer to temporary file
    tempWavPath = join(tmpdir(), `azure_wav_${Date.now()}.wav`);
    writeFileSync(tempWavPath, wavBuffer);
    console.log(`📁 Temporary WAV file: ${tempWavPath}`);

    // Path to Python script
    const pythonScript = join(__dirname, 'azure-speech-python.py');
    
    // Call Python script
    console.log('🐍 Calling Python Azure SDK...');
    const result = await new Promise((resolve, reject) => {
      const python = spawn('python', [
        pythonScript,
        tempWavPath,
        referenceText,
        AZURE_SPEECH_KEY,
        AZURE_SPEECH_REGION
      ]);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('❌ Python stderr:', stderr);
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        } else {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            console.error('❌ Failed to parse Python output:', stdout);
            reject(new Error(`Failed to parse Python output: ${e.message}`));
          }
        }
      });

      python.on('error', (err) => {
        reject(new Error(`Failed to start Python: ${err.message}`));
      });
    });

    // Check Python result
    if (!result.success) {
      throw new Error(result.error || 'Python assessment failed');
    }

    const response_data = {
      transcript: result.transcript || '',
      pronunciationScore: result.pronunciationScore || 0,
      accuracyScore: result.accuracyScore || 0,
      fluencyScore: result.fluencyScore || 0,
      completenessScore: result.completenessScore || 0,
      prosodyScore: result.prosodyScore || 0,
      words: result.words || [],
    };

    console.log('✅ Azure assessment successful!');
    console.log('Transcript:', response_data.transcript);
    console.log('Pronunciation scores:', {
      overall: response_data.pronunciationScore,
      accuracy: response_data.accuracyScore,
      fluency: response_data.fluencyScore,
      completeness: response_data.completenessScore,
      prosody: response_data.prosodyScore,
    });

    return response_data;
  } catch (error) {
    console.error('❌ Azure assessment error:', error);
    throw error;
  } finally {
    // Clean up temporary file
    if (tempWavPath) {
      try {
        unlinkSync(tempWavPath);
        console.log('🗑️ Temporary WAV file deleted');
      } catch (cleanupError) {
        console.warn('⚠️ Could not delete temporary file:', cleanupError.message);
      }
    }
  }
}
