import { ScrollView, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserProfile } from '@/src/components/auth/UserProfile';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <UserProfile />
      
      <ThemedView style={styles.welcomeContainer}>
        <ThemedText type="title">Chào mừng đến với English Learning App!</ThemedText>
        <HelloWave />
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Bắt đầu học ngay!</ThemedText>
        <ThemedText>
          Ứng dụng học tiếng Anh với nhiều tính năng thú vị đang chờ bạn khám phá.
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Các tính năng chính</ThemedText>
        <ThemedText>
          • Học từ vựng với flashcards{'\n'}
          • Bài tập ngữ pháp tương tác{'\n'}
          • Luyện nghe với audio{'\n'}
          • Theo dõi tiến độ học tập
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  welcomeContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
