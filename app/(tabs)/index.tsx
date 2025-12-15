import { UserProfile } from '@/components/auth/UserProfile';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      icon: 'mic',
      title: 'IELTS Speaking',
      description: 'Luyện thi nói với AI chấm điểm',
      color: Colors.primary.main,
      gradient: Colors.primary.gradient,
      onPress: () => router.push('/(tabs)/speaking'),
    },
    {
      icon: 'book',
      title: 'Từ vựng',
      description: 'Học từ vựng với flashcards',
      color: Colors.secondary.main,
      gradient: Colors.secondary.gradient,
      onPress: () => {},
    },
    {
      icon: 'headset',
      title: 'Nghe hiểu',
      description: 'Luyện nghe với native speakers',
      color: Colors.accent.info,
      gradient: ['#3B82F6', '#06B6D4'] as const,
      onPress: () => {},
    },
    {
      icon: 'document-text',
      title: 'Ngữ pháp',
      description: 'Bài tập ngữ pháp tương tác',
      color: Colors.accent.success,
      gradient: ['#10B981', '#14B8A6'] as const,
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={Colors.primary.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <UserProfile />
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Lingua Talk</Text>
          <Text style={styles.headerSubtitle}>Talk. Be Heard</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="flame" size={24} color="#FFF" />
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>days streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.statValue}>1,240</Text>
              <Text style={styles.statLabel}>points</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Bắt đầu học ngay</Text>
        
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureCard}
              onPress={feature.onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon as any} size={32} color="#FFF" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Daily Goal */}
      <View style={styles.section}>
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>📈 Mục tiêu hôm nay</Text>
            <Text style={styles.goalProgress}>3/5 hoàn thành</Text>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
          
          <View style={styles.goalList}>
            <GoalItem completed icon="checkmark-circle" text="Hoàn thành 3 bài tập" />
            <GoalItem completed icon="checkmark-circle" text="Học 20 từ vựng mới" />
            <GoalItem completed icon="checkmark-circle" text="Luyện speaking 15 phút" />
            <GoalItem icon="ellipse-outline" text="Hoàn thành 2 bài kiểm tra" />
            <GoalItem icon="ellipse-outline" text="Xem 1 video học liệu" />
          </View>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.section}>
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={28} color={Colors.accent.warning} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>💡 Mẹo học tập</Text>
            <Text style={styles.tipText}>
              Học đều đặn 30 phút mỗi ngày hiệu quả hơn học dồn 3 tiếng mỗi tuần!
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function GoalItem({ completed, icon, text }: { completed?: boolean; icon: string; text: string }) {
  return (
    <View style={styles.goalItem}>
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={completed ? Colors.accent.success : Colors.neutral.textMuted} 
      />
      <Text style={[styles.goalText, completed && styles.goalTextCompleted]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.bg,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    marginTop: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.neutral.text,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  featureCard: {
    width: (width - 56) / 2,
    margin: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  featureGradient: {
    padding: 20,
    minHeight: 160,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    color: '#FFF',
    opacity: 0.9,
    lineHeight: 18,
  },
  goalCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral.text,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.main,
    borderRadius: 4,
  },
  goalList: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalText: {
    fontSize: 15,
    color: Colors.neutral.text,
    flex: 1,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.neutral.textMuted,
  },
  tipCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.warning,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.neutral.text,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: Colors.neutral.textLight,
    lineHeight: 20,
  },
});
