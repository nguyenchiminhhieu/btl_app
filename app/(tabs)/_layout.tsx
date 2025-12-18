import { Tabs } from 'expo-router';
import React from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DesignTokens } from '@/constants/design-tokens';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: DesignTokens.colors.primary[600],
          tabBarInactiveTintColor: DesignTokens.colors.neutral[400],
          headerShown: false,
          tabBarStyle: {
            backgroundColor: DesignTokens.colors.neutral[0],
            borderTopColor: DesignTokens.colors.neutral[200],
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="speaking"
          options={{
            title: 'Luyện nói',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="mic.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="dictionary"
          options={{
            title: 'Từ điển',
            tabBarIcon: ({ color }) => <Ionicons size={24} name="book" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Tài khoản',
            tabBarIcon: ({ color }) => <Ionicons size={24} name="person" color={color} />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
