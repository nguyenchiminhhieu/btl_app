import { AudioRecorder } from '@/components/speaking';
import {
  assessSpeaking,
  getRandomPart1Topics,
  type Part1Answer,
  type Part1SessionData
} from '@/services';
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

export default function Part1Screen() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<Part1SessionData | null>(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Part1Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAudioUri, setCurrentAudioUri] = useState<string | null>(null);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setIsLoading(true);
      const data = await getRandomPart1Topics();
      setSessionData(data);
      
      // Initialize 9 empty answers
      const emptyAnswers: Part1Answer[] = [];
      data.topics.forEach(topic => {
        topic.questions.forEach(question => {
          emptyAnswers.push({
            questionId: question.id,
            isProcessing: false,
          });
        });
      });
      setAnswers(emptyAnswers);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải câu hỏi. Vui lòng thử lại.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleRecordingComplete = async (audioUri: string) => {
    const currentQuestion = getCurrentQuestion();
    const currentTopic = getCurrentTopic();
    
    if (!currentQuestion || !currentTopic) return;

    // Save audio URI without processing yet
    const answerIndex = getOverallProgress() - 1;
    const newAnswers = [...answers];
    newAnswers[answerIndex] = {
      questionId: currentQuestion.id,
      audioUri,
      isProcessing: false,
    };
    setAnswers(newAnswers);

    Alert.alert('✅ Đã ghi âm', 'Nhấn "Chấm điểm" để xem kết quả hoặc tiếp tục câu hỏi tiếp theo.');
  };

  const handleScoreQuestion = async () => {
    const answerIndex = getOverallProgress() - 1;
    const currentAnswer = answers[answerIndex];
    const currentQuestion = getCurrentQuestion();
    const currentTopic = getCurrentTopic();

    if (!currentAnswer?.audioUri || !currentQuestion || !currentTopic) {
      Alert.alert('Chưa có ghi âm', 'Vui lòng ghi âm câu trả lời trước.');
      return;
    }

    // If already scored, show result
    if (currentAnswer.result) {
      router.push({
        pathname: '/(tabs)/speaking/part1-results' as any,
        params: { 
          singleResult: JSON.stringify({
            result: currentAnswer.result,
            questionText: currentQuestion.question_text,
            questionNumber: getOverallProgress(),
          }),
        },
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Call assessment API
      const result = await assessSpeaking({
        audioUri: currentAnswer.audioUri,
        questionId: currentQuestion.id,
        topicId: currentTopic.id,
        questionText: currentQuestion.question_text,
        part: 1,
      });

      // Update answer with result
      const newAnswers = [...answers];
      newAnswers[answerIndex] = {
        ...currentAnswer,
        result,
        isProcessing: false,
      };
      setAnswers(newAnswers);

      // Navigate to result screen
      router.push({
        pathname: '/(tabs)/speaking/part1-results' as any,
        params: { 
          singleResult: JSON.stringify({
            result,
            questionText: currentQuestion.question_text,
            questionNumber: getOverallProgress(),
          }),
        },
      });
    } catch (error) {
      console.error('Error assessing speaking:', error);
      Alert.alert('Lỗi', 'Không thể chấm điểm. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentQuestion = () => {
    if (!sessionData) return null;
    return sessionData.topics[currentTopicIndex].questions[currentQuestionIndex];
  };

  const getCurrentTopic = () => {
    if (!sessionData) return null;
    return sessionData.topics[currentTopicIndex];
  };

  const getOverallProgress = () => {
    return currentTopicIndex * 3 + currentQuestionIndex + 1;
  };

  const handleNextQuestion = () => {
    const answerIndex = getOverallProgress() - 1;
    const hasRecorded = answers[answerIndex]?.audioUri;

    if (!hasRecorded) {
      Alert.alert('Chưa hoàn thành', 'Vui lòng ghi âm câu trả lời trước khi tiếp tục.');
      return;
    }

    if (currentQuestionIndex < 2) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentTopicIndex < 2) {
      setCurrentTopicIndex(currentTopicIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Hoàn thành tất cả 9 câu - chuyển sang results với data
      router.push({
        pathname: '/(tabs)/speaking/part1-results' as any,
        params: { results: JSON.stringify(answers) },
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
      </View>
    );
  }

  if (!sessionData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải câu hỏi</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTopics}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isStarted) {
    return (
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>IELTS Speaking Part 1</Text>
        <Text style={styles.welcomeSubtitle}>
          Chào mừng đến với phòng luyện tập Part 1
        </Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📝 3 chủ đề</Text>
          <Text style={styles.infoText}>❓ 9 câu hỏi (3 câu/chủ đề)</Text>
          <Text style={styles.infoText}>⏱️ 20-30 giây/câu trả lời</Text>
          <Text style={styles.infoText}>💯 Kết quả sau khi hoàn thành</Text>
        </View>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Bắt đầu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentTopic = getCurrentTopic();
  const currentQuestion = getCurrentQuestion();

  return (
    <ScrollView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Câu {getOverallProgress()}/9
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(getOverallProgress() / 9) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Topic Name */}
      <View style={styles.topicContainer}>
        <Text style={styles.topicLabel}>Chủ đề:</Text>
        <Text style={styles.topicName}>{currentTopic?.topic_name}</Text>
        <Text style={styles.topicProgress}>
          Câu {currentQuestionIndex + 1}/3 trong chủ đề này
        </Text>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionLabel}>Câu hỏi:</Text>
        <Text style={styles.questionText}>{currentQuestion?.question_text}</Text>
      </View>

      {/* Recording Area */}
      <View style={styles.recordingContainer}>
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#E53935" />
            <Text style={styles.processingText}>
              Đang phân tích câu trả lời...
            </Text>
          </View>
        ) : (
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={30}
            disabled={isProcessing}
          />
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.scoreButton, !answers[getOverallProgress() - 1]?.audioUri && styles.disabledButton]} 
          onPress={handleScoreQuestion}
          disabled={!answers[getOverallProgress() - 1]?.audioUri}
        >
          <Text style={styles.scoreButtonText}>
            {answers[getOverallProgress() - 1]?.result ? '📊 Xem điểm' : '🎯 Chấm điểm'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.nextButton, !answers[getOverallProgress() - 1]?.audioUri && styles.disabledButton]} 
          onPress={handleNextQuestion}
          disabled={!answers[getOverallProgress() - 1]?.audioUri}
        >
          <Text style={styles.nextButtonText}>
            {getOverallProgress() < 9 ? 'Câu tiếp theo →' : 'Hoàn thành'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Topics Overview */}
      <View style={styles.overviewContainer}>
        <Text style={styles.overviewTitle}>Tổng quan:</Text>
        {sessionData.topics.map((topic, index) => (
          <View
            key={topic.id}
            style={[
              styles.topicItem,
              index === currentTopicIndex && styles.topicItemActive,
            ]}
          >
            <Text
              style={[
                styles.topicItemText,
                index === currentTopicIndex && styles.topicItemTextActive,
              ]}
            >
              {index + 1}. {topic.topic_name}
              {index < currentTopicIndex && ' ✅'}
              {index === currentTopicIndex && ' 🔵'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#E53935',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  topicContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 8,
  },
  topicLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  topicName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 4,
  },
  topicProgress: {
    fontSize: 14,
    color: '#666',
  },
  questionContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 8,
  },
  questionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
  },
  recordingContainer: {
    backgroundColor: '#FFF',
    padding: 24,
    marginTop: 8,
    alignItems: 'center',
    minHeight: 200,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  scoreButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scoreButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  overviewContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  topicItem: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  topicItemActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#1E88E5',
  },
  topicItemText: {
    fontSize: 15,
    color: '#666',
  },
  topicItemTextActive: {
    color: '#1E88E5',
    fontWeight: '600',
  },
});
