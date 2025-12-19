import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

// Design system imports
import {
    Body,
    Caption,
    Card,
    Container,
    Heading3,
    HStack,
    VStack
} from '@/components/design-system';
import { DesignTokens } from '@/constants/design-tokens';

interface SpeakingPartCardProps {
  partNumber: string;
  title: string;
  description: string;
  badge: string;
  icon: string;
  timeInfo: string;
  additionalInfo: string;
  onPress: () => void;
}

// Mini Feature Component
const MiniFeature: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <HStack gap="xs" align="center">
    <Ionicons name={icon as any} size={14} color={DesignTokens.colors.neutral[0]} />
    <Caption color={DesignTokens.colors.neutral[100]} style={{ fontSize: 11 }}>
      {text}
    </Caption>
  </HStack>
);

function SpeakingPartCard({ 
  partNumber, 
  title, 
  description, 
  badge, 
  icon, 
  timeInfo, 
  additionalInfo, 
  onPress 
}: SpeakingPartCardProps) {
  const getPartColor = () => {
    if (partNumber === 'Phần 1') return DesignTokens.colors.primary[500];
    if (partNumber === 'Phần 2') return DesignTokens.colors.accent[500];
    return DesignTokens.colors.success;
  };
  
  const partColor = getPartColor();
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card 
        variant="default" 
        padding="lg"
        style={{
          borderColor: partColor,
          borderWidth: 1.5,
          borderRadius: DesignTokens.radius.lg,
        }}
      >
        <VStack gap="md">
          {/* Enhanced Header */}
          <HStack justify="space-between" align="center">
            <HStack gap="md" align="center">
              <VStack 
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: DesignTokens.radius.full,
                  backgroundColor: `${partColor}15`,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name={icon as any} size={28} color={partColor} />
              </VStack>
              <VStack gap="xs">
                <Heading3 color={partColor} weight="bold">{partNumber}</Heading3>
                <Caption color={partColor} weight="medium">{badge}</Caption>
              </VStack>
            </HStack>
            
            <Ionicons name="chevron-forward-circle" size={32} color={partColor} />
          </HStack>
          
          {/* Content */}
          <VStack gap="xs">
            <Heading3 color={DesignTokens.colors.neutral[800]}>
              {title}
            </Heading3>
            <Body color={DesignTokens.colors.neutral[600]} style={{ lineHeight: 22 }}>
              {description}
            </Body>
          </VStack>
          
          {/* Enhanced Footer */}
          <HStack gap="lg" align="center" style={{ marginTop: DesignTokens.spacing.xs }}>
            <HStack gap="xs" align="center" style={{ flex: 1 }}>
              <Ionicons name="time-outline" size={18} color={DesignTokens.colors.neutral[500]} />
              <Caption color={DesignTokens.colors.neutral[600]} weight="medium">{timeInfo}</Caption>
            </HStack>
            <HStack gap="xs" align="center" style={{ flex: 1 }}>
              <Ionicons name="chatbubbles-outline" size={18} color={DesignTokens.colors.neutral[500]} />
              <Caption color={DesignTokens.colors.neutral[600]} weight="medium">{additionalInfo}</Caption>
            </HStack>
          </HStack>
        </VStack>
      </Card>
    </TouchableOpacity>
  );
}

