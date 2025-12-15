import { AudioRecorder } from '@/components/speaking';
import { Colors } from '@/constants/theme';
import { getTopicWithCueCard, part2Service, type Part2TopicWithCueCard } from '@/services';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Part2CueCardScreen() {
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const [topicData, setTopicData] = useState<Part2TopicWithCueCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preparationNotes, setPreparationNotes] = useState('');
  const [preparationTime, setPreparationTime] = useState(60); // 60 seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerAnimation] = useState(new Animated.Value(0));
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);

  useEffect(() => {
    if (topicId) {
      loadTopic();
    }
  }, [topicId]);

  useEffect(() => {
    let interval: any;
    
    if (isTimerActive && preparationTime > 0) {
      interval = setInterval(() => {
        setPreparationTime(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            handlePreparationComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, preparationTime]);

  const loadTopic = async () => {
    try {
      setIsLoading(true);
      const data = await getTopicWithCueCard(topicId);
      setTopicData(data);
      setPreparationTime(data.cue_card.preparation_time);
    } catch (error) {
      console.error('Error loading topic:', error);
      Alert.alert('Error', 'Failed to load topic and cue card');
    } finally {
      setIsLoading(false);
    }
  };

  const startPreparation = () => {
    setIsTimerActive(true);
    // Start timer animation
    Animated.timing(timerAnimation, {
      toValue: 1,
      duration: preparationTime * 1000,
      useNativeDriver: false,
    }).start();
  };

  const handlePreparationComplete = () => {
    Alert.alert(
      '⏰ Preparation Time Up!',
      'Ready to start speaking?',
      [
        {
          text: 'More Time',
          style: 'cancel',
          onPress: () => {
            setPreparationTime(30); // Extra 30 seconds
            setIsTimerActive(false);
            timerAnimation.setValue(0);
          }
        },
        {
          text: 'Start Speaking',
          onPress: handleStartRecording
        }
      ]
    );
  };

  const handleStartRecording = () => {
    // Set preparation time to 0 to enable recording immediately
    setPreparationTime(0);
    setIsTimerActive(false);
  };

  const handleRecordingComplete = async (audioUri: string) => {
    if (!topicData) return;
    
    setIsRecording(false);
    setRecordingComplete(true);
    
    try {
      const assessment = await part2Service.assessPart2Speaking({
        audioUri,
        topicId: topicData.id,
        cueCardId: topicData.cue_card.id,
        preparationNotes,
        cueCard: topicData.cue_card,
        topic: topicData
      });

      router.push({
        pathname: '/(tabs)/speaking/part2-results',
        params: {
          assessmentData: JSON.stringify(assessment),
          topicTitle: topicData.title,
        }
      });
    } catch (error) {
      console.error('Assessment failed:', error);
      Alert.alert('Error', 'Failed to assess your speaking. Please try again.');
      setRecordingComplete(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colorMap: Record<string, string> = {
      beginner: '#10B981',
      intermediate: '#F59E0B',
      advanced: '#EF4444',
    };
    return colorMap[difficulty] || '#6B7280';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading cue card...</Text>
      </View>
    );
  }

  if (!topicData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load cue card</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary.main, Colors.primary.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="card" size={32} color="#FFF" />
          <Text style={styles.headerTitle}>Cue Card</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{topicData.difficulty_level.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.headerCategory}>{topicData.category}</Text>
      </LinearGradient>

      {/* Timer Section */}
      <View style={styles.timerContainer}>
        <View style={styles.timerHeader}>
          <Ionicons name="time" size={24} color={Colors.primary.main} />
          <Text style={styles.timerTitle}>Preparation Time</Text>
        </View>
        
        <View style={styles.timerCircle}>
          <Text style={[
            styles.timerText,
            { color: preparationTime <= 10 ? '#EF4444' : Colors.primary.main }
          ]}>
            {formatTime(preparationTime)}
          </Text>
          <Text style={styles.timerLabel}>seconds</Text>
        </View>
        
        {!isTimerActive && preparationTime > 0 ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startPreparation}
          >
            <Ionicons name="play" size={20} color="#FFF" />
            <Text style={styles.startButtonText}>Start Timer</Text>
          </TouchableOpacity>
        ) : preparationTime === 0 ? (
          <View style={styles.recordingSection}>
            <AudioRecorder 
              onRecordingComplete={handleRecordingComplete}
              onRecordingStateChange={setIsRecording}
              maxDuration={150000}
              disabled={recordingComplete}
            />
            {isRecording && (
              <View style={styles.recordingIndicatorBox}>
                <Ionicons name="mic" size={16} color="#EF4444" />
                <Text style={styles.recordingIndicator}>
                  Recording in progress...
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.timerStatusBox}>
            <Ionicons name="hourglass" size={16} color="#F59E0B" />
            <Text style={styles.timerStatus}>Preparation in progress...</Text>
          </View>
        )}
      </View>

      {/* Cue Card - Main Prompt */}
      <View style={styles.cueCardContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text" size={20} color={Colors.primary.main} />
          <Text style={styles.sectionTitle}>Main Prompt</Text>
        </View>
        <View style={styles.mainPromptCard}>
          <Text style={styles.mainPrompt}>{topicData.cue_card.main_prompt}</Text>
        </View>
      </View>

      {/* Cue Card - Bullet Points */}
      <View style={styles.bulletContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="list" size={20} color={Colors.primary.main} />
          <Text style={styles.sectionTitle}>Points to Cover</Text>
        </View>
        <View style={styles.bulletPointsCard}>
          {topicData.cue_card.bullet_points.map((point, index) => (
            <View key={index} style={[styles.bulletPoint, index < topicData.cue_card.bullet_points.length - 1 && styles.bulletPointBorder]}>
              <View style={styles.bulletCircle}>
                <Text style={styles.bulletNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.bulletText}>{point}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Follow-up Question */}
      <View style={styles.followUpSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="help-circle" size={20} color="#14B8A6" />
          <Text style={styles.sectionTitle}>Follow-up Question</Text>
        </View>
        <View style={styles.followUpContainer}>
          <Text style={styles.followUpText}>
            {topicData.cue_card.follow_up_question}
          </Text>
        </View>
      </View>

      {/* Speaking Duration Info */}
      <View style={styles.timingSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="stopwatch" size={20} color={Colors.secondary.main} />
          <Text style={styles.sectionTitle}>Speaking Duration</Text>
        </View>
        <View style={[styles.timingCard, { borderLeftColor: Colors.secondary.main }]}>
          <Text style={styles.timingValue}>
            {topicData.cue_card.speaking_time_min}-{topicData.cue_card.speaking_time_max} seconds
          </Text>
          <Text style={styles.timingSubtext}>Aim for approximately 2 minutes</Text>
        </View>
      </View>

      {/* Notes Section */}
      <View style={[
        styles.notesContainer,
        isRecording && styles.notesContainerRecording
      ]}>
        <Text style={styles.notesTitle}>
          📝 Preparation Notes {isRecording && '(Refer to these while speaking!)'}
        </Text>
        <Text style={styles.notesSubtitle}>
          {isRecording 
            ? "👀 Keep these notes visible while you speak!" 
            : "Use this space to organize your thoughts and plan your answer"
          }
        </Text>
        <TextInput
          style={[
            styles.notesInput,
            isRecording && styles.notesInputRecording
          ]}
          placeholder="Write your notes here...&#10;• Key points to mention&#10;• Examples to use&#10;• Structure your answer"
          placeholderTextColor="#999"
          value={preparationNotes}
          onChangeText={setPreparationNotes}
          multiline
          textAlignVertical="top"
          editable={!isRecording}
        />
        {isRecording && preparationNotes && (
          <View style={styles.recordingNotesHighlight}>
            <Text style={styles.recordingNotesText}>
              🎤 Recording in progress - Use your notes above as a guide!
            </Text>
          </View>
        )}
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Preparation Tips</Text>
        <View style={styles.tip}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.tipText}>Plan your structure: intro → main points → conclusion</Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.tipText}>Think of specific examples and details</Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.tipText}>Practice key vocabulary and phrases</Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.tipText}>Remember: aim for 1-2 minutes of speech</Text>
        </View>
      </View>

      {/* Skip Preparation Button */}
      <View style={styles.skipContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            Alert.alert(
              'Skip Preparation?',
              'Are you sure you want to start recording without preparation?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Skip & Record', onPress: handleStartRecording }
              ]
            );
          }}
        >
          <Text style={styles.skipButtonText}>Skip Preparation & Start Recording</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  timerContainer: {
    margin: 20,
    marginTop: 12,
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
    width: '100%',
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F8F9FA',
    borderWidth: 4,
    borderColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recordingSection: {
    width: '100%',
  },
  recordingIndicatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  recordingIndicator: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  timerStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  timerStatus: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  cueCardContainer: {
    margin: 20,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  mainPromptCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary.main,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainPrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.main,
    lineHeight: 26,
  },
  bulletContainer: {
    margin: 20,
    marginTop: 12,
  },
  bulletPointsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bulletPoint: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletPointBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bulletCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
  },
  bulletNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  bulletText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  followUpSection: {
    margin: 20,
    marginTop: 12,
  },
  followUpContainer: {
    backgroundColor: '#F0F9FF',
    padding: 18,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6',
  },
  followUpText: {
    fontSize: 15,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 22,
    fontWeight: '500',
  },
  timingSection: {
    margin: 20,
    marginTop: 12,
  },
  timingContainer: {
    margin: 20,
    marginTop: 12,
  },
  timingCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timingTitle: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  timingValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.secondary.main,
    marginBottom: 4,
  },
  timingSubtext: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  notesContainer: {
    margin: 20,
    marginTop: 12,
  },
  notesContainerRecording: {
    backgroundColor: '#FEF3E2',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    padding: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  notesSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notesInputRecording: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 2,
    fontSize: 15,
    fontWeight: '500',
  },
  recordingNotesHighlight: {
    backgroundColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  recordingNotesText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  tipsContainer: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    lineHeight: 18,
  },
  skipContainer: {
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
  },
  skipButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
});