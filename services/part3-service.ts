/**
 * Part 3 Service - Simple Two-way Discussion with Gemini SDK
 * Uses Google's official Generative AI SDK
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import type { Part3Topic } from './part3-types';

/**
 * Create timeout AbortController (React Native compatible)
 */
function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  
  setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  return controller;
}

/**
 * Gemini Client - Using official Google SDK
 */
export class GeminiLiveClient {
  private client: GoogleGenerativeAI;
  private chat: any = null;
  private onTextResponse: (text: string) => void = () => {};
  private onAudioResponse: (audioBase64: string) => void = () => {};
  private onError: (error: string) => void = () => {};
  private speechToTextApiKey: string;
  private textToSpeechApiKey: string;
  private conversationCount: number = 0;
  private startTime: number = 0;

  constructor(apiKey: string, speechToTextKey?: string, textToSpeechKey?: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    // Use separate API keys for different services
    this.speechToTextApiKey = speechToTextKey || process.env.EXPO_PUBLIC_SPEECH_TO_TEXT_API_KEY || '';
    this.textToSpeechApiKey = textToSpeechKey || process.env.EXPO_PUBLIC_TEXT_TO_SPEECH_API_KEY || '';
  }

  /**
   * Initialize chat session with topic
   */
  async connect(topicQuestion: string): Promise<void> {
    try {
      console.log('Initializing Gemini chat with topic:', topicQuestion);

      const model = this.client.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: `You are an IELTS Speaking Part 3 examiner. The topic is: "${topicQuestion}". 
Your task is to conduct a natural 4-5 minute two-way discussion.
- Start by acknowledging the main topic
- Ask the initial question to understand the student's perspective
- Follow up with natural, engaging questions based on their responses
- Encourage elaboration and deeper thinking
- Keep the conversation flowing naturally
- Be encouraging but challenging
- Keep your responses concise (1-2 sentences per turn)
- Only provide text responses for the discussion
Do not end the conversation abruptly; wait for the student to indicate they're done.`,
      });

