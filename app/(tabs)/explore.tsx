import {
    BodySmall,
    Button,
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
import { Alert, Text, TouchableOpacity } from 'react-native';

export default function AccountScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Học viên';
  const email = user?.email || '';

  const handleSignOut = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const accountSections = [
    {
      title: 'Thông tin tài khoản',
      items: [
        { icon: 'person-outline', label: 'Hồ sơ cá nhân', value: displayName, onPress: () => {} },
        { icon: 'mail-outline', label: 'Email', value: email, onPress: () => {} },
      ],
    },
    {
      title: 'Học tập',
      items: [
        { icon: 'stats-chart-outline', label: 'Thống kê học tập', onPress: () => {} },
        { icon: 'trophy-outline', label: 'Thành tích', onPress: () => {} },
        { icon: 'bookmark-outline', label: 'Từ vựng đã lưu', onPress: () => router.push('/(tabs)/dictionary') },
      ],
    },
    {
      title: 'Ứng dụng',
      items: [
        { icon: 'settings-outline', label: 'Cài đặt', onPress: () => {} },
        { icon: 'help-circle-outline', label: 'Trợ giúp & Hỗ trợ', onPress: () => {} },
        { icon: 'information-circle-outline', label: 'Về ứng dụng', onPress: () => {} },
      ],
    },
  ];

  return (
    <Container scrollable>
      <VStack gap="lg" style={{ paddingTop: DesignTokens.spacing.xl }}>
        {/* Header Section */}
        <HStack justify="space-between" align="center">
          <VStack gap="xs">
            <Heading3>👤 Tài khoản</Heading3>
            <Caption>Quản lý thông tin cá nhân</Caption>
          </VStack>
          <TouchableOpacity 
            onPress={() => {/* Handle notifications */}}
            accessibilityLabel="Notifications"
          >
            <Ionicons 
              name="notifications-outline" 
              size={24} 
              color={DesignTokens.colors.neutral[600]} 
            />
          </TouchableOpacity>
        </HStack>

        {/* Profile Card */}
        <Card variant="gradient" padding="lg">
          <VStack gap="md" align="center">
            <VStack 
              style={{
                width: 80,
                height: 80,
                borderRadius: DesignTokens.radius.full,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="person" size={40} color={DesignTokens.colors.neutral[0]} />
            </VStack>
            
            <VStack gap="xs" align="center">
              <Heading3 color={DesignTokens.colors.neutral[0]}>
                {displayName}
              </Heading3>
              <Caption color={DesignTokens.colors.neutral[100]}>
                {email}
              </Caption>
            </VStack>

            <HStack gap="lg" style={{ marginTop: DesignTokens.spacing.sm }}>
              <VStack align="center" gap="xs">
                <Heading4 color={DesignTokens.colors.neutral[0]}>0</Heading4>
                <Caption color={DesignTokens.colors.neutral[200]} style={{ fontSize: 11 }}>
                  Bài học
                </Caption>
              </VStack>
              <VStack align="center" gap="xs">
                <Heading4 color={DesignTokens.colors.neutral[0]}>0</Heading4>
                <Caption color={DesignTokens.colors.neutral[200]} style={{ fontSize: 11 }}>
                  Từ vựng
                </Caption>
              </VStack>
              <VStack align="center" gap="xs">
                <Heading4 color={DesignTokens.colors.neutral[0]}>0</Heading4>
                <Caption color={DesignTokens.colors.neutral[200]} style={{ fontSize: 11 }}>
                  Thành tích
                </Caption>
              </VStack>
            </HStack>
          </VStack>
        </Card>

        {/* Account Sections */}
        {accountSections.map((section, sectionIndex) => (
          <VStack key={sectionIndex} gap="sm">
            <Caption 
              color={DesignTokens.colors.neutral[500]} 
              weight="semibold"
              style={{ paddingHorizontal: DesignTokens.spacing.xs }}
            >
              {section.title}
            </Caption>
            
            <Card variant="default" padding="sm">
              <VStack gap="xs">
                {section.items.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    <TouchableOpacity
                      onPress={item.onPress}
                      style={{
                        paddingVertical: DesignTokens.spacing.md,
                        paddingHorizontal: DesignTokens.spacing.md,
                      }}
                    >
                      <HStack justify="space-between" align="center">
                        <HStack gap="md" align="center" style={{ flex: 1 }}>
                          <VStack
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: DesignTokens.radius.md,
                              backgroundColor: DesignTokens.colors.primary[50],
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Ionicons 
                              name={item.icon as any} 
                              size={20} 
                              color={DesignTokens.colors.primary[600]} 
                            />
                          </VStack>
                          
                          <VStack gap="xs" style={{ flex: 1 }}>
                            <BodySmall 
                              weight="medium" 
                              color={DesignTokens.colors.neutral[800]}
                            >
                              {item.label}
                            </BodySmall>
                            {'value' in item && item.value && (
                              <Caption color={DesignTokens.colors.neutral[500]}>
                                {item.value}
                              </Caption>
                            )}
                          </VStack>
                        </HStack>
                        
                        <Ionicons 
                          name="chevron-forward" 
                          size={20} 
                          color={DesignTokens.colors.neutral[400]} 
                        />
                      </HStack>
                    </TouchableOpacity>
                    
                    {itemIndex < section.items.length - 1 && (
                      <VStack 
                        style={{
                          height: 1,
                          backgroundColor: DesignTokens.colors.neutral[200],
                          marginHorizontal: DesignTokens.spacing.md,
                        }}
                      >
                        {null}
                      </VStack>
                    )}
                  </React.Fragment>
                ))}
              </VStack>
            </Card>
          </VStack>
        ))}

        {/* Sign Out Button */}
        <Button
          variant="secondary"
          size="lg"
          onPress={handleSignOut}
          leftIcon="log-out-outline"
          style={{
            borderColor: DesignTokens.colors.error,
            borderWidth: 1,
          }}
        >
          <Text style={{ color: DesignTokens.colors.error, fontWeight: '600' }}>
            Đăng xuất
          </Text>
        </Button>

        {/* App Info */}
        <Card variant="outlined" padding="md">
          <VStack gap="xs" align="center">
            <Caption color={DesignTokens.colors.neutral[500]}>
              LinguaTalk - IELTS Speaking Practice
            </Caption>
            <Caption color={DesignTokens.colors.neutral[400]} style={{ fontSize: 11 }}>
              Version 1.0.0
            </Caption>
          </VStack>
        </Card>
      </VStack>
    </Container>
  );
}
