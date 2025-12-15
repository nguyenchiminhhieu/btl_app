import { Colors } from '@/constants/theme';
import { getTopicsByCategory, type Part2Topic } from '@/services';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function Part2TopicsScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [topics, setTopics] = useState<Part2Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (category) {
      loadTopics();
    }
  }, [category]);

  const loadTopics = async () => {
    try {
      setIsLoading(true);
      const data = await getTopicsByCategory(category);
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
      Alert.alert('Error', 'Failed to load topics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicPress = (topic: Part2Topic) => {
    router.push({
      pathname: '/(tabs)/speaking/part2-cue-card',
      params: { topicId: topic.id }
    });
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colorMap: Record<string, string> = {
      beginner: '#10B981',
      intermediate: '#F59E0B',
      advanced: '#EF4444',
    };
    return colorMap[difficulty] || '#6B7280';
  };

  const getDifficultyIcon = (difficulty: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      beginner: 'leaf',
      intermediate: 'flash',
      advanced: 'rocket',
    };
    return iconMap[difficulty] || 'help';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading topics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary.main, Colors.primary.light]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {category?.charAt(0).toUpperCase() + category?.slice(1)} Topics
        </Text>
        <Text style={styles.headerSubtitle}>
          Choose a topic to get your cue card
        </Text>
      </LinearGradient>

      {/* Topics List */}
      <View style={styles.topicsContainer}>
        <Text style={styles.topicsTitle}>
          {topics.length} Available Topics
        </Text>
        
        {topics.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No topics found</Text>
            <Text style={styles.emptySubtext}>
              Please try another category or check back later
            </Text>
          </View>
        ) : (
          <View style={styles.topicsList}>
            {topics.map((topic, index) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicCard}
                onPress={() => handleTopicPress(topic)}
              >
                <View style={styles.topicHeader}>
                  <View style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(topic.difficulty_level) }
                  ]}>
                    <Ionicons
                      name={getDifficultyIcon(topic.difficulty_level)}
                      size={12}
                      color="#FFF"
                    />
                    <Text style={styles.difficultyText}>
                      {topic.difficulty_level.toUpperCase()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
                
                <Text style={styles.topicTitle}>{topic.title}</Text>
                
                {topic.description && (
                  <Text style={styles.topicDescription} numberOfLines={2}>
                    {topic.description}
                  </Text>
                )}

                <View style={styles.topicFooter}>
                  <Text style={styles.footerText}>Tap to get cue card</Text>
                  <View style={styles.topicNumber}>
                    <Text style={styles.topicNumberText}>{index + 1}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Random Topic Button */}
      <View style={styles.randomContainer}>
        <TouchableOpacity
          style={styles.randomButton}
          onPress={() => {
            if (topics.length > 0) {
              const randomTopic = topics[Math.floor(Math.random() * topics.length)];
              handleTopicPress(randomTopic);
            }
          }}
        >
          <LinearGradient
            colors={Colors.secondary.gradient}
            style={styles.randomButtonGradient}
          >
            <Ionicons name="shuffle" size={24} color="#FFF" />
            <Text style={styles.randomButtonText}>Random Topic</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Choosing Tips</Text>
        <View style={styles.tip}>
          <Ionicons name="bulb" size={16} color="#F59E0B" />
          <Text style={styles.tipText}>
            Beginners: Start with <Text style={styles.tipHighlight}>green</Text> topics
          </Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="bulb" size={16} color="#F59E0B" />
          <Text style={styles.tipText}>
            Challenge yourself with harder topics as you improve
          </Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="bulb" size={16} color="#F59E0B" />
          <Text style={styles.tipText}>
            Use "Random Topic" for surprise practice
          </Text>
        </View>
      </View>
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
  topicsContainer: {
    margin: 20,
  },
  topicsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  topicsList: {
    gap: 12,
  },
  topicCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 8,
    lineHeight: 22,
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  topicFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  topicNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  randomContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  randomButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  randomButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  randomButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tipsContainer: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  tipHighlight: {
    fontWeight: 'bold',
    color: '#10B981',
  },
});