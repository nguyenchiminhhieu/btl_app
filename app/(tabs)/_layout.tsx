import { Tabs } from 'expo-router';
import React from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="speaking"
          options={{
            title: 'Speaking',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="mic.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="dictionary"
          options={{
            title: 'Dictionary',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="book" color={color} />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
