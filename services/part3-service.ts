/**
 * Part 3 Service - Simple Two-way Discussion with Gemini SDK
 * Uses Google's official Generative AI SDK
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import type { Part3Topic } from './part3-types';
import { supabase } from './supabase-config';

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
  private onTranscriptResponse: (transcript: string, messageId?: string) => void = () => {};
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
      
      // Send text response and auto-play audio
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
  async sendAudio(audioBase64: string, messageId?: string): Promise<void> {
    try {
      if (!this.chat) {
        throw new Error('Chat not initialized');
      }

      console.log('Transcribing audio...');
      
      // Real speech-to-text transcription
      const transcription = await this.transcribeAudio(audioBase64);
      
      if (!transcription || transcription.trim().length === 0) {
        // Fallback: Allow user to continue with text input or retry
        const fallbackMessage = "I couldn't hear that clearly. Could you please try speaking again or rephrase your response?";
        this.onTextResponse(fallbackMessage);
        
        // Update the user message to show transcription failed
        if (messageId) {
          this.onTranscriptResponse("❌ Audio not clear - please try again", messageId);
        }
        return;
      }

      console.log('User said:', transcription);
      
      // Send final transcript back to UI to update the message (only once)
      if (transcription && transcription.length > 0) {
        this.onTranscriptResponse(transcription, messageId);
      }
      
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
      
      // Auto-play TTS for examiner response
      await this.convertTextToSpeech(message);
      
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
   * Set callback for transcript responses
   */
  onTranscript(callback: (transcript: string, messageId?: string) => void): void {
    this.onTranscriptResponse = callback;
  }

  /**
   * Set callback for errors
   */
  onErrorCallback(callback: (error: string) => void): void {
    this.onError = callback;
  }

  /**
   * Play text as speech (on-demand TTS)
   */
  async playTextAsSpeech(text: string): Promise<void> {
    await this.convertTextToSpeech(text);
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

      // If all encodings failed - return empty string instead of throwing
      console.warn('⚠️ All audio encodings failed - returning empty transcription');
      return '';
    } catch (error) {
      console.error('Error in speech-to-text:', error);
      // Don't throw - return empty string to allow conversation to continue
      return '';
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

      const timeoutController = createTimeoutController(15000); // 15s max for TTS
      
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
      if (error.name === 'AbortError') {
        console.warn('TTS request timed out - continuing without audio');
      } else {
        console.error('Error in text-to-speech:', error);
      }
      // Don't throw - TTS is optional, continue conversation without audio
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
    // Get file info first
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    console.log('📁 File info:', {
      exists: fileInfo.exists,
      size: fileInfo.size,
      uri: fileInfo.uri
    });
    
    if (!fileInfo.exists) {
      throw new Error('Audio file does not exist');
    }
    
    if (fileInfo.size < 1000) { // Less than 1KB
      console.warn('⚠️ Audio file is very small, may be empty');
    }
    
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
 * Get random Part 3 topic from database
 */
export async function getRandomPart3Topic(): Promise<Part3Topic> {
  try {
    // Get random topic with its discussion questions
    const { data: topics, error: topicsError } = await supabase
      .from('part3_topics')
      .select(`
        id,
        topic_name,
        main_question,
        category,
        difficulty_level,
        part3_discussion_questions (
          id,
          question_text,
          question_order,
          question_type
        )
      `)
      .order('id');

    if (topicsError) {
      console.error('Error fetching Part 3 topics:', topicsError);
      throw topicsError;
    }

    if (!topics || topics.length === 0) {
      throw new Error('No Part 3 topics found in database');
    }

    // Select random topic
    const randomIndex = Math.floor(Math.random() * topics.length);
    const selectedTopic = topics[randomIndex];

    // Transform to match Part3Topic interface
    const part3Topic: Part3Topic = {
      id: selectedTopic.id,
      topic_name: selectedTopic.topic_name,
      main_question: selectedTopic.main_question,
      sub_questions: selectedTopic.part3_discussion_questions
        .sort((a, b) => a.question_order - b.question_order)
        .map(q => q.question_text),
      difficulty: selectedTopic.difficulty_level || 'medium',
    };

    console.log('Selected Part 3 topic:', part3Topic.topic_name);
    return part3Topic;
    
  } catch (error) {
    console.error('Error in getRandomPart3Topic:', error);
    
    // Fallback to a default topic if database fails
    const fallbackTopic: Part3Topic = {
      id: 'fallback-1',
      topic_name: 'General Discussion',
      main_question: 'What are your thoughts on this topic?',
      sub_questions: [
        'Can you elaborate on your opinion?',
        'How do you think this affects society?',
        'What changes do you expect in the future?',
      ],
      difficulty: 'medium',
    };
    
    console.log('Using fallback topic due to database error');
    return fallbackTopic;
  }
}

/**
 * Get all Part 3 topics from database
 */
export async function getAllPart3Topics(): Promise<Part3Topic[]> {
  try {
    const { data: topics, error } = await supabase
      .from('part3_topics')
      .select(`
        id,
        topic_name,
        main_question,
        category,
        difficulty_level,
        part3_discussion_questions (
          id,
          question_text,
          question_order,
          question_type
        )
      `)
      .order('topic_name');

    if (error) {
      console.error('Error fetching all Part 3 topics:', error);
      throw error;
    }

    return topics.map(topic => ({
      id: topic.id,
      topic_name: topic.topic_name,
      main_question: topic.main_question,
      sub_questions: topic.part3_discussion_questions
        .sort((a, b) => a.question_order - b.question_order)
        .map(q => q.question_text),
      difficulty: topic.difficulty_level || 'medium',
    }));
    
  } catch (error) {
    console.error('Error in getAllPart3Topics:', error);
    return [];
  }
}

/**
 * Get Part 3 topic by ID
 */
export async function getPart3TopicById(id: string): Promise<Part3Topic | null> {
  try {
    const { data: topic, error } = await supabase
      .from('part3_topics')
      .select(`
        id,
        topic_name,
        main_question,
        category,
        difficulty_level,
        part3_discussion_questions (
          id,
          question_text,
          question_order,
          question_type
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching Part 3 topic by ID:', error);
      return null;
    }

    return {
      id: topic.id,
      topic_name: topic.topic_name,
      main_question: topic.main_question,
      sub_questions: topic.part3_discussion_questions
        .sort((a, b) => a.question_order - b.question_order)
        .map(q => q.question_text),
      difficulty: topic.difficulty_level || 'medium',
    };
    
  } catch (error) {
    console.error('Error in getPart3TopicById:', error);
    return null;
  }
}
