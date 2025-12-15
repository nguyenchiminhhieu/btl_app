import { AudioRecorder } from '@/components/speaking';
import { Colors } from '@/constants/theme';
import { part2Service, type Part2TopicWithCueCard } from '@/services';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function Part2RecordingScreen() {
  const params = useLocalSearchParams();
  const [topicData, setTopicData] = useState<Part2TopicWithCueCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);

  const topicId = params.topicId as string;

  useEffect(() => {
    loadTopicData();
  }, [topicId]);

  const loadTopicData = async () => {
    if (!topicId) {
      setError('No topic ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await part2Service.getTopicWithCueCard(topicId);
      setTopicData(data);
    } catch (error) {
      console.error('Error loading topic data:', error);
      setError('Failed to load topic data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordingComplete = (uri: string) => {
    console.log('✅ Recording completed:', uri);
    setAudioUri(uri);
    setRecordingComplete(true);
  };

  const handleAssessment = async () => {
    if (!audioUri || !topicData) {
      Alert.alert('Lỗi', 'Vui lòng thu âm câu trả lời trước khi chấm điểm.');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🎯 Starting Part 2 assessment...');
      
      const result = await part2Service.assessPart2Speaking({
        audioUri,
        topicId: topicData.id,
        cueCardId: topicData.cue_card.id,
        cueCard: topicData.cue_card,
        topic: topicData,
      });

      console.log('✅ Assessment completed:', result);

      // Navigate to results screen
      router.push({
        pathname: '/(tabs)/speaking/part2-results' as any,
        params: {
          result: JSON.stringify({
            result,
            topicTitle: topicData.title,
            mainPrompt: topicData.cue_card.main_prompt,
            category: topicData.category,
          }),
        },
      });
    } catch (error) {
      console.error('💥 Assessment error:', error);
      Alert.alert('Lỗi', 'Không thể chấm điểm. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setAudioUri(null);
    setRecordingComplete(false);
  };

  const handleBack = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn quay lại? Bản thu âm sẽ bị mất.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Quay lại', 
          style: 'destructive',
          onPress: () => router.back()
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading recording screen...</Text>
      </View>
    );
  }

  if (error || !topicData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Colors.accent.error} />
        <Text style={styles.errorText}>Failed to load recording screen</Text>
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
        colors={[Colors.primary.main, Colors.secondary.main]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Recording</Text>
            <Text style={styles.headerSubtitle}>
              Speak for 1-2 minutes continuously
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Topic Info */}
      <View style={styles.topicInfoContainer}>
        <View style={styles.topicHeader}>
          <Ionicons name="mic" size={24} color={Colors.primary.main} />
          <Text style={styles.topicTitle}>{topicData.title}</Text>
        </View>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: topicData.difficulty_level === 'beginner' ? Colors.accent.success : 
                             topicData.difficulty_level === 'intermediate' ? Colors.secondary.main : Colors.accent.error }
        ]}>
          <Text style={styles.difficultyText}>
            {topicData.difficulty_level?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Cue Card Summary */}
      <View style={styles.cueCardSummary}>
        <Text style={styles.summaryTitle}>📋 Your Task</Text>
        <Text style={styles.mainPrompt}>{topicData.cue_card.main_prompt}</Text>
        
        <Text style={styles.bulletTitle}>Key points to cover:</Text>
        <View style={styles.bulletPoints}>
          {topicData.cue_card.bullet_points.map((point, index) => (
            <Text key={index} style={styles.bulletPoint}>
              • {point}
            </Text>
          ))}
        </View>
      </View>

      {/* Recording Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📢 Recording Instructions</Text>
        <View style={styles.instruction}>
          <Text style={styles.instructionNumber}>1</Text>
          <Text style={styles.instructionText}>Speak clearly and naturally</Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.instructionNumber}>2</Text>
          <Text style={styles.instructionText}>Aim for 1-2 minutes of continuous speech</Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.instructionNumber}>3</Text>
          <Text style={styles.instructionText}>Follow the cue card structure</Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.instructionNumber}>4</Text>
          <Text style={styles.instructionText}>Use discourse markers (firstly, then, finally)</Text>
        </View>
      </View>

      {/* Recording Area */}
      <View style={styles.recordingContainer}>
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.processingText}>
              Analyzing your response...
            </Text>
          </View>
        ) : (
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={150} // 2.5 minutes max for Part 2
            disabled={isProcessing}
          />
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {recordingComplete && (
          <>
            <TouchableOpacity 
              style={styles.retryRecordingButton} 
              onPress={handleRetry}
              disabled={isProcessing}
            >
              <Ionicons name="refresh" size={20} color={Colors.secondary.main} />
              <Text style={styles.retryRecordingText}>Re-record</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.assessButton, isProcessing && styles.disabledButton]} 
              onPress={handleAssessment}
              disabled={isProcessing}
            >
              <Ionicons name="analytics" size={20} color="#FFF" />
              <Text style={styles.assessButtonText}>Get Assessment</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {recordingComplete && (
        <View style={styles.completionInfo}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.accent.success} />
          <Text style={styles.completionText}>
            Great! Recording completed. Tap "Get Assessment" to see your score.
          </Text>
        </View>
      )}
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
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 4,
  },
  topicInfoContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginLeft: 12,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cueCardSummary: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 12,
  },
  mainPrompt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  bulletTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  bulletPoints: {
    marginLeft: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  instructionsContainer: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.info,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 16,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent.info,
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  recordingContainer: {
    margin: 20,
    marginTop: 0,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    margin: 20,
    marginTop: 0,
    flexDirection: 'row',
    gap: 12,
  },
  retryRecordingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.secondary.main,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryRecordingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondary.main,
  },
  assessButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assessButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  completionInfo: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.success,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#166534',
    flex: 1,
    lineHeight: 20,
  },
});