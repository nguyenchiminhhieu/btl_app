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
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;

type TabType = 'overview' | 'history' | 'chart';

export default function StatisticsScreen() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Chart state
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'overall' | 'pronunciation' | 'fluency' | 'grammar' | 'vocabulary'>('overall');
  const [selectedTestType, setSelectedTestType] = useState<1 | 2>(1);
  const [timeRange, setTimeRange] = useState<30 | 90 | 180>(30);
  
  // History state  
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  // Chart functions
  const loadChartData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load sessions for selected test type
      const { sessions: allSessions } = await testHistoryService.getTestSessions(
        selectedTestType,
        100, // Get more data for chart
        0
      );
      
      // Convert to chart data points
      const chartPoints: ChartDataPoint[] = allSessions
        .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
        .map(session => {
          let value = 0;
          switch (selectedMetric) {
            case 'overall':
              value = session.overall_score || 0;
              break;
            case 'pronunciation':
              value = session.pronunciation_score || 0;
              break;
            case 'fluency':
              value = session.fluency_score || 0;
              break;
            case 'grammar':
              value = session.grammar_score || 0;
              break;
            case 'vocabulary':
              value = session.vocabulary_score || 0;
              break;
          }
          
          return {
            date: session.completed_at,
            value,
            label: new Date(session.completed_at).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit'
            })
          };
        })
        .slice(-20); // Take last 20 points for better visualization
      
      setChartData(chartPoints);
    } catch (error) {
      console.error('Failed to load chart data:', error);
      setError('Không thể tải dữ liệu biểu đồ');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTestType, selectedMetric]);

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

      const { sessions: newSessions, total } = await testHistoryService.getTestSessions(
        undefined, // Load all sessions for history
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
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedTestType]);

  useEffect(() => {
    if (activeTab === 'chart') {
      loadChartData();
    } else if (activeTab === 'history') {
      loadTestHistory();
    } else if (activeTab === 'overview') {
      // Load initial data for overview if not loaded yet
      if (sessions.length === 0) {
        loadTestHistory();
      }
    }
  }, [activeTab, loadChartData, loadTestHistory, sessions.length]);

  // Load chart data when filters change
  useEffect(() => {
    if (activeTab === 'chart') {
      loadChartData();
    }
  }, [selectedTestType, selectedMetric, activeTab, loadChartData]);

  // Load initial data on mount
  useEffect(() => {
    // Load data for the default tab (overview) on first mount
    loadTestHistory();
  }, []); // Run only once on mount

  const handleRefresh = () => {
    if (activeTab === 'history') {
      loadTestHistory(0, true);
    } else if (activeTab === 'chart') {
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
      'Bạn có chắc muốn xóa kết quả này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await testHistoryService.deleteTestSession(sessionId);
              loadTestHistory(0, true);
              Alert.alert('Thành công', 'Đã xóa kết quả');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa kết quả');
            }
          },
        },
      ]
    );
  };

  const viewSessionDetail = (session: TestSession) => {
    router.push({
      pathname: '/(tabs)/speaking/part1-results' as any,
      params: {
        sessionDetail: JSON.stringify({
          session,
          showBackButton: true
        })
      }
    });
  };

  const getBandColor = (score: number | null) => {
    if (!score) return '#999';
    if (score >= 8.0) return Colors.accent.success;
    if (score >= 7.0) return Colors.primary.main;
    if (score >= 6.0) return Colors.secondary.main;
    return Colors.accent.error;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTestTypeText = (testType: number) => {
    return testType === 1 ? 'Part 1' : 'Part 2';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Overview statistics
  const overviewStats = React.useMemo(() => {
    if (sessions.length === 0) return null;

    const part1Sessions = sessions.filter(s => s.test_type === 1);
    const part2Sessions = sessions.filter(s => s.test_type === 2);
    
    const totalSessions = sessions.length;
    const avgScore = sessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / totalSessions;
    const highestScore = Math.max(...sessions.map(s => s.overall_score || 0));
    const recentSessions = sessions.slice(0, 5);

    return {
      totalSessions,
      avgScore: avgScore.toFixed(1),
      highestScore: highestScore.toFixed(1),
      part1Count: part1Sessions.length,
      part2Count: part2Sessions.length,
      recentSessions
    };
  }, [sessions]);

  // Render tab buttons
  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <Ionicons 
          name="stats-chart" 
          size={20} 
          color={activeTab === 'overview' ? Colors.primary.main : Colors.neutral.main} 
        />
        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
          Tổng quan
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'chart' && styles.activeTab]}
        onPress={() => setActiveTab('chart')}
      >
        <Ionicons 
          name="trending-up" 
          size={20} 
          color={activeTab === 'chart' ? Colors.primary.main : Colors.neutral.main} 
        />
        <Text style={[styles.tabText, activeTab === 'chart' && styles.activeTabText]}>
          Biểu đồ
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'history' && styles.activeTab]}
        onPress={() => setActiveTab('history')}
      >
        <Ionicons 
          name="time" 
          size={20} 
          color={activeTab === 'history' ? Colors.primary.main : Colors.neutral.main} 
        />
        <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
          Lịch sử
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render overview tab
  const renderOverview = () => {
    // Show loading state when data is being loaded
    if (isLoading && sessions.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Đang tải thống kê...</Text>
        </View>
      );
    }

    if (!overviewStats) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Chưa có dữ liệu thống kê</Text>
          <Text style={styles.emptySubtitle}>
            Hoàn thành một vài bài luyện nói để xem thống kê
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/(tabs)/speaking' as any)}
          >
            <Text style={styles.startButtonText}>Bắt đầu luyện tập</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadTestHistory(0, true)}
            colors={[Colors.primary.main]}
            tintColor={Colors.primary.main}
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={32} color={Colors.accent.success} />
            <Text style={styles.statValue}>{overviewStats.highestScore}</Text>
            <Text style={styles.statLabel}>Điểm cao nhất</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={32} color={Colors.primary.main} />
            <Text style={styles.statValue}>{overviewStats.avgScore}</Text>
            <Text style={styles.statLabel}>Điểm trung bình</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="list" size={32} color={Colors.secondary.main} />
            <Text style={styles.statValue}>{overviewStats.totalSessions}</Text>
            <Text style={styles.statLabel}>Tổng bài kiểm tra</Text>
          </View>
        </View>

        {/* Part breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Phân loại bài kiểm tra</Text>
          <View style={styles.partBreakdown}>
            <View style={styles.partItem}>
              <View style={[styles.partDot, { backgroundColor: Colors.primary.main }]} />
              <Text style={styles.partText}>Part 1: {overviewStats.part1Count} bài</Text>
            </View>
            <View style={styles.partItem}>
              <View style={[styles.partDot, { backgroundColor: Colors.secondary.main }]} />
              <Text style={styles.partText}>Part 2: {overviewStats.part2Count} bài</Text>
            </View>
          </View>
        </View>

        {/* Recent sessions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kết quả gần đây</Text>
            <TouchableOpacity onPress={() => setActiveTab('history')}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {overviewStats.recentSessions.map((session, index) => (
            <TouchableOpacity
              key={session.id}
              style={styles.recentSessionItem}
              onPress={() => viewSessionDetail(session)}
            >
              <View style={styles.sessionLeft}>
                <View style={[styles.typeBadge, { 
                  backgroundColor: session.test_type === 1 ? Colors.primary.main + '20' : Colors.secondary.main + '20' 
                }]}>
                  <Text style={[styles.typeBadgeText, { 
                    color: session.test_type === 1 ? Colors.primary.main : Colors.secondary.main 
                  }]}>
                    {getTestTypeText(session.test_type)}
                  </Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTopic} numberOfLines={1}>
                    {session.topic_title}
                  </Text>
                  <Text style={styles.sessionDate}>
                    {formatDate(session.completed_at)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.sessionRight}>
                <View style={[styles.scoreBadge, { borderColor: getBandColor(session.overall_score) }]}>
                  <Text style={[styles.scoreText, { color: getBandColor(session.overall_score) }]}>
                    {session.overall_score?.toFixed(1) || 'N/A'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Get metric display info with better colors for charts
  const getMetricInfo = () => {
    switch (selectedMetric) {
      case 'overall':
        return { title: 'Điểm Tổng Kết', color: 'rgb(59, 130, 246)', icon: '🎯' }; // Blue
      case 'pronunciation':
        return { title: 'Phát Âm', color: 'rgb(34, 197, 94)', icon: '🗣️' }; // Green
      case 'fluency':
        return { title: 'Lưu Loát', color: 'rgb(168, 85, 247)', icon: '💬' }; // Purple
      case 'grammar':
        return { title: 'Ngữ Pháp', color: 'rgb(239, 68, 68)', icon: '📝' }; // Red
      case 'vocabulary':
        return { title: 'Từ Vựng', color: 'rgb(245, 158, 11)', icon: '📚' }; // Orange
    }
  };

  // Render chart tab
  const renderChart = () => {
    const metricInfo = getMetricInfo();

    return (
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Part Selector */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Chọn Part</Text>
          <View style={styles.partSelector}>
            <TouchableOpacity
              style={[styles.partButton, selectedTestType === 1 && styles.partButtonActive]}
              onPress={() => setSelectedTestType(1)}
            >
              <Text style={[styles.partButtonText, selectedTestType === 1 && styles.partButtonTextActive]}>
                Part 1
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.partButton, selectedTestType === 2 && styles.partButtonActive]}
              onPress={() => setSelectedTestType(2)}
            >
              <Text style={[styles.partButtonText, selectedTestType === 2 && styles.partButtonTextActive]}>
                Part 2
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Metric Selector */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Chọn Chỉ Số</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricScroll}>
            {[
              { key: 'overall', title: 'Tổng Kết', icon: '🎯', color: 'rgb(59, 130, 246)' },
              { key: 'pronunciation', title: 'Phát Âm', icon: '🗣️', color: 'rgb(34, 197, 94)' },
              { key: 'fluency', title: 'Lưu Loát', icon: '💬', color: 'rgb(168, 85, 247)' },
              { key: 'grammar', title: 'Ngữ Pháp', icon: '📝', color: 'rgb(239, 68, 68)' },
              { key: 'vocabulary', title: 'Từ Vựng', icon: '📚', color: 'rgb(245, 158, 11)' }
            ].map((metric) => (
              <TouchableOpacity
                key={metric.key}
                style={[
                  styles.metricButton,
                  selectedMetric === metric.key && { backgroundColor: metric.color + '20', borderColor: metric.color }
                ]}
                onPress={() => setSelectedMetric(metric.key as any)}
              >
                <Text style={styles.metricIcon}>{metric.icon}</Text>
                <Text style={[
                  styles.metricButtonText,
                  selectedMetric === metric.key && { color: metric.color }
                ]}>
                  {metric.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              {metricInfo.icon} {metricInfo.title} - Part {selectedTestType}
            </Text>
            <Text style={styles.chartSubtitle}>
              Tiến độ theo thời gian (20 kết quả gần nhất)
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.chartLoadingContainer}>
              <ActivityIndicator size="large" color={metricInfo.color} />
              <Text style={styles.loadingText}>Đang tải biểu đồ...</Text>
            </View>
          ) : error ? (
            <View style={styles.chartErrorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text style={styles.errorTitle}>Lỗi tải dữ liệu</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadChartData}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : chartData.length === 0 ? (
            <View style={styles.chartEmptyContainer}>
              <Ionicons name="analytics-outline" size={64} color="#ccc" />
              <Text style={styles.emptyChartTitle}>Chưa có dữ liệu</Text>
              <Text style={styles.emptyChartMessage}>
                Hoàn thành một vài bài Part {selectedTestType} để xem biểu đồ tiến độ
              </Text>
              <TouchableOpacity
                style={styles.startTestButton}
                onPress={() => router.push('/(tabs)/speaking' as any)}
              >
                <Text style={styles.startTestButtonText}>Bắt đầu luyện tập</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: chartData.map(d => d.label),
                  datasets: [{
                    data: chartData.map(d => d.value),
                    color: (opacity = 1) => metricInfo.color,
                    strokeWidth: 3,
                  }]
                }}
                width={chartWidth}
                height={280}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#fafafa',
                  decimalPlaces: 1,
                  color: (opacity = 1) => metricInfo.color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`),
                  labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                  style: {
                    borderRadius: 16,
                    paddingRight: 0,
                  },
                  propsForDots: {
                    r: '5',
                    strokeWidth: '3',
                    stroke: metricInfo.color,
                    fill: '#ffffff',
                    strokeOpacity: 1,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '2,4',
                    stroke: '#e5e7eb',
                    strokeWidth: 1,
                    strokeOpacity: 0.6,
                  },
                  propsForLabels: {
                    fontSize: 12,
                    fontFamily: 'System',
                    fontWeight: '500',
                  },
                  fillShadowGradient: metricInfo.color,
                  fillShadowGradientFrom: metricInfo.color,
                  fillShadowGradientTo: metricInfo.color,
                  fillShadowGradientOpacity: 0.08,
                  useShadowColorFromDataset: false,
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  elevation: 2,
                  shadowColor: metricInfo.color,
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                }}
                withDots={true}
                withShadow={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero={false}
              />
            </View>
          )}
        </View>

        {/* Stats Card */}
        {!isLoading && !error && chartData.length > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.chartStatsTitle}>Thống kê tổng quan</Text>
            <View style={styles.chartStatsGrid}>
              <View style={styles.chartStatsRow}>
                <View style={styles.chartStatItem}>
                  <Text style={styles.chartStatLabel}>Cao nhất</Text>
                  <Text style={[styles.chartStatValue, { color: metricInfo.color }]}>
                    {Math.max(...chartData.map(d => d.value)).toFixed(1)}
                  </Text>
                </View>
                
                <View style={styles.chartStatItem}>
                  <Text style={styles.chartStatLabel}>Thấp nhất</Text>
                  <Text style={[styles.chartStatValue, { color: metricInfo.color }]}>
                    {Math.min(...chartData.map(d => d.value)).toFixed(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.chartStatsRow}>
                <View style={styles.chartStatItem}>
                  <Text style={styles.chartStatLabel}>Trung bình</Text>
                  <Text style={[styles.chartStatValue, { color: metricInfo.color }]}>
                    {(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(1)}
                  </Text>
                </View>
                
                <View style={styles.chartStatItem}>
                  <Text style={styles.chartStatLabel}>Tổng bài</Text>
                  <Text style={[styles.chartStatValue, { color: metricInfo.color }]}>
                    {chartData.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  // Render history tab (simplified version)
  const renderHistory = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      );
    }

    if (sessions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
          <Text style={styles.emptySubtitle}>
            Hoàn thành một vài bài luyện nói để xem lịch sử
          </Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 20) {
            handleLoadMore();
          }
        }}
      >
        {sessions.map((session, index) => (
          <TouchableOpacity
            key={session.id}
            style={styles.historyItem}
            onPress={() => viewSessionDetail(session)}
          >
            <View style={styles.historyLeft}>
              <View style={[styles.typeBadge, { 
                backgroundColor: session.test_type === 1 ? Colors.primary.main + '20' : Colors.secondary.main + '20' 
              }]}>
                <Text style={[styles.typeBadgeText, { 
                  color: session.test_type === 1 ? Colors.primary.main : Colors.secondary.main 
                }]}>
                  {getTestTypeText(session.test_type)}
                </Text>
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTopic} numberOfLines={2}>
                  {session.topic_title}
                </Text>
                <Text style={styles.historyDate}>
                  {formatDate(session.completed_at)}
                </Text>
                <Text style={styles.historyStats}>
                  ⏱️ {formatDuration(session.duration_seconds)} • 
                  ❓ {session.questions_count} câu
                </Text>
              </View>
            </View>
            
            <View style={styles.historyRight}>
              <View style={[styles.scoreBadge, { borderColor: getBandColor(session.overall_score) }]}>
                <Text style={[styles.scoreText, { color: getBandColor(session.overall_score) }]}>
                  {session.overall_score?.toFixed(1) || 'N/A'}
                </Text>
                <Text style={styles.scoreMax}>/9.0</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteSession(session.id)}
              >
                <Ionicons name="trash" size={16} color={Colors.accent.error} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {isLoading && sessions.length > 0 && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color={Colors.primary.main} />
            <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderTabButtons()}
      
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'chart' && renderChart()}
      {activeTab === 'history' && renderHistory()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 44, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.primary.main + '10',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.main,
  },
  activeTabText: {
    color: Colors.primary.main,
    fontWeight: '600',
  },

  // Content styles
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space to avoid tab bar overlap
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },

  // Section card
  sectionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
  },

  // Part breakdown
  partBreakdown: {
    gap: 12,
  },
  partItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  partText: {
    fontSize: 16,
    color: '#374151',
  },

  // Session items
  recentSessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTopic: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  sessionDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scoreMax: {
    fontSize: 10,
    color: '#9ca3af',
  },

  // History items
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTopic: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  historyDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  historyStats: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },

  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Coming soon
  comingSoonText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    padding: 40,
  },
  
  // Filter styles
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  partSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 4,
  },
  partButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  partButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  partButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  partButtonTextActive: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  metricScroll: {
    flex: 1,
  },
  metricButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    minWidth: 90,
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  metricButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  
  // Chart styles
  chartSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  chartLoadingContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartErrorContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginVertical: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  chartEmptyContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyChartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 12,
  },
  emptyChartMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  startTestButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  startTestButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },

  chartStatsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartStatsGrid: {
    gap: 12,
  },
  chartStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chartStatItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartStatLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
    fontWeight: '600',
    textAlign: 'center',
  },
  chartStatValue: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
});