/**
 * Part 3 - Two-way Discussion
 * Simple real-time conversation with Gemini Live API
 */

import { AudioRecorder } from '@/components/speaking/AudioRecorder';
import { Colors } from '@/constants/theme';
import { convertAudioToBase64, GeminiLiveClient, getRandomPart3Topic, playAudioFromBase64 } from '@/services/part3-service';
import type { Part3Topic } from '@/services/part3-types';
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
    
    // Cleanup function
    return () => {
      if (geminiClient) {
        geminiClient.close();
      }
    };
  }, []);

  // Reset state when component mounts (clear previous session)
  useEffect(() => {
    setMessages([]);
    setSessionStarted(false);
    setIsProcessing(false);
    setIsPlayingAudio(false);
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      
      // Get random topic from database
      const randomTopic = await getRandomPart3Topic();
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
      setIsLoading(false);
      
      if (error instanceof Error && error.message.includes('No Part 3 topics found')) {
        Alert.alert('Error', 'No topics available. Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', 'Failed to load discussion topics. Please try again.');
      }
      
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

      // Setup transcript callback to update user messages
      geminiClient.onTranscript((transcript, messageId) => {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === messageId 
              ? { ...msg, text: transcript }
              : msg
          )
        );
      });

      geminiClient.onErrorCallback((error) => {
        console.error('Gemini error:', error);
        // Show user-friendly error message instead of raw error
        if (error.includes('transcribe')) {
          Alert.alert(
            'Audio Issue', 
            'Unable to process your audio. This could be due to background noise or unclear speech. Please try speaking more clearly into the microphone.',
            [{ text: 'OK', style: 'default' }]
          );
        } else {
          Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        }
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

      // Add user message placeholder with unique ID for tracking
      const messageId = `msg_${Date.now()}`;
      const userMessage: Message = {
        id: messageId,
        role: 'user',
        text: '🎤 Transcribing your response...',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Convert audio to base64 and send for real transcription
      const audioBase64 = await convertAudioToBase64(audioUri);
      
      // Send audio for real transcription and processing with messageId
      await geminiClient.sendAudio(audioBase64, messageId);

      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing audio:', error);
      Alert.alert('Error', 'Failed to process audio');
      setIsProcessing(false);
    }
  };

  const handleListenToMessage = async (text: string) => {
    if (!geminiClient || isPlayingAudio) return;
    
    try {
      setIsPlayingAudio(true);
      await geminiClient.playTextAsSpeech(text);
      setIsPlayingAudio(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingAudio(false);
    }
  };

  const endSession = () => {
    try {
      if (geminiClient) {
        geminiClient.close();
        setGeminiClient(null);
      }
      // Clear all state
      setMessages([]);
      setSessionStarted(false);
      setIsProcessing(false);
      setIsPlayingAudio(false);
      setTopic(null);
      
      // Go back to previous screen
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
              <Text style={styles.partLabel}>Part 3 • Discussion</Text>
              <Text style={styles.topicTitle}>{topic.topic_name}</Text>
            </View>

            <View style={styles.mainQuestionContainer}>
              <Text style={styles.mainQuestionLabel}>Let's discuss this topic:</Text>
              <Text style={styles.mainQuestion}>{topic.main_question}</Text>
            </View>

            <View style={styles.subQuestionsContainer}>
              <Text style={styles.subQuestionsLabel}>We might also explore:</Text>
              {topic.sub_questions.map((question, index) => (
                <View key={index} style={styles.subQuestion}>
                  <Text style={styles.questionBullet}>•</Text>
                  <Text style={styles.questionText}>{question}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Ready for a natural conversation?</Text>
            <Text style={styles.instructionsDescription}>
              This is a two-way discussion where you'll explore the topic in depth. 
              The AI examiner will ask follow-up questions based on your responses, 
              just like in a real IELTS Speaking test.
            </Text>
            
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Tips for success:</Text>
              <Text style={styles.tipText}>• Give detailed, well-developed answers</Text>
              <Text style={styles.tipText}>• Express and justify your opinions</Text>
              <Text style={styles.tipText}>• Use a range of vocabulary and structures</Text>
              <Text style={styles.tipText}>• Speak naturally and conversationally</Text>
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity 
            style={[styles.startButton, isProcessing && styles.startButtonDisabled]} 
            onPress={startSession} 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator color="#FFF" />
                <Text style={[styles.startButtonText, { marginLeft: 8 }]}>Setting up...</Text>
              </>
            ) : (
              <Text style={styles.startButtonText}>Start Discussion</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        // During-session view
        <View style={styles.sessionContainer}>
          {/* Conversation Log */}
          <View style={styles.conversationWrapper}>
            <Text style={styles.conversationTitle}>Discussion in Progress</Text>
            <ScrollView 
              style={styles.conversationScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.conversationContent}
            >
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[styles.messageBubble, msg.role === 'user' ? styles.userMessage : styles.assistantMessage]}
                >
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageRole}>
                      {msg.role === 'user' ? 'You' : 'Examiner'}
                    </Text>
                    {msg.role === 'assistant' && (
                      <TouchableOpacity 
                        style={styles.listenButton}
                        onPress={() => handleListenToMessage(msg.text)}
                        disabled={isPlayingAudio}
                      >
                        <Text style={styles.listenButtonText}>
                          {isPlayingAudio ? 'Playing...' : '🔊 Listen'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={[styles.messageText, msg.role === 'user' && styles.userMessageText]}>
                    {msg.text}
                  </Text>
                </View>
              ))}
              {isProcessing && (
                <View style={styles.processingIndicator}>
                  <ActivityIndicator color={Colors.primary.main} />
                  <Text style={styles.processingText}>Analyzing your response...</Text>
                </View>
              )}
              {isPlayingAudio && (
                <View style={styles.processingIndicator}>
                  <ActivityIndicator color={Colors.secondary.main} />
                  <Text style={styles.processingText}>Examiner is responding...</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Controls Container */}
          <View style={styles.controlsContainer}>
            {/* Audio Recorder */}
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              disabled={isProcessing}
            />

            {/* End Session Button */}
            <TouchableOpacity style={styles.endButton} onPress={endSession} disabled={isProcessing}>
              <Text style={styles.endButtonText}>Finish Discussion</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 16,
  },
  partLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary.main,
    lineHeight: 26,
  },
  mainQuestionContainer: {
    marginBottom: 16,
  },
  mainQuestionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  mainQuestion: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    fontWeight: '500',
  },
  subQuestionsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subQuestionsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  subQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  questionBullet: {
    fontWeight: '600',
    color: Colors.secondary.main,
    marginRight: 8,
    marginTop: 2,
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
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  instructionsDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
    marginBottom: 16,
  },
  tipsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary.main,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 4,
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
  sessionContainer: {
    flex: 1,
    padding: 16,
  },
  conversationWrapper: {
    flex: 1,
    marginBottom: 16,
  },
  conversationScrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  conversationContent: {
    paddingBottom: 20,
  },
  controlsContainer: {
    paddingBottom: 20,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 12,
  },
  messageBubble: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    backgroundColor: Colors.primary.main,
    marginLeft: 20,
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: '#f1f5f9',
    marginRight: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageRole: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
  listenButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
  },
  listenButtonText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
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
