import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Convert m4a/3gp audio to WAV (16kHz, mono, PCM 16-bit)
 * Required format for Azure Pronunciation Assessment
 */
export async function convertToWav(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    console.log('🎵 Converting audio to WAV...');
    console.log(`Input: ${inputPath}`);
    console.log(`Output: ${outputPath}`);

    ffmpeg(inputPath)
      .audioFrequency(16000) // 16kHz sample rate (optimal for speech recognition)
      .audioChannels(1) // Mono
      .audioCodec('pcm_s16le') // PCM 16-bit little-endian
      .audioFilters([
        'highpass=f=80',  // Remove low frequency noise
        'lowpass=f=8000', // Remove high frequency noise (keep speech band)
        'volume=1.5'      // Boost volume slightly
      ])
      .format('wav')
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log('✅ Conversion completed');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error:', err.message);
        reject(new Error(`FFmpeg conversion failed: ${err.message}`));
      })
      .save(outputPath);
  });
}

/**
 * Convert m4a to WAV and return buffer
 */
export async function convertToWavBuffer(inputPath) {
  const tempOutputPath = join(dirname(inputPath), `converted_${Date.now()}.wav`);
  
  try {
    await convertToWav(inputPath, tempOutputPath);
    const buffer = await fs.readFile(tempOutputPath);
    
    // Clean up temp file
    await fs.unlink(tempOutputPath);
    
    return buffer;
  } catch (error) {
    // Clean up temp file if exists
    try {
      await fs.unlink(tempOutputPath);
    } catch {}
    
    throw error;
  }
}
