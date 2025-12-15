import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function ExploreScreen() {
  const learningResources = [
    {
      icon: 'book-outline',
      title: 'IELTS Speaking Topics',
      description: 'Khám phá 100+ chủ đề phổ biến trong IELTS Speaking',
      color: Colors.primary.main,
    },
    {
      icon: 'bulb-outline',
      title: 'Tips & Tricks',
      description: 'Mẹo học tiếng Anh hiệu quả từ các chuyên gia',
      color: Colors.secondary.main,
    },
    {
      icon: 'trending-up-outline',
      title: 'Progress Tracking',
      description: 'Theo dõi tiến độ học tập và cải thiện kỹ năng',
      color: Colors.accent.info,
    },
    {
      icon: 'star-outline',
      title: 'Achievements',
      description: 'Mở khóa thành tích và nhận phần thưởng',
      color: Colors.accent.success,
    },
  ];

  const statistics = [
    { label: 'Users', value: '10,000+', icon: 'people' },
    { label: 'Sessions', value: '50,000+', icon: 'mic' },
    { label: 'Avg Score', value: '7.5', icon: 'trophy' },
    { label: 'Topics', value: '100+', icon: 'library' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={Colors.primary.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Ionicons name="compass" size={48} color="#FFF" />
        <Text style={styles.headerTitle}>Khám phá</Text>
        <Text style={styles.headerSubtitle}>Tài nguyên học IELTS Speaking</Text>
      </LinearGradient>

      {/* Statistics Grid */}
      <View style={styles.statsContainer}>
        {statistics.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Ionicons name={stat.icon as any} size={28} color={Colors.primary.main} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Resources Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài nguyên học tập</Text>
        
        {learningResources.map((resource, index) => (
          <View key={index} style={styles.resourceCard}>
            <View style={[styles.resourceIcon, { backgroundColor: `${resource.color}15` }]}>
              <Ionicons name={resource.icon as any} size={28} color={resource.color} />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourceDescription}>{resource.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral.textMuted} />
          </View>
        ))}
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Về Lingua Talk</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            Lingua Talk là ứng dụng luyện thi IELTS Speaking với công nghệ AI tiên tiến, 
            giúp bạn cải thiện kỹ năng nói tiếng Anh một cách hiệu quả và tự tin.
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent.success} />
              <Text style={styles.featureText}>Chấm điểm tự động bằng AI</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent.success} />
              <Text style={styles.featureText}>Phản hồi chi tiết từng câu trả lời</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent.success} />
              <Text style={styles.featureText}>100+ chủ đề IELTS thực tế</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent.success} />
              <Text style={styles.featureText}>Luyện tập mọi lúc, mọi nơi</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
        <Text style={styles.footerText}>Made with ❤️ for IELTS learners</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.bg,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    marginTop: -20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
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
    color: Colors.primary.main,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral.textLight,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.neutral.text,
    marginBottom: 16,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceContent: {
    flex: 1,
    marginLeft: 16,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.neutral.text,
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: Colors.neutral.textLight,
    lineHeight: 20,
  },
  aboutCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutText: {
    fontSize: 15,
    color: Colors.neutral.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: Colors.neutral.text,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: Colors.neutral.textMuted,
    marginVertical: 4,
  },
});
