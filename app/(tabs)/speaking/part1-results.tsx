import { QuestionResult } from '@/components/speaking';
import { Colors } from '@/constants/theme';
import type { AssessmentResult, Part1Answer } from '@/services';
import { testHistoryService } from '@/services/test-history-service';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SingleResultParams {
  result: AssessmentResult;
  questionText: string;
  questionNumber: number;
}

export default function Part1ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [singleResult, setSingleResult] = useState<SingleResultParams | null>(null);
  const [allResults, setAllResults] = useState<Part1Answer[] | null>(null);
  const [sessionDetail, setSessionDetail] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    // Check if showing single question result, all results, or session detail
    if (params.singleResult) {
      try {
        const data = JSON.parse(params.singleResult as string);
        setSingleResult(data);
      } catch (error) {
        console.error('Error parsing single result:', error);
      }
    } else if (params.results) {
      try {
        const data = JSON.parse(params.results as string);
        setAllResults(data);
      } catch (error) {
        console.error('Error parsing results:', error);
      }
    } else if (params.sessionDetail) {
      try {
        const data = JSON.parse(params.sessionDetail as string);
        setSessionDetail(data);
      } catch (error) {
        console.error('Error parsing session detail:', error);
      }
    }
  }, [params.singleResult, params.results, params.sessionDetail]);

  // Moved this to the render section to avoid hooks rule violation

  // Calculate statistics from all results
  const statistics = React.useMemo(() => {
    if (!allResults) return null;

    const completedResults = allResults.filter(a => a.result);
    
    if (completedResults.length === 0) return null;

    const totalPronunciation = completedResults.reduce((sum, a) => 
      sum + (a.result?.pronunciation.overall || 0), 0);
    const totalBand = completedResults.reduce((sum, a) => 
      sum + (a.result?.overallBand || 0), 0);

    return {
      averagePronunciation: totalPronunciation / completedResults.length,
      averageBand: totalBand / completedResults.length,
      totalCompleted: completedResults.length,
      totalQuestions: allResults.length,
    };
  }, [allResults]);

  const getBandColor = (score: number) => {
    if (score >= 8.0) return Colors.accent.success;     // Green for excellent
    if (score >= 7.0) return Colors.primary.main;       // Navy for good
    if (score >= 6.0) return Colors.secondary.main;     // Orange for competent
    return Colors.accent.error;                         // Red for limited
  };

  const getPronunciationColor = (score: number) => {
    if (score >= 90) return Colors.accent.success;      // Green 90-100%
    if (score >= 80) return Colors.primary.main;        // Navy 80-89%
    if (score >= 70) return Colors.secondary.main;      // Orange 70-79%
    return Colors.accent.error;                         // Red <70%
  };

  // Save test session to database
  const saveTestSession = async () => {
    if (!allResults || !statistics || hasSaved) return;

    setIsSaving(true);
    try {
      const completedAnswers = allResults.filter(a => a.result);
      const strengths = [];
      const improvements = [];

      // Analyze strengths and improvements
      if (statistics.averageBand >= 7.0) {
        strengths.push('Good fluency and coherence');
      }
      if (statistics.averagePronunciation >= 85) {
        strengths.push('Clear pronunciation');
      }
      if (statistics.averageBand < 6.5) {
        improvements.push('Work on grammar accuracy');
      }
      if (statistics.averagePronunciation < 80) {
        improvements.push('Practice pronunciation');
      }

      // Calculate detailed scores (convert from band scores)
      const overallScore = Math.round(statistics.averageBand * 10) / 10;
      const pronunciationScore = Math.round((statistics.averagePronunciation / 10)) / 10;
      
      await testHistoryService.saveTestSession({
        test_type: 1, // Part 1
        topic_title: 'Part 1 - Personal Questions',
        topic_category: 'personal',
        duration_seconds: 300, // Assume 5 minutes for Part 1
        overall_score: overallScore,
        pronunciation_score: pronunciationScore,
        fluency_score: overallScore * 0.9, // Estimate
        grammar_score: overallScore * 1.1 > 9 ? 9 : overallScore * 1.1, // Estimate
        vocabulary_score: overallScore, // Estimate
        questions_count: statistics.totalCompleted,
        questions_data: completedAnswers.map((answer, index) => ({
          question_number: index + 1,
          transcript: answer.result?.transcript,
          band_score: answer.result?.overallBand,
          pronunciation_score: answer.result?.pronunciation.overall,
        })),
        overall_feedback: statistics.averageBand >= 7.0 
          ? 'Good performance in Part 1. You demonstrated good fluency and vocabulary.'
          : 'Continue practicing to improve your speaking skills. Focus on clarity and grammar.',
        strengths,
        improvements,
        detailed_feedback: {
          pronunciation: statistics.averagePronunciation,
          band_average: statistics.averageBand,
          completed_questions: statistics.totalCompleted,
          total_questions: statistics.totalQuestions,
        },
      });

      setHasSaved(true);
      Alert.alert('Đã lưu!', 'Kết quả của bạn đã được lưu vào lịch sử.');
    } catch (error) {
      console.error('Failed to save test session:', error);
      Alert.alert('Lỗi', 'Không thể lưu kết quả. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* If showing single question result */}
      {singleResult ? (
        <View style={styles.container}>
          <QuestionResult 
            result={singleResult.result}
            questionText={singleResult.questionText}
            questionNumber={singleResult.questionNumber}
          />
          <View style={styles.singleResultActions}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : sessionDetail ? (
        // Session detail view
        <View style={styles.container}>
          <LinearGradient
            colors={[Colors.primary.main, Colors.secondary.main]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Chi tiết kết quả</Text>
              <Text style={styles.headerSubtitle}>
                {sessionDetail.session.topic_title}
              </Text>
            </View>
          </LinearGradient>

          {/* Session info */}
          <View style={styles.sessionInfoContainer}>
            <Text style={styles.sessionInfoTitle}>Thông tin bài kiểm tra</Text>
            <View style={styles.sessionInfoRow}>
              <Text style={styles.sessionInfoLabel}>Loại:</Text>
              <Text style={styles.sessionInfoValue}>
                {sessionDetail.session.test_type === 1 ? 'Part 1' : 'Part 2'}
              </Text>
            </View>
            <View style={styles.sessionInfoRow}>
              <Text style={styles.sessionInfoLabel}>Thời gian:</Text>
              <Text style={styles.sessionInfoValue}>
                {Math.floor(sessionDetail.session.duration_seconds / 60)}:{String(sessionDetail.session.duration_seconds % 60).padStart(2, '0')}
              </Text>
            </View>
            <View style={styles.sessionInfoRow}>
              <Text style={styles.sessionInfoLabel}>Số câu hỏi:</Text>
              <Text style={styles.sessionInfoValue}>
                {sessionDetail.session.questions_count}
              </Text>
            </View>
            <View style={styles.sessionInfoRow}>
              <Text style={styles.sessionInfoLabel}>Hoàn thành:</Text>
              <Text style={styles.sessionInfoValue}>
                {new Date(sessionDetail.session.completed_at).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          {/* Overall score */}
          <View style={styles.overallContainer}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Điểm tổng kết</Text>
              <Text
                style={[
                  styles.scoreValue,
                  { color: getBandColor(sessionDetail.session.overall_score || 0) },
                ]}
              >
                {sessionDetail.session.overall_score?.toFixed(1) || 'N/A'}/9.0
              </Text>
            </View>
          </View>

          {/* Detailed scores */}
          <View style={styles.detailedScoresContainer}>
            <Text style={styles.detailedScoresTitle}>Chi tiết điểm số</Text>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreRowLabel}>🗣️ Phát âm</Text>
              <Text style={[styles.scoreRowValue, { color: getBandColor(sessionDetail.session.pronunciation_score || 0) }]}>
                {sessionDetail.session.pronunciation_score?.toFixed(1) || 'N/A'}/9.0
              </Text>
            </View>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreRowLabel}>💬 Lưu loát</Text>
              <Text style={[styles.scoreRowValue, { color: getBandColor(sessionDetail.session.fluency_score || 0) }]}>
                {sessionDetail.session.fluency_score?.toFixed(1) || 'N/A'}/9.0
              </Text>
            </View>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreRowLabel}>📝 Ngữ pháp</Text>
              <Text style={[styles.scoreRowValue, { color: getBandColor(sessionDetail.session.grammar_score || 0) }]}>
                {sessionDetail.session.grammar_score?.toFixed(1) || 'N/A'}/9.0
              </Text>
            </View>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreRowLabel}>📚 Từ vựng</Text>
              <Text style={[styles.scoreRowValue, { color: getBandColor(sessionDetail.session.vocabulary_score || 0) }]}>
                {sessionDetail.session.vocabulary_score?.toFixed(1) || 'N/A'}/9.0
              </Text>
            </View>
          </View>

          {/* Questions data if available */}
          {sessionDetail.session.questions_data && sessionDetail.session.questions_data.length > 0 && (
            <View style={styles.questionsContainer}>
              <Text style={styles.questionsTitle}>Câu hỏi và trả lời</Text>
              {sessionDetail.session.questions_data.map((questionData: any, index: number) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={styles.questionText}>
                    Câu {index + 1}: {questionData.question_text}
                  </Text>
                  {questionData.transcript && (
                    <View style={styles.transcriptContainer}>
                      <Text style={styles.transcriptLabel}>Phiên âm:</Text>
                      <Text style={styles.transcriptText}>{questionData.transcript}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <>
          {/* Header */}
          <LinearGradient
            colors={[Colors.primary.main, Colors.secondary.main]}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Part 1 - Results Summary</Text>
            <Text style={styles.headerSubtitle}>
              Completed {statistics?.totalCompleted || 0}/{statistics?.totalQuestions || 9} questions
            </Text>
          </LinearGradient>

      {statistics && (
        <>
          {/* Overall Scores */}
          <View style={styles.overallContainer}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Phát âm trung bình</Text>
              <Text
                style={[
                  styles.scoreValue,
                  { color: getPronunciationColor(statistics.averagePronunciation) },
                ]}
              >
                {statistics.averagePronunciation.toFixed(1)}
              </Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Band score trung bình</Text>
              <Text
                style={[
                  styles.scoreValue,
                  { color: getBandColor(statistics.averageBand) },
                ]}
              >
                {statistics.averageBand.toFixed(1)}
              </Text>
              <Text style={styles.scoreMax}>/9.0</Text>
            </View>
          </View>

          {/* Individual Question Results */}
          <View style={styles.questionsList}>
            <Text style={styles.questionsListTitle}>Kết quả từng câu hỏi:</Text>
            {allResults?.map((answer, index) => {
              if (!answer.result) {
                return (
                  <View key={index} style={styles.questionItem}>
                    <Text style={styles.questionNumber}>Câu {index + 1}</Text>
                    <Text style={styles.noResult}>Chưa chấm điểm</Text>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.questionItem}
                  onPress={() => {
                    // Navigate to single question result
                    router.push({
                      pathname: '/(tabs)/speaking/part1-results' as any,
                      params: {
                        singleResult: JSON.stringify({
                          result: answer.result,
                          questionText: `Question ${index + 1}`, // You can pass actual question text
                          questionNumber: index + 1,
                        }),
                      },
                    });
                  }}
                >
                  <View style={styles.questionItemHeader}>
                    <Text style={styles.questionNumber}>Câu {index + 1}</Text>
                    <View style={[styles.bandBadge, { backgroundColor: getBandColor(answer.result.overallBand) }]}>
                      <Text style={styles.bandBadgeText}>Band {answer.result.overallBand}</Text>
                    </View>
                  </View>
                  <Text style={styles.transcriptPreview} numberOfLines={2}>
                    {answer.result.transcript}
                  </Text>
                  <Text style={styles.viewDetails}>Xem chi tiết →</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback Section */}
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackTitle}>🎯 Nhận xét chung</Text>
            <Text style={styles.feedbackText}>
              Bạn đã hoàn thành {statistics.totalCompleted} câu hỏi trong Part 1 với 
              band score trung bình là <Text style={styles.bold}>{statistics.averageBand.toFixed(1)}</Text>.
            </Text>
            {statistics.averageBand >= 7.0 ? (
              <Text style={styles.feedbackText}>
                ✨ Kết quả tốt! Bạn đã thể hiện khả năng giao tiếp tự nhiên và sử dụng từ vựng đa dạng.
              </Text>
            ) : (
              <Text style={styles.feedbackText}>
                💡 Tiếp tục luyện tập để cải thiện khả năng phát âm, sử dụng từ vựng đa dạng hơn và trả lời mạch lạc hơn.
              </Text>
            )}
          </View>
        </>
      )}

      {!statistics && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Chưa có dữ liệu</Text>
          <Text style={styles.feedbackText}>
            Hãy hoàn thành ít nhất 1 câu hỏi để xem thống kê.
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {!hasSaved && (
          <TouchableOpacity 
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
            onPress={saveTestSession}
            disabled={isSaving}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? 'Đang lưu...' : '💾 Lưu kết quả'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/(tabs)/statistics' as any)}
        >
          <Text style={styles.secondaryButtonText}>📊 Xem thống kê</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/(tabs)/speaking/part1' as any)}
        >
          <Text style={styles.primaryButtonText}>Luyện tập lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(tabs)/speaking' as any)}
        >
          <Text style={styles.secondaryButtonText}>Về Speaking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  singleResultActions: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  backButton: {
    backgroundColor: Colors.primary.main,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
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
  
  // Overall Score Section
  overallContainer: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreMax: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  
  // Questions List
  questionsList: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 16,
  },
  questionItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  questionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  bandBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bandBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  transcriptPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  viewDetails: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  noResult: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  
  // Feedback Section
  feedbackContainer: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary.main,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '600',
    color: Colors.primary.main,
  },
  
  // Actions
  actionsContainer: {
    padding: 20,
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: Colors.primary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  secondaryButtonText: {
    color: Colors.primary.main,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Session detail styles
  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerBackButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  headerBackText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  headerContent: {
    flex: 1,
  },
  sessionInfoContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sessionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sessionInfoLabel: {
    fontSize: 16,
    color: '#666',
  },
  sessionInfoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  detailedScoresContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailedScoresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scoreRowLabel: {
    fontSize: 16,
    color: '#333',
  },
  scoreRowValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  questionsContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  questionItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  transcriptContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  // Loading & Error
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
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.accent.error,
    marginBottom: 20,
  },
});