export default function SpeakingIndexScreen() {
  const router = useRouter();

  return (
    <Container scrollable>
      <VStack gap="lg" style={{ paddingTop: DesignTokens.spacing.xl }}>
        {/* Header Section */}
        <HStack justify="space-between" align="center">
          <VStack gap="xs">
            <Heading3>🎤 Luyện Nói IELTS</Heading3>
            <Caption>Nâng cao kỹ năng Speaking của bạn</Caption>
          </VStack>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/statistics' as any)}
            accessibilityLabel="View Statistics"
          >
            <Ionicons 
              name="stats-chart-outline" 
              size={24} 
              color={DesignTokens.colors.neutral[600]} 
            />
          </TouchableOpacity>
        </HStack>
        
        {/* Feature Highlights Card */}
        <Card variant="gradient" padding="lg">
          <VStack gap="md">
            <HStack gap="md" align="center">
              <VStack 
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: DesignTokens.radius.full,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="mic-circle" size={28} color={DesignTokens.colors.neutral[0]} />
              </VStack>
              <VStack gap="xs" style={{ flex: 1 }}>
                <Heading3 color={DesignTokens.colors.neutral[0]}>3 Phần Thi Hoàn Chỉnh</Heading3>
                <Caption color={DesignTokens.colors.neutral[100]}>Hệ thống phản hồi AI thông minh</Caption>
              </VStack>
            </HStack>
            
            <HStack gap="md" justify="space-around" style={{ marginTop: DesignTokens.spacing.xs }}>
              <MiniFeature icon="checkmark-circle" text="4-5 phút/phần" />
              <MiniFeature icon="analytics" text="AI Feedback" />
              <MiniFeature icon="trending-up" text="Theo dõi tiến độ" />
            </HStack>
          </VStack>
        </Card>

        {/* Speaking Parts Section */}
        <VStack gap="md">
        {/* Part Cards - Education Focused */}
        <SpeakingPartCard
          partNumber="Phần 1"
          title="Giới thiệu & Trò chuyện"
          description="Chia sẻ về bản thân, gia đình và sở thích một cách tự nhiên và thân thiện"
          badge="9 chủ đề quen thuộc"
          icon="person-circle"
          timeInfo="4-5 phút"
          additionalInfo="Câu trả lời ngắn"
          onPress={() => router.push('/(tabs)/speaking/part1' as any)}
        />

        <SpeakingPartCard
          partNumber="Phần 2" 
          title="Trình bày cá nhân"
          description="Kể một câu chuyện hoặc mô tả chi tiết về chủ đề được giao trong 2 phút"
          badge="50+ chủ đề đa dạng"
          icon="document-text-outline"
          timeInfo="3-4 phút" 
          additionalInfo="Có thời gian chuẩn bị"
          onPress={() => router.push('/(tabs)/speaking/part2' as any)}
        />

        <SpeakingPartCard
          partNumber="Phần 3"
          title="Thảo luận chuyên sâu"
          description="Thảo luận những ý tưởng trừu tượng và phức tạp với phản hồi AI thông minh"
          badge="Tương tác thực tế"
          icon="people-circle"
          timeInfo="4-5 phút"
          additionalInfo="AI hỗ trợ"
          onPress={() => router.push('/(tabs)/speaking/part3' as any)}
        />
      </VStack>

        {/* Learning Journey Section */}
        <Card variant="outlined" padding="lg">
          <VStack gap="lg">
            <HStack gap="sm" align="center">
              <Ionicons name="map-outline" size={24} color={DesignTokens.colors.primary[600]} />
              <VStack gap="xs" style={{ flex: 1 }}>
                <Heading3 color={DesignTokens.colors.neutral[800]}>Hành trình học tập</Heading3>
                <Caption color={DesignTokens.colors.neutral[600]}>4 bước đơn giản để nâng cao kỹ năng</Caption>
              </VStack>
            </HStack>
            
            <VStack gap="sm">
              {[
                { 
                  text: 'Chọn phần bạn muốn luyện tập', 
                  icon: 'play-circle',
                  color: DesignTokens.colors.primary[600]
                },
                { 
                  text: 'Thực hành với câu hỏi thực tế', 
                  icon: 'mic',
                  color: DesignTokens.colors.accent[600]
                },
                { 
                  text: 'Nhận phản hồi AI chi tiết', 
                  icon: 'analytics',
                  color: DesignTokens.colors.info
                },
                { 
                  text: 'Theo dõi tiến độ của bạn', 
                  icon: 'trophy',
                  color: DesignTokens.colors.success
                }
              ].map((step, index) => (
                <HStack key={index} gap="md" align="center" style={{
                  paddingVertical: DesignTokens.spacing.sm,
                  paddingHorizontal: DesignTokens.spacing.md,
                  borderRadius: DesignTokens.radius.md,
                  backgroundColor: DesignTokens.colors.neutral[50],
                }}>
                  <VStack
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: DesignTokens.radius.full,
                      backgroundColor: `${step.color}20`,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Caption color={step.color} weight="bold">{index + 1}</Caption>
                  </VStack>
                  <HStack gap="sm" align="center" style={{ flex: 1 }}>
                    <Ionicons name={step.icon as any} size={16} color={step.color} />
                    <Body color={DesignTokens.colors.neutral[700]} style={{ flex: 1 }}>
                      {step.text}
                    </Body>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </Container>
  );
}


