import { DesignTokens } from '@/constants/design-tokens';
import { Stack } from 'expo-router';
import React from 'react';

export default function SpeakingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: DesignTokens.colors.primary[600],
        },
        headerTintColor: DesignTokens.colors.neutral[0],
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Luyện Nói IELTS',
        }}
      />
      <Stack.Screen
        name="part1"
        options={{
          title: 'Phần 1 - Giới thiệu',
        }}
      />
      <Stack.Screen
        name="part1-results"
        options={{
          title: 'Kết quả Phần 1',
        }}
      />
      <Stack.Screen
        name="part2"
        options={{
          title: 'Phần 2 - Cue Card',
        }}
      />
      <Stack.Screen
        name="part2-topics"
        options={{
          title: 'Phần 2 - Chọn chủ đề',
        }}
      />
      <Stack.Screen
        name="part2-cue-card"
        options={{
          title: 'Phần 2 - Chuẩn bị',
        }}
      />
      <Stack.Screen
        name="part2-recording"
        options={{
          title: 'Phần 2 - Ghi âm',
        }}
      />
      <Stack.Screen
        name="part2-results"
        options={{
          title: 'Kết quả Phần 2',
        }}
      />
      <Stack.Screen
        name="part3"
        options={{
          title: 'Phần 3 - Thảo luận',
        }}
      />
      <Stack.Screen
        name="statistics"
        options={{
          title: 'Thống kê',
        }}
      />
    </Stack>
  );
}
