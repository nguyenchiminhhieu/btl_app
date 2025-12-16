import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SpeakingIndexScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={Colors.primary.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubbles" size={40} color="#FFF" />
        </View>
        <Text style={styles.headerTitle}>IELTS Speaking Practice</Text>
        <Text style={styles.headerSubtitle}>
          Master your speaking skills with AI-powered assessment
        </Text>
      </LinearGradient>

      <View style={styles.cardsContainer}>
        {/* Part 1 Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/speaking/part1' as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.primary.main, Colors.primary.dark]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardIconContainer}>
              <Ionicons name="person" size={32} color="#FFF" />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardNumber}>Part 1</Text>
                <View style={styles.cardBadgeContainer}>
                  <Text style={styles.cardBadge}>9 câu hỏi</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>Introduction & Interview</Text>
              <Text style={styles.cardDescription}>
                Trả lời các câu hỏi về bản thân, gia đình, sở thích và cuộc sống hàng ngày
              </Text>
              <View style={styles.cardFooter}>
                <View style={styles.cardInfoItem}>
                  <Ionicons name="time" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.cardInfo}>4-5 phút</Text>
                </View>
                <View style={styles.cardInfoItem}>
                  <Ionicons name="chatbubbles" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.cardInfo}>Câu trả lời ngắn</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Part 2 Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/speaking/part2' as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.secondary.main, Colors.secondary.dark]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardIconContainer}>
              <Ionicons name="document-text" size={32} color="#FFF" />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardNumber}>Part 2</Text>
                <View style={styles.cardBadgeContainer}>
                  <Text style={styles.cardBadge}>35 chủ đề</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>Long Turn (Cue Card)</Text>
              <Text style={styles.cardDescription}>
                Nói về một chủ đề trong 1-2 phút sau khi chuẩn bị 1 phút
              </Text>
              <View style={styles.cardFooter}>
                <View style={styles.cardInfoItem}>
                  <Ionicons name="time" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.cardInfo}>3-4 phút</Text>
                </View>
                <View style={styles.cardInfoItem}>
                  <Ionicons name="create" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.cardInfo}>Có chuẩn bị</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Part 3 Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/speaking/part3' as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.accent.info, '#06B6D4']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardIconContainer}>
              <Ionicons name="people" size={32} color="#FFF" />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardNumber}>Part 3</Text>
                <View style={styles.cardBadgeContainer}>
                  <Text style={styles.cardBadge}>Live Discussion</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>Two-way Discussion</Text>
              <Text style={styles.cardDescription}>
                Thảo luận sâu hơn về chủ đề với các câu hỏi trừu tượng và phản hồi real-time từ AI
              </Text>
              <View style={styles.cardFooter}>
                <View style={styles.cardInfoItem}>
                  <Ionicons name="time" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.cardInfo}>4-5 phút</Text>
                </View>
                <View style={styles.cardInfoItem}>
                  <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.cardInfo}>AI Powered</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Cách thức hoạt động</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>1</Text>
          <Text style={styles.infoText}>
            Chọn Part bạn muốn luyện tập
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>2</Text>
          <Text style={styles.infoText}>
            Trả lời các câu hỏi bằng cách thu âm giọng nói
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>3</Text>
          <Text style={styles.infoText}>
            Nhận feedback chi tiết về phát âm và nội dung từ AI
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>4</Text>
          <Text style={styles.infoText}>
            Cải thiện dựa trên gợi ý và luyện tập lại
          </Text>
        </View>
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
    padding: 32,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.95,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cardsContainer: {
    padding: 20,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardBadgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBadge: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardInfo: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cardArrow: {
    marginLeft: 8,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  badgeDisabled: {
    backgroundColor: '#999',
  },
  infoSection: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 8,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral.text,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  infoNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.main,
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 36,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: Colors.neutral.textLight,
    lineHeight: 22,
  },
});
