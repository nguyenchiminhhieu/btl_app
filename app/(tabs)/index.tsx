import {
    BodySmall,
    Caption,
    Card,
    Container,
    DesignTokens,
    Heading3,
    Heading4,
    HStack,
    VStack
} from '@/components/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Get display name from user data
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Học viên';
  
  // Mock streak/progress data - later integrate with actual progress tracking


  // Inspirational quotes for language learning
  const motivationalQuotes = [
    {
      text: "Ngôn ngữ không phải là vấn đề của người thông minh hay ngu dốt, mà là vấn đề của người có cố gắng hay không.",
      author: "Haruki Murakami",
      icon: "📚"
    },
    {
      text: "The limits of my language mean the limits of my world.", 
      author: "Ludwig Wittgenstein",
      icon: "🌍"
    },
    {
      text: "Learning another language is not only learning different words, but also learning another way to think.",
      author: "Flora Lewis", 
      icon: "🧠"
    },
    {
      text: "Mỗi ngôn ngữ bạn học được là một con người mới trong bạn được sinh ra.",
      author: "Czech Proverb",
      icon: "✨"
    }
  ];
  
  // Rotate quotes based on day of month to keep it fresh
  const currentQuote = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

  // Mock goals data
  const dailyGoals = [
    { id: 1, text: 'Hoàn thành 3 bài tập', completed: true },
    { id: 2, text: 'Học 20 từ vựng mới', completed: true },
    { id: 3, text: 'Luyện nói 15 phút', completed: true },
    { id: 4, text: 'Hoàn thành 2 bài kiểm tra', completed: false },
    { id: 5, text: 'Xem 1 video học tập', completed: false },
  ];

  const completedGoals = dailyGoals.filter(goal => goal.completed).length;

  return (
    <Container scrollable>
      <VStack gap="lg" style={{ paddingTop: DesignTokens.spacing.xl }}>
        {/* Header Section */}
        <HStack justify="space-between" align="center">
          <VStack gap="xs">
            <Heading3>Xin chào, {displayName}!</Heading3>
            <Caption>Sẵn sàng luyện tập hôm nay?</Caption>
          </VStack>
          <TouchableOpacity 
            onPress={() => {/* Handle settings */}}
            accessibilityLabel="Settings"
          >
            <Ionicons 
              name="settings-outline" 
              size={24} 
              color={DesignTokens.colors.neutral[600]} 
            />
          </TouchableOpacity>
        </HStack>

        {/* Motivational Quote Card */}
        <Card 
          variant="gradient" 
          padding="xl"
          style={{
            borderRadius: DesignTokens.radius.lg,
            shadowColor: DesignTokens.colors.primary[600],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <VStack gap="lg" align="center">
            <Text style={{ fontSize: 32 }}>{currentQuote.icon}</Text>
            
            <VStack gap="md" align="center">
              <Heading4 
                color={DesignTokens.colors.neutral[0]}
                style={{ 
                  textAlign: 'center',
                  lineHeight: 28,
                  fontStyle: 'italic'
                }}
              >
                "{currentQuote.text}"
              </Heading4>
              
              <Caption 
                color={DesignTokens.colors.neutral[100]}
                style={{ fontWeight: '600' }}
              >
                — {currentQuote.author}
              </Caption>
            </VStack>
            
  
          </VStack>
        </Card>

        {/* Practice Speaking Section */}
        <Card variant="outlined" padding="lg">
          <VStack gap="lg">
            <HStack justify="space-between" align="center">
              <Heading3>🎯 Luyện Speaking</Heading3>
              <Caption color={DesignTokens.colors.primary[600]}>Chọn phần thi</Caption>
            </HStack>
            
            <VStack gap="md">
              <SpeakingPartButton
                title="Part 1 - Giới thiệu"
                description="Câu hỏi về bản thân và chủ đề quen thuộc"
                icon="person-outline"
                color={DesignTokens.colors.primary[500]}
                duration="4-5 phút"
                onPress={() => router.push('/(tabs)/speaking')}
              />
              
              <SpeakingPartButton
                title="Part 2 - Cue Card"
                description="Thuyết trình 2 phút về chủ đề được cho"
                icon="document-text-outline"
                color={DesignTokens.colors.accent[500]}
                duration="3-4 phút"
                onPress={() => router.push('/(tabs)/speaking/part2')}
              />
              
              <SpeakingPartButton
                title="Part 3 - Thảo luận"
                description="Thảo luận sâu về chủ đề trong Part 2"
                icon="chatbubbles-outline"
                color={DesignTokens.colors.success}
                duration="4-5 phút"
                onPress={() => router.push('/(tabs)/speaking/part3')}
              />
            </VStack>
          </VStack>
        </Card>

        {/* Daily Goals */}
        <Card 
          variant="default" 
          padding="lg"
          style={{
            borderRadius: DesignTokens.radius.lg,
            backgroundColor: DesignTokens.colors.neutral[50],
            borderColor: DesignTokens.colors.primary[200],
          }}
        >
          <VStack gap="lg">
            <HStack justify="space-between" align="center">
              <HStack gap="sm" align="center">
                <Text style={{ fontSize: 28 }}>🎯</Text>
                <Heading3 color={DesignTokens.colors.neutral[800]}>Mục tiêu hôm nay</Heading3>
              </HStack>
              <VStack align="flex-end" gap="xs">
                <Caption 
                  color={DesignTokens.colors.primary[600]}
                  style={{ fontWeight: '600' }}
                >
                  {completedGoals}/{dailyGoals.length} hoàn thành
                </Caption>
                <Caption color={DesignTokens.colors.neutral[500]}>
                  {Math.round((completedGoals / dailyGoals.length) * 100)}%
                </Caption>
              </VStack>
            </HStack>
            
            <ProgressBar 
              progress={(completedGoals / dailyGoals.length) * 100} 
            />
            
            <VStack gap="sm">
              {dailyGoals.map((goal) => (
                <EnhancedGoalItem 
                  key={goal.id}
                  completed={goal.completed}
                  text={goal.text}
                />
              ))}
            </VStack>
            
            {completedGoals === dailyGoals.length && (
              <Card 
                variant="success" 
                padding="md"
                style={{ marginTop: DesignTokens.spacing.sm }}
              >
                <HStack gap="sm" align="center">
                  <Text style={{ fontSize: 24 }}>🎉</Text>
                  <VStack gap="xs" style={{ flex: 1 }}>
                    <BodySmall 
                      weight="semibold"
                      color={DesignTokens.colors.success}
                    >
                      Xuất sắc! Bạn đã hoàn thành tất cả mục tiêu!
                    </BodySmall>
                    <Caption color={DesignTokens.colors.neutral[600]}>
                      Tiếp tục phát huy nhé! 💪
                    </Caption>
                  </VStack>
                </HStack>
              </Card>
            )}
          </VStack>
        </Card>

        {/* Dictionary Access */}
        <Card 
          variant="outlined" 
          padding="md"
          pressable 
          onPress={() => router.push('/(tabs)/dictionary')}
        >
          <HStack justify="space-between" align="center">
            <HStack gap="sm" align="center">
              <Ionicons 
                name="book-outline" 
                size={24} 
                color={DesignTokens.colors.primary[600]} 
              />
              <VStack gap="xs">
                <BodySmall weight="semibold">Từ vựng đã lưu</BodySmall>
                <Caption>Xây dựng vốn từ vựng của bạn</Caption>
              </VStack>
            </HStack>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={DesignTokens.colors.neutral[400]}
            />
          </HStack>
        </Card>

        {/* Learning Tip */}
        <Card variant="outlined" padding="md">
          <HStack gap="md" align="flex-start">
            <VStack align="center" gap="xs">
              <Text style={{ fontSize: 24 }}>💡</Text>
            </VStack>
            <VStack gap="xs" style={{ flex: 1 }}>
              <BodySmall weight="semibold">Mẹo học tập hàng ngày</BodySmall>
              <Caption>
                Luyện nói chỉ 15 phút mỗi ngày. Kiên trì quan trọng hơn cường độ!
              </Caption>
            </VStack>
          </HStack>
        </Card>
      </VStack>
    </Container>
  );
}

// Helper Components
const MiniStatItem: React.FC<{ icon: string; value: number | string; label: string }> = ({
  icon,
  value,
  label,
}) => (
  <VStack align="center" gap="xs">
    <Text style={{ fontSize: 18 }}>{icon}</Text>
    <Heading4 color={DesignTokens.colors.neutral[0]} style={{ fontSize: 20 }}>
      {value}
    </Heading4>
    <Caption color={DesignTokens.colors.neutral[200]} style={{ fontSize: 11 }}>
      {label}
    </Caption>
  </VStack>
);

const SpeakingPartButton: React.FC<{
  title: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  onPress: () => void;
}> = ({ title, description, icon, color, duration, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Card 
      variant="outlined"
      padding="md"
      style={{
        borderColor: color,
        borderWidth: 1.5,
        borderRadius: DesignTokens.radius.md,
      }}
    >
      <HStack justify="space-between" align="center">
        <HStack gap="md" align="center" style={{ flex: 1 }}>
          <VStack 
            style={{
              width: 48,
              height: 48,
              borderRadius: DesignTokens.radius.full,
              backgroundColor: `${color}15`,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name={icon as any} size={24} color={color} />
          </VStack>
          
          <VStack gap="xs" style={{ flex: 1 }}>
            <BodySmall 
              weight="semibold"
              color={DesignTokens.colors.neutral[800]}
            >
              {title}
            </BodySmall>
            <Caption 
              color={DesignTokens.colors.neutral[500]}
              style={{ lineHeight: 16 }}
            >
              {description}
            </Caption>
          </VStack>
        </HStack>
        
        <VStack align="flex-end" gap="xs">
          <Caption 
            color={color}
            style={{ fontWeight: '600' }}
          >
            {duration}
          </Caption>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={DesignTokens.colors.neutral[400]} 
          />
        </VStack>
      </HStack>
    </Card>
  </TouchableOpacity>
);

const EnhancedGoalItem: React.FC<{ completed: boolean; text: string }> = ({
  completed,
  text,
}) => (
  <TouchableOpacity disabled>
    <HStack 
      gap="md" 
      align="center"
      style={{
        paddingVertical: DesignTokens.spacing.sm,
        paddingHorizontal: DesignTokens.spacing.md,
        borderRadius: DesignTokens.radius.md,
        backgroundColor: completed 
          ? `${DesignTokens.colors.success}10` 
          : DesignTokens.colors.neutral[0],
        borderWidth: 1,
        borderColor: completed 
          ? DesignTokens.colors.success 
          : DesignTokens.colors.neutral[200],
      }}
    >
      <VStack
        style={{
          width: 24,
          height: 24,
          borderRadius: DesignTokens.radius.full,
          backgroundColor: completed 
            ? DesignTokens.colors.success 
            : DesignTokens.colors.neutral[200],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {completed && (
          <Ionicons
            name="checkmark"
            size={14}
            color={DesignTokens.colors.neutral[0]}
          />
        )}
      </VStack>
      
      <BodySmall
        style={{
          flex: 1,
          textDecorationLine: completed ? 'line-through' : 'none',
          color: completed 
            ? DesignTokens.colors.neutral[500] 
            : DesignTokens.colors.neutral[800],
          fontWeight: completed ? '400' : '500',
        }}
      >
        {text}
      </BodySmall>
      
      {completed && (
        <Text style={{ fontSize: 16 }}>✅</Text>
      )}
    </HStack>
  </TouchableOpacity>
);

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <VStack gap="xs">
    <VStack 
      style={{
        height: 12,
        backgroundColor: DesignTokens.colors.neutral[200],
        borderRadius: DesignTokens.radius.full,
        overflow: 'hidden',
        shadowColor: DesignTokens.colors.neutral[400],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <VStack
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, progress))}%`,
          backgroundColor: progress === 100 
            ? DesignTokens.colors.success 
            : DesignTokens.colors.primary[600],
          borderRadius: DesignTokens.radius.full,
          shadowColor: progress === 100 
            ? DesignTokens.colors.success 
            : DesignTokens.colors.primary[600],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <></>
      </VStack>
    </VStack>
  </VStack>
);

// No styles needed - using design system components
