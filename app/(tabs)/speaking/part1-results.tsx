import { QuestionResult } from '@/components/speaking';
import { Colors } from '@/constants/theme';
import type { AssessmentResult, Part1Answer } from '@/services';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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

  useEffect(() => {
    // Check if showing single question result or all results
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
    }
  }, [params.singleResult, params.results]);

  // If showing single question result
  if (singleResult) {
    return (
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
    );
  }

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

  return (
    <ScrollView style={styles.container}>
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