      // Start a multi-turn conversation
      this.chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        },
      });

      // Send initial greeting
      const response = await this.chat.sendMessage(
        `Hello, I'm your IELTS Speaking Part 3 examiner. We'll be having a discussion about: "${topicQuestion}". 
Please start by telling me your thoughts on this topic.`
      );

      const firstMessage = response.response.text();
      console.log('Gemini initial response:', firstMessage);
      
      // Start conversation timer
      this.startTime = Date.now();
      this.conversationCount = 0;
      
      // Convert to speech and send both text and audio
      this.onTextResponse(firstMessage);
      await this.convertTextToSpeech(firstMessage);
    } catch (error) {
      console.error('Error connecting to Gemini:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect';
      this.onError(errorMsg);
      throw error;
    }
  }

  /**
   * Send audio data to Gemini (real speech-to-text transcription)
   */
  async sendAudio(audioBase64: string): Promise<void> {
    try {
      if (!this.chat) {
        throw new Error('Chat not initialized');
      }

      console.log('Transcribing audio...');
      
      // Real speech-to-text transcription
      const transcription = await this.transcribeAudio(audioBase64);
      
      if (!transcription || transcription.trim().length === 0) {
        this.onError('Could not understand the audio. Please try speaking more clearly.');
        return;
      }

      console.log('User said:', transcription);
      this.conversationCount++;
      
      // Check conversation time (max 5 minutes)
      const elapsedTime = (Date.now() - this.startTime) / 1000 / 60;
      if (elapsedTime >= 5) {
        const closingMessage = "Thank you for the discussion. That's the end of Part 3. You've done well.";
        this.onTextResponse(closingMessage);
        await this.convertTextToSpeech(closingMessage);
        return;
      }

      // Generate contextual follow-up question
      const contextPrompt = this.generateContextualPrompt(transcription, elapsedTime);
      
      const response = await this.chat.sendMessage(contextPrompt + transcription);
      const message = response.response.text();
      
      console.log('Examiner response:', message);
      
      // Send text response immediately (for visual feedback)
      this.onTextResponse(message);
      
      // Convert to speech in parallel (don't await - fire and forget for speed)
      this.convertTextToSpeech(message).catch(error => {
        console.warn('TTS failed but continuing:', error);
      });
      
    } catch (error) {
      console.error('Error processing audio:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to process audio';
      this.onError(errorMsg);
      throw error;
    }
  }

  /**
   * Send text message (for direct text input)
   */
  async sendMessage(text: string): Promise<void> {
    try {
      if (!this.chat) {
        throw new Error('Chat not initialized');
      }

      console.log('Sending message:', text);

      const response = await this.chat.sendMessage(text);
      const message = response.response.text();

      console.log('Gemini response:', message);
      this.onTextResponse(message);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to send message';
      this.onError(errorMsg);
      throw error;
    }
  }

  /**
   * Set callback for text responses
   */
  onText(callback: (text: string) => void): void {
    this.onTextResponse = callback;
  }

  /**
   * Set callback for audio responses
   */
  onAudio(callback: (audioBase64: string) => void): void {
    this.onAudioResponse = callback;
  }

  /**
   * Set callback for errors
   */
  onErrorCallback(callback: (error: string) => void): void {
    this.onError = callback;
  }

  /**
   * Generate contextual conversation prompts based on conversation flow
   */
  private generateContextualPrompt(userResponse: string, elapsedMinutes: number): string {
    if (this.conversationCount <= 2) {
      return `Student response: "${userResponse}". Ask a follow-up question to dig deeper into their opinion. Keep it natural and engaging. `;
    } else if (elapsedMinutes < 2) {
      return `Student said: "${userResponse}". Ask a more challenging question to test their analytical thinking. `;
    } else if (elapsedMinutes < 4) {
      return `Student response: "${userResponse}". Ask a comparative or hypothetical question to explore different perspectives. `;
    } else {
      return `Student said: "${userResponse}". Ask one final probing question before concluding. `;
    }
  }

  /**
   * Transcribe audio using Google Cloud Speech-to-Text
   */
  private async transcribeAudio(audioBase64: string): Promise<string> {
    try {
      if (!this.speechToTextApiKey) {
        throw new Error('Google Speech-to-Text API key not configured');
      }

      console.log('🎙️ Starting audio transcription...');
      console.log('🔑 Using Speech-to-Text API key:', this.speechToTextApiKey.substring(0, 10) + '...');
      console.log('📊 Audio data size:', audioBase64.length, 'chars');
      
      // Validate audio content
      if (!audioBase64 || audioBase64.length < 1000) {
        throw new Error('Audio data too small or empty');
      }
      
      // Check if it looks like valid base64 audio
      if (!/^[A-Za-z0-9+/]+=*$/.test(audioBase64)) {
        throw new Error('Invalid base64 audio data');
      }

      const url = `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${this.speechToTextApiKey}`;

      // Try multiple encodings for M4A compatibility
      const encodingOptions = [
        { encoding: 'FLAC', sampleRate: 44100 },
        { encoding: 'WEBM_OPUS', sampleRate: 48000 },
        { encoding: 'OGG_OPUS', sampleRate: 48000 },
        { encoding: 'LINEAR16', sampleRate: 44100 }, // Match M4A sample rate
        { encoding: 'LINEAR16', sampleRate: 16000 }, // Fallback lower rate
      ];

      for (let i = 0; i < encodingOptions.length; i++) {
        const option = encodingOptions[i];
        console.log(`🔄 Trying encoding ${i + 1}/${encodingOptions.length}: ${option.encoding}`);

        const requestBody = {
          config: {
            encoding: option.encoding,
            sampleRateHertz: option.sampleRate,
            languageCode: 'en-US',
            enableAutomaticPunctuation: true,
          },
          audio: {
            content: audioBase64,
          },
        };

        try {
          const timeoutController = createTimeoutController(8000); // 8s max for speech recognition
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: timeoutController.signal,
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Encoding ${option.encoding} failed:`, errorText);
            continue; // Try next encoding
          }

          const result = await response.json();
          console.log('🎯 API Response:', JSON.stringify(result, null, 2));
          
          if (result.results && result.results.length > 0) {
            const alternatives = result.results[0].alternatives;
            if (alternatives && alternatives.length > 0 && alternatives[0].transcript) {
              const transcript = alternatives[0].transcript.trim();
              console.log(`✅ Success with ${option.encoding}:`, transcript);
              return transcript;
            } else {
              console.warn(`⚠️ ${option.encoding}: Got results but no transcript text`);
              continue; // Try next encoding
            }
          } else {
            console.warn(`⚠️ ${option.encoding}: No results, trying next encoding...`);
            continue; // Try next encoding
          }
          
        } catch (encodingError) {
          console.error(`❌ ${option.encoding} failed:`, encodingError instanceof Error ? encodingError.message : encodingError);
          continue; // Try next encoding
        }
      }

      // If all encodings failed
      throw new Error('All audio encodings failed - could not transcribe audio');
    } catch (error) {
      console.error('Error in speech-to-text:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using Google Cloud Text-to-Speech
   */
  private async convertTextToSpeech(text: string): Promise<void> {
    try {
      if (!this.textToSpeechApiKey) {
        console.warn('Text-to-Speech API key not configured, skipping TTS');
        return;
      }

      console.log('🔊 Converting text to speech:', text.substring(0, 50) + '...');
      console.log('🔑 Using TTS API key:', this.textToSpeechApiKey.substring(0, 10) + '...');

      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.textToSpeechApiKey}`;
      
      const requestBody = {
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Standard-A', // Female examiner voice
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0, // Normal speed for faster delivery
          pitch: 0.0,
        },
      };

      const timeoutController = createTimeoutController(2000); // 2s max for TTS
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: timeoutController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Text-to-speech error:', response.status, errorText);
        return;
      }

      const result = await response.json();
      
      if (result.audioContent) {
        // Send audio to callback for playback
        this.onAudioResponse(result.audioContent);
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      // Don't throw - TTS is optional
    }
  }

  /**
   * Close connection (cleanup)
   */
  close(): void {
    this.chat = null;
    this.conversationCount = 0;
    this.startTime = 0;
    console.log('Chat session ended');
  }
}

/**
 * Convert audio file to base64 (optimized for speech recognition)
 */
export async function convertAudioToBase64(audioUri: string): Promise<string> {
  console.log('🔄 Converting audio to base64:', audioUri);
  
  try {
    // Try legacy FileSystem first (most reliable for Expo)
    const audioData = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64',
    });
    
    console.log('✅ Audio conversion successful, size:', audioData.length, 'chars');
    return audioData;
    
  } catch (legacyError) {
    console.warn('Legacy FileSystem failed, trying fetch approach:', legacyError);
    
    try {
      // Fallback: fetch the file and convert to base64
      const response = await fetch(audioUri);
      const arrayBuffer = await response.arrayBuffer();
      const base64String = arrayBufferToBase64(arrayBuffer);
      
      console.log('✅ Fetch conversion successful, size:', base64String.length, 'chars');
      return base64String;
      
    } catch (fetchError) {
      console.error('❌ All audio conversion methods failed:', fetchError);
      throw new Error('Failed to convert audio to base64');
    }
  }
}

