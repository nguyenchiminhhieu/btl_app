import { LineChart } from '@/components/charts';
import { Colors } from '@/constants/theme';
import { ChartDataPoint, testHistoryService, TestSession } from '@/services/test-history-service';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;

// Chart configuration
const chartConfig = {
  backgroundColor: '#FFF',
  backgroundGradientFrom: '#FFF',
  backgroundGradientTo: '#FFF',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#2563eb'
  },
  propsForBackgroundLines: {
    strokeDasharray: '5,5',
    stroke: '#e5e7eb',
    strokeWidth: 1,
  },
  propsForLabels: {
    fontSize: 12,
  },
};

type TabType = 'history' | 'chart';

export default function StatisticsScreen() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('history');
  
  // Chart state
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'overall' | 'pronunciation' | 'fluency' | 'grammar' | 'vocabulary'>('overall');
  const [selectedTestType, setSelectedTestType] = useState<'all' | 1 | 2>('all');
  const [timeRange, setTimeRange] = useState<30 | 90 | 180>(30);
  
  // History state  
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Error state for robustness
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  // Chart functions
  const loadChartData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const testType = selectedTestType === 'all' ? undefined : selectedTestType;
      const data = await testHistoryService.getChartData(testType, timeRange);
      setChartData(data);
    } catch (error) {
      console.error('Failed to load chart data:', error);
      setError('Không thể tải dữ liệu biểu đồ');
      Alert.alert('Lỗi', 'Không thể tải dữ liệu biểu đồ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTestType, timeRange]);

  // History functions
  const loadTestHistory = useCallback(async (page = 0, refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
        setError(null);
      } else {
        setIsLoading(page === 0);
        if (page === 0) setError(null);
      }

      const testType = selectedTestType === 'all' ? undefined : selectedTestType;
      const { sessions: newSessions, total } = await testHistoryService.getTestSessions(
        testType,
        PAGE_SIZE,
        page * PAGE_SIZE
      );

      if (page === 0 || refresh) {
        setSessions(newSessions);
      } else {
        setSessions(prev => [...prev, ...newSessions]);
      }

      setCurrentPage(page);
      setHasMore((page + 1) * PAGE_SIZE < total);
    } catch (error) {
      console.error('Failed to load test history:', error);
      setError('Không thể tải lịch sử');
      Alert.alert('Lỗi', 'Không thể tải lịch sử. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedTestType]);

  useEffect(() => {
    if (activeTab === 'chart') {
      loadChartData();
    } else {
      loadTestHistory();
    }
  }, [activeTab, loadChartData, loadTestHistory]);

  const handleRefresh = () => {
    if (activeTab === 'history') {
      loadTestHistory(0, true);
    } else {
      loadChartData();
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore && activeTab === 'history') {
      loadTestHistory(currentPage + 1);
    }
  };

  const deleteSession = async (sessionId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa bài test này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const success = await testHistoryService.deleteTestSession(sessionId);
            if (success) {
              setSessions(prev => prev.filter(s => s.id !== sessionId));
              Alert.alert('Đã xóa', 'Bài test đã được xóa khỏi lịch sử.');
            } else {
              Alert.alert('Lỗi', 'Không thể xóa bài test. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBandColor = (score?: number) => {
    if (!score) return '#999';
    if (score >= 8.0) return Colors.accent.success;
    if (score >= 7.0) return Colors.primary.main;
    if (score >= 6.0) return Colors.secondary.main;
    return Colors.accent.error;
  };

  const getTestTypeText = (testType: 1 | 2) => {
    return testType === 1 ? 'Part 1' : 'Part 2';
  };

  // Chart utility functions
  const getMetricValue = (dataPoint: ChartDataPoint) => {
    switch (selectedMetric) {
      case 'overall': return dataPoint.avg_overall;
      case 'pronunciation': return dataPoint.avg_pronunciation;
      case 'fluency': return dataPoint.avg_fluency;
      case 'grammar': return dataPoint.avg_grammar;
      case 'vocabulary': return dataPoint.avg_vocabulary;
      default: return dataPoint.avg_overall;
    }
  };

  const getMetricColor = () => {
    switch (selectedMetric) {
      case 'overall': return Colors.primary.main;
      case 'pronunciation': return Colors.accent.success;
      case 'fluency': return Colors.secondary.main;
      case 'grammar': return '#8B5CF6';
      case 'vocabulary': return '#F59E0B';
      default: return Colors.primary.main;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'overall': return 'Điểm tổng thể';
      case 'pronunciation': return 'Phát âm';
      case 'fluency': return 'Lưu loát';
      case 'grammar': return 'Ngữ pháp';
      case 'vocabulary': return 'Từ vựng';
      default: return 'Điểm tổng thể';
    }
  };

  // Process data for chart
  const processedData = React.useMemo(() => {
    if (chartData.length === 0) return null;

    // Group by date and calculate averages
    const groupedData = chartData.reduce((acc, item) => {
      const date = item.test_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, ChartDataPoint[]>);

    // Sort dates and take last 10 points for better visualization
    const sortedDates = Object.keys(groupedData).sort().slice(-10);
    
    const labels = sortedDates.map(date => {
      const d = new Date(date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    const datasets = [{
      data: sortedDates.map(date => {
        const dayData = groupedData[date];
        const avgValue = dayData.reduce((sum, item) => sum + getMetricValue(item), 0) / dayData.length;
        return Math.round(avgValue * 10) / 10; // Round to 1 decimal
      }),
      color: (opacity = 1) => getMetricColor() + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
      strokeWidth: 3,
    }];

    return {
      labels: labels.length > 0 ? labels : ['Chưa có dữ liệu'],
      datasets: datasets.length > 0 && datasets[0].data.length > 0 
        ? datasets 
        : [{ data: [0], color: () => '#ccc', strokeWidth: 2 }],
    };
  }, [chartData, selectedMetric]);

  // Calculate statistics
  const statistics = React.useMemo(() => {
    if (chartData.length === 0) return null;

    const values = chartData.map(getMetricValue).filter(v => v > 0);
    if (values.length === 0) return null;

    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Calculate trend (last vs first value)
    const recentValues = values.slice(-3); // Last 3 values
    const olderValues = values.slice(0, 3); // First 3 values
    const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;
    const trend = recentAvg - olderAvg;

    return {
      average: Math.round(average * 10) / 10,
      max: Math.round(max * 10) / 10,
      min: Math.round(min * 10) / 10,
      trend: Math.round(trend * 10) / 10,
      totalTests: chartData.reduce((sum, item) => sum + item.test_count, 0),
    };
  }, [chartData, selectedMetric]);

  // Render session component
  const renderSession = (session: TestSession) => (
    <View key={session.id} style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <View style={styles.typeAndDate}>
            <View style={[styles.typeBadge, { 
              backgroundColor: session.test_type === 1 ? Colors.primary.main + '20' : Colors.secondary.main + '20' 
            }]}>
              <Text style={[styles.typeBadgeText, { 
                color: session.test_type === 1 ? Colors.primary.main : Colors.secondary.main 
              }]}>
                {getTestTypeText(session.test_type)}
              </Text>
            </View>
            <Text style={styles.dateText}>{formatDate(session.completed_at)}</Text>
          </View>
          <Text style={styles.topicTitle} numberOfLines={1}>
            {session.topic_title}
          </Text>
          {session.topic_category && (
            <Text style={styles.topicCategory}>
              📂 {session.topic_category}
            </Text>
          )}
        </View>
        
        {session.overall_score && (
          <View style={[styles.scoreBadge, { borderColor: getBandColor(session.overall_score) }]}>
            <Text style={[styles.scoreText, { color: getBandColor(session.overall_score) }]}>
              {session.overall_score.toFixed(1)}
            </Text>
            <Text style={styles.scoreMax}>/9.0</Text>
          </View>
        )}
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>⏱️ Thời gian:</Text>
          <Text style={styles.detailValue}>{formatDuration(session.duration_seconds)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>❓ Câu hỏi:</Text>
          <Text style={styles.detailValue}>{session.questions_count}</Text>
        </View>

        {session.pronunciation_score && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>🗣️ Phát âm:</Text>
            <Text style={[styles.detailValue, { color: getBandColor(session.pronunciation_score) }]}>
              {session.pronunciation_score.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {session.overall_feedback && (
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackText} numberOfLines={2}>
            {session.overall_feedback}
          </Text>
        </View>
      )}

      <View style={styles.sessionActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert('Chi tiết', 'Tính năng xem chi tiết sẽ được thêm trong phiên bản tiếp theo.');
          }}
        >
          <Text style={styles.actionButtonText}>Chi tiết</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteSession(session.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show loading only on initial load for the active tab
  const showInitialLoading = isLoading && 
    ((activeTab === 'history' && sessions.length === 0) || 
     (activeTab === 'chart' && chartData.length === 0));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📊 Thống kê</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Show loading, error, or main content */}
      {showInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              if (activeTab === 'chart') {
                loadChartData();
              } else {
                loadTestHistory();
              }
            }}
          >
            <Text style={styles.retryButtonText}>🔄 Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            📝 Lịch sử
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chart' && styles.activeTab]}
          onPress={() => setActiveTab('chart')}
        >
          <Text style={[styles.tabText, activeTab === 'chart' && styles.activeTabText]}>
            📈 Biểu đồ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all' as const, label: 'Tất cả' },
          { key: 1 as const, label: 'Part 1' },
          { key: 2 as const, label: 'Part 2' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedTestType === filter.key && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedTestType(filter.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedTestType === filter.key && styles.activeFilterTabText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary.main]}
          />
        }
        onScroll={activeTab === 'history' ? ({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          
          if (isCloseToBottom && hasMore && !isLoading) {
            handleLoadMore();
          }
        } : undefined}
        scrollEventThrottle={400}
      >
        {activeTab === 'history' ? (
          <>
            {/* History Content */}
            {sessions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>📝 Chưa có lịch sử</Text>
                <Text style={styles.emptyText}>
                  Hoàn thành một bài luyện tập để xem kết quả tại đây.
                </Text>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => router.push('/(tabs)/speaking')}
                >
                  <Text style={styles.startButtonText}>Bắt đầu luyện tập</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {sessions.map(renderSession)}
                
                {/* Load More Indicator */}
                {isLoading && sessions.length > 0 && (
                  <View style={styles.loadMoreContainer}>
                    <ActivityIndicator color={Colors.primary.main} />
                    <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
                  </View>
                )}
                
                {!hasMore && sessions.length > 0 && (
                  <View style={styles.endContainer}>
                    <Text style={styles.endText}>🎉 Đã hiển thị tất cả kết quả</Text>
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Chart Content */}
            
            {/* Time Range Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khoảng thời gian</Text>
              <View style={styles.filterContainer}>
                {[
                  { key: 30, label: '30 ngày' },
                  { key: 90, label: '90 ngày' },
                  { key: 180, label: '6 tháng' },
                ].map(filter => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterButton,
                      timeRange === filter.key && styles.activeFilterButton,
                    ]}
                    onPress={() => setTimeRange(filter.key as 30 | 90 | 180)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        timeRange === filter.key && styles.activeFilterButtonText,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Metric Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chỉ số theo dõi</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.metricContainer}>
                  {[
                    { key: 'overall' as const, label: 'Tổng thể', icon: '🎯' },
                    { key: 'pronunciation' as const, label: 'Phát âm', icon: '🗣️' },
                    { key: 'fluency' as const, label: 'Lưu loát', icon: '💬' },
                    { key: 'grammar' as const, label: 'Ngữ pháp', icon: '📝' },
                    { key: 'vocabulary' as const, label: 'Từ vựng', icon: '📚' },
                  ].map(metric => (
                    <TouchableOpacity
                      key={metric.key}
                      style={[
                        styles.metricButton,
                        selectedMetric === metric.key && styles.activeMetricButton,
                        { borderColor: selectedMetric === metric.key ? getMetricColor() : '#E5E7EB' }
                      ]}
                      onPress={() => setSelectedMetric(metric.key)}
                    >
                      <Text style={styles.metricIcon}>{metric.icon}</Text>
                      <Text
                        style={[
                          styles.metricButtonText,
                          selectedMetric === metric.key && { color: getMetricColor() },
                        ]}
                      >
                        {metric.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Statistics Cards */}
            {statistics && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thống kê - {getMetricLabel()}</Text>
                <View style={styles.statsContainer}>
                  <View style={[styles.statCard, { borderLeftColor: getMetricColor() }]}>
                    <Text style={styles.statLabel}>Trung bình</Text>
                    <Text style={[styles.statValue, { color: getMetricColor() }]}>
                      {statistics.average}
                    </Text>
                  </View>
                  
                  <View style={[styles.statCard, { borderLeftColor: Colors.accent.success }]}>
                    <Text style={styles.statLabel}>Cao nhất</Text>
                    <Text style={[styles.statValue, { color: Colors.accent.success }]}>
                      {statistics.max}
                    </Text>
                  </View>
                  
                  <View style={[styles.statCard, { borderLeftColor: Colors.secondary.main }]}>
                    <Text style={styles.statLabel}>Tổng bài test</Text>
                    <Text style={[styles.statValue, { color: Colors.secondary.main }]}>
                      {statistics.totalTests}
                    </Text>
                  </View>
                  
                  <View style={[styles.statCard, { 
                    borderLeftColor: statistics.trend >= 0 ? Colors.accent.success : Colors.accent.error 
                  }]}>
                    <Text style={styles.statLabel}>Xu hướng</Text>
                    <Text style={[styles.statValue, { 
                      color: statistics.trend >= 0 ? Colors.accent.success : Colors.accent.error 
                    }]}>
                      {statistics.trend >= 0 ? '+' : ''}{statistics.trend}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Biểu đồ tiến độ - {getMetricLabel()}</Text>
              <View style={styles.chartContainer}>
                {processedData && processedData.datasets[0].data.some(val => val > 0) ? (
                  <LineChart
                    data={processedData}
                    width={chartWidth}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => getMetricColor() + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
                    }}
                    bezier
                    style={styles.chart}
                    withDots={true}
                    withShadow={false}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    fromZero={false}
                  />
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataIcon}>📊</Text>
                    <Text style={styles.noDataTitle}>Chưa có dữ liệu</Text>
                    <Text style={styles.noDataText}>
                      Hoàn thành một số bài luyện tập để xem tiến độ của bạn.
                    </Text>
                    <TouchableOpacity
                      style={styles.startPracticeButton}
                      onPress={() => router.push('/(tabs)/speaking')}
                    >
                      <Text style={styles.startPracticeButtonText}>Bắt đầu luyện tập</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Tips */}
            <View style={styles.section}>
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Mẹo cải thiện điểm số</Text>
                <Text style={styles.tipsText}>
                  • Luyện tập đều đặn mỗi ngày để cải thiện khả năng nói
                </Text>
                <Text style={styles.tipsText}>
                  • Tập trung vào những kỹ năng có điểm thấp nhất
                </Text>
                <Text style={styles.tipsText}>
                  • Ghi âm và nghe lại để tự đánh giá phát âm
                </Text>
                <Text style={styles.tipsText}>
                  • Thực hành với nhiều chủ đề khác nhau
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      </>
      )}
    </View>
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
  
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.primary.main,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary.main,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: Colors.primary.main,
  },

  // Filter
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeFilterTab: {
    backgroundColor: Colors.primary.main,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterTabText: {
    color: '#FFF',
  },

  // Scroll View
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Session Card (for history tab)
  sessionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  typeAndDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  topicCategory: {
    fontSize: 12,
    color: '#666',
  },
  scoreBadge: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 12,
    color: '#666',
  },

  // Session Details
  sessionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  // Feedback
  feedbackSection: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },

  // Actions
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary.main,
  },
  deleteButton: {
    borderColor: Colors.accent.error,
  },
  deleteButtonText: {
    color: Colors.accent.error,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Load More
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#666',
  },
  endContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },

  // Chart Styles (for chart tab)
  section: {
    backgroundColor: '#FFF',
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  // Filters for chart
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#FFF',
  },

  // Metric Selector
  metricContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  metricButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    minWidth: 80,
  },
  activeMetricButton: {
    backgroundColor: '#F8F9FA',
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  metricButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },

  // Statistics
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Chart
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  startPracticeButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startPracticeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Tips
  tipsContainer: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 4,
  },
});