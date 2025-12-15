import { Stack } from 'expo-router';
import React from 'react';

export default function SpeakingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1E88E5',
        },
        headerTintColor: '#FFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'IELTS Speaking',
        }}
      />
      <Stack.Screen
        name="part1"
        options={{
          title: 'Part 1 - Interview',
        }}
      />
      <Stack.Screen
        name="part1-results"
        options={{
          title: 'Kết quả Part 1',
        }}
      />
    </Stack>
  );
}