/**
 * Helper function to convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

/**
 * Play audio from base64 (for examiner responses) - React Native compatible
 */
export async function playAudioFromBase64(audioBase64: string): Promise<void> {
  try {
    console.log('🔊 Playing examiner audio response');
    
    // Use FileSystem to create temporary audio file (React Native compatible approach)
    const tempDir = FileSystem.cacheDirectory + 'temp_audio/';
    const tempFilePath = tempDir + `examiner_${Date.now()}.mp3`;
    
    // Ensure temp directory exists
    try {
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
    } catch (dirError) {
      // Directory might already exist, ignore error
    }
    
    // Write base64 audio to temporary file
    await FileSystem.writeAsStringAsync(tempFilePath, audioBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Create and play audio
    const { sound } = await Audio.Sound.createAsync(
      { uri: tempFilePath },
      { shouldPlay: true }
    );
    
    // Set up cleanup after playback
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        // Cleanup sound and temp file
        sound.unloadAsync().then(() => {
          FileSystem.deleteAsync(tempFilePath, { idempotent: true }).catch(() => {
            // Ignore cleanup errors
          });
        });
      }
    });
    
    console.log('✅ Audio playback started');
    
  } catch (error) {
    console.error('❌ Audio playback failed:', error);
    
    // Simple fallback - try playing without temp file (data URI approach)
    try {
      const dataUri = `data:audio/mp3;base64,${audioBase64}`;
      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { shouldPlay: true }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
      
      console.log('✅ Fallback audio playback started');
      
    } catch (fallbackError) {
      console.error('❌ All audio playback methods failed:', fallbackError);
      // Audio playback failed, but don't crash the conversation
    }
  }
}

/**
 * Part 3 topics for display (hardcoded for simplicity)
 */
export const PART3_TOPICS: Part3Topic[] = [
  {
    id: '1',
    topic_name: 'Technology and Daily Life',
    main_question: 'How has technology changed the way people communicate?',
    sub_questions: [
      'What are the advantages and disadvantages of social media?',
      'Do you think video calls can replace face-to-face meetings?',
      'How might technology change communication in the future?',
    ],
    difficulty: 'medium',
  },
  {
    id: '2',
    topic_name: 'Environmental Protection',
    main_question: 'What do you think are the most important environmental issues today?',
    sub_questions: [
      'What role should governments play in protecting the environment?',
      'How can ordinary people help protect the environment?',
      'Do you think climate change is a bigger problem than pollution?',
    ],
    difficulty: 'medium',
  },
  {
    id: '3',
    topic_name: 'Work and Career',
    main_question: 'What factors are most important when choosing a career?',
    sub_questions: [
      'Do you think it is important to enjoy your job?',
      'How has work changed due to technology?',
      'What skills will be most valuable in the future?',
    ],
    difficulty: 'medium',
  },
  {
    id: '4',
    topic_name: 'Education',
    main_question: 'What is the purpose of education in modern society?',
    sub_questions: [
      'Should education focus more on practical skills or theoretical knowledge?',
      'How do you think online learning will change education?',
      'What qualities should a good teacher have?',
    ],
    difficulty: 'medium',
  },
  {
    id: '5',
    topic_name: 'Travel and Culture',
    main_question: 'Why do you think people enjoy traveling?',
    sub_questions: [
      'What are the benefits of traveling to different countries?',
      'How has technology affected the way people travel?',
      'Do you think tourism can be harmful to local cultures?',
    ],
    difficulty: 'medium',
  },
];

/**
 * Get random topic
 */
export function getRandomPart3Topic(): Part3Topic {
  return PART3_TOPICS[Math.floor(Math.random() * PART3_TOPICS.length)];
}
