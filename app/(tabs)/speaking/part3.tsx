/**
 * Part 3 - Two-way Discussion
 * Simple real-time conversation with Gemini Live API
 */

import { AudioRecorder } from '@/components/speaking/AudioRecorder';
import { Colors } from '@/constants/theme';
import { convertAudioToBase64, GeminiLiveClient, getRandomPart3Topic, playAudioFromBase64 } from '@/services/part3-service';
import type { Part3Topic } from '@/services/part3-types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export default function Part3Screen() {
  const router = useRouter();

  const [topic, setTopic] = useState<Part3Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geminiClient, setGeminiClient] = useState<GeminiLiveClient | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Initialize Part 3 session
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Get random topic
      const randomTopic = getRandomPart3Topic();
      setTopic(randomTopic);

      // Initialize Gemini client with speech API
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
      const speechToTextKey = process.env.EXPO_PUBLIC_SPEECH_TO_TEXT_API_KEY || '';
      const textToSpeechKey = process.env.EXPO_PUBLIC_TEXT_TO_SPEECH_API_KEY || '';
      
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const client = new GeminiLiveClient(apiKey, speechToTextKey, textToSpeechKey);
      setGeminiClient(client);

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing Part 3 session:', error);
      Alert.alert('Error', 'Failed to initialize session');
      router.back();
    }
  };

  const startSession = async () => {
    try {
      if (!geminiClient || !topic) {
        throw new Error('Session not initialized');
      }

      setIsProcessing(true);

      // Connect to Gemini with topic question
      await geminiClient.connect(topic.main_question);

      // Setup callbacks
      geminiClient.onAudio(async (audioBase64) => {
        try {
          console.log('Playing examiner audio response');
          setIsPlayingAudio(true);
          await playAudioFromBase64(audioBase64);
          setIsPlayingAudio(false);
        } catch (error) {
          console.error('Error playing audio:', error);
          setIsPlayingAudio(false);
        }
      });

      geminiClient.onText((text) => {
        // Add AI response to messages
        const message: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          text,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, message]);
      });

      geminiClient.onErrorCallback((error) => {
        console.error('Gemini error:', error);
        Alert.alert('Error', error);
      });

      setSessionStarted(true);

      // Initial greeting is sent automatically by connect()
      setIsProcessing(false);
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start session');
      setIsProcessing(false);
    }
  };

  const handleRecordingComplete = async (audioUri: string) => {
    try {
      setIsProcessing(true);

      if (!geminiClient) {
        throw new Error('Gemini client not initialized');
      }

      // Add user message placeholder
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        text: '🎤 Transcribing your response...',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Convert audio to base64 and send for real transcription
      const audioBase64 = await convertAudioToBase64(audioUri);
      
      // Send audio for real transcription and processing
      await geminiClient.sendAudio(audioBase64);

      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing audio:', error);
      Alert.alert('Error', 'Failed to process audio');
      setIsProcessing(false);
    }
  };

  const endSession = () => {
    try {
      if (geminiClient) {
        geminiClient.close();
      }
      // Just go back - no database saves
      router.back();
    } catch (error) {
      console.error('Error ending session:', error);
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Preparing your discussion...</Text>
      </View>
    );
  }

  if (!topic) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load topic</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {!sessionStarted ? (
        // Pre-session view
        <View style={styles.content}>
          {/* Topic Info */}
          <View style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <Ionicons name="bulb" size={32} color={Colors.secondary.main} />
              <Text style={styles.topicTitle}>{topic.topic_name}</Text>
            </View>

            <Text style={styles.mainQuestion}>
              <Text style={styles.label}>Main Question:</Text>
              {'\n'}{topic.main_question}
            </Text>

            <View style={styles.subQuestionsContainer}>
              <Text style={styles.subQuestionsLabel}>Follow-up Questions:</Text>
              {topic.sub_questions.map((question, index) => (
                <View key={index} style={styles.subQuestion}>
                  <Text style={styles.questionNumber}>{index + 1}.</Text>
                  <Text style={styles.questionText}>{question}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How It Works</Text>
            <View style={styles.instructionItem}>
              <View style={styles.instructionBullet}>
                <Text style={styles.bulletNumber}>1</Text>
              </View>
              <Text style={styles.instructionText}>Click "Start Discussion"</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionBullet}>
                <Text style={styles.bulletNumber}>2</Text>
              </View>
              <Text style={styles.instructionText}>Listen to the question</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionBullet}>
                <Text style={styles.bulletNumber}>3</Text>
              </View>
              <Text style={styles.instructionText}>Record your response</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionBullet}>
                <Text style={styles.bulletNumber}>4</Text>
              </View>
              <Text style={styles.instructionText}>Get AI response & continue</Text>
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity 
            style={[styles.startButton, isProcessing && styles.startButtonDisabled]} 
            onPress={startSession} 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="play" size={24} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.startButtonText}>Bắt đầu thảo luận</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        // During-session view
        <View style={styles.content}>
          {/* Conversation Log */}
          <View style={styles.conversationContainer}>
            <Text style={styles.conversationTitle}>Conversation</Text>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[styles.messageBubble, msg.role === 'user' ? styles.userMessage : styles.assistantMessage]}
              >
                <Text style={[styles.messageText, msg.role === 'user' && styles.userMessageText]}>
                  {msg.role === 'user' ? '🎤 You: ' : '🎙️ Examiner: '}
                  {msg.text}
                </Text>
              </View>
            ))}
            {isProcessing && (
              <View style={styles.processingIndicator}>
                <ActivityIndicator color={Colors.primary.main} />
                <Text style={styles.processingText}>Processing speech...</Text>
              </View>
            )}
            {isPlayingAudio && (
              <View style={styles.processingIndicator}>
                <ActivityIndicator color={Colors.secondary.main} />
                <Text style={styles.processingText}>🔊 Examiner speaking...</Text>
              </View>
            )}
          </View>

          {/* Audio Recorder */}
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={isProcessing}
          />

          {/* End Session Button */}
          <TouchableOpacity style={styles.endButton} onPress={endSession} disabled={isProcessing}>
            <Ionicons name="stop-circle" size={24} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.endButtonText}>End Discussion</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  topicCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.main,
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontWeight: '600',
    color: Colors.primary.main,
  },
  mainQuestion: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 16,
  },
  subQuestionsContainer: {
    marginBottom: 0,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.secondary.main,
  },
  subQuestionsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  subQuestion: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  questionNumber: {
    fontWeight: '600',
    color: Colors.secondary.main,
    marginRight: 8,
    minWidth: 20,
  },
  questionText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
    lineHeight: 18,
  },
  instructionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bulletNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  instructionText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
    lineHeight: 18,
    paddingTop: 4,
  },
  startButton: {
    backgroundColor: Colors.secondary.main,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  conversationContainer: {
    marginBottom: 24,
    maxHeight: 400,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 12,
  },
  messageBubble: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  userMessage: {
    backgroundColor: Colors.primary.main,
    marginLeft: 32,
  },
  assistantMessage: {
    backgroundColor: '#e5e7eb',
    marginRight: 32,
  },
  messageText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  userMessageText: {
    color: '#FFF',
  },
  endButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  processingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
    fontStyle: 'italic',
  },
});
