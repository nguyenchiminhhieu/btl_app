/**
 * Part 3 Service - Simple Two-way Discussion with Gemini SDK
 * Uses Google's official Generative AI SDK
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import type { Part3Topic } from './part3-types';

/**
 * Gemini Client - Using official Google SDK
 */
export class GeminiLiveClient {
  private client: GoogleGenerativeAI;
  private chat: any = null;
  private onTextResponse: (text: string) => void = () => {};
  private onError: (error: string) => void = () => {};

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
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
      this.onTextResponse(firstMessage);
    } catch (error) {
      console.error('Error connecting to Gemini:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect';
      this.onError(errorMsg);
      throw error;
    }
  }

  /**
   * Send audio data to Gemini (transcribe and send as text)
   * Note: For now, we'll send text. Audio transcription would require Speech-to-Text API
   */
  async sendAudio(audioBase64: string): Promise<void> {
    try {
      if (!this.chat) {
        throw new Error('Chat not initialized');
      }

      // TODO: Convert audio to text using Speech-to-Text API (Google Cloud Speech-to-Text or similar)
      // For now, we'll send a placeholder message
      // In production, you would:
      // 1. Send audioBase64 to Google Cloud Speech-to-Text API
      // 2. Get transcription text
      // 3. Send transcription to chat

      console.log('Audio received, waiting for transcription...');

      // For testing, we'll send a simple message
      // In production, replace this with actual speech-to-text
      const response = await this.chat.sendMessage(
        '[Student is speaking... transcription would go here]'
      );

      const message = response.response.text();
      console.log('Gemini response:', message);
      this.onTextResponse(message);
    } catch (error) {
      console.error('Error sending audio:', error);
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
   * Set callback for errors
   */
  onErrorCallback(callback: (error: string) => void): void {
    this.onError = callback;
  }

  /**
   * Close connection (cleanup)
   */
  close(): void {
    // No WebSocket to close with REST API
    this.chat = null;
    console.log('Chat session ended');
  }
}

/**
 * Convert audio file to base64
 */
export async function convertAudioToBase64(audioUri: string): Promise<string> {
  try {
    const audioData = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return audioData;
  } catch (error) {
    console.error('Error converting audio to base64:', error);
    throw error;
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

/**
 * Convert audio file to base64
 */
export async function convertAudioToBase64(audioUri: string): Promise<string> {
  try {
    const audioData = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return audioData;
  } catch (error) {
    console.error('Error converting audio to base64:', error);
    throw error;
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
      'How might technology change communication in the future?'
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
      'Do you think climate change is a bigger problem than pollution?'
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
      'What skills will be most valuable in the future?'
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
      'What qualities should a good teacher have?'
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
      'Do you think tourism can be harmful to local cultures?'
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
