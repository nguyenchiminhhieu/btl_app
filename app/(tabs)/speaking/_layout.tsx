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
      <Stack.Screen
        name="part2"
        options={{
          title: 'Part 2 - Cue Card',
        }}
      />
      <Stack.Screen
        name="part2-topics"
        options={{
          title: 'Part 2 - Chọn chủ đề',
        }}
      />
      <Stack.Screen
        name="part2-cue-card"
        options={{
          title: 'Part 2 - Chuẩn bị',
        }}
      />
      <Stack.Screen
        name="part2-recording"
        options={{
          title: 'Part 2 - Ghi âm',
        }}
      />
      <Stack.Screen
        name="part2-results"
        options={{
          title: 'Kết quả Part 2',
        }}
      />
      <Stack.Screen
        name="part3"
        options={{
          title: 'Part 3 - Discussion',
        }}
      />
    </Stack>
  );
}
