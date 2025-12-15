import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AudioRecorderProps {
  onRecordingComplete: (audioUri: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  disabled?: boolean;
  maxDuration?: number;
}

export function AudioRecorder({ onRecordingComplete, onRecordingStateChange, disabled, maxDuration }: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        console.log('Cleaning up recording on unmount');
        recording.stopAndUnloadAsync().catch((error) => {
          // Ignore "already unloaded" errors
          if (!error.message?.includes('already been unloaded')) {
            console.error('Cleanup error:', error);
          }
        });
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      // Stop and cleanup any existing recording first
      if (recording) {
        console.log('Cleaning up existing recording...');
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
      }

      console.log('Requesting permissions...');
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to record audio');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording...');
      const { recording: newRecording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
        },
      });
      
      setRecording(newRecording);
      setIsRecording(true);
      onRecordingStateChange?.(true);
      console.log('Recording started');

      // Auto-stop after maxDuration if specified
      if (maxDuration) {
        setTimeout(() => {
          if (newRecording && isRecording) {
            stopRecording(newRecording);
          }
        }, maxDuration);
      }
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async (recordingToStop?: Audio.Recording) => {
    try {
      const currentRecording = recordingToStop || recording;
      if (!currentRecording) {
        console.log('No active recording to stop');
        return;
      }

      console.log('Stopping recording...');
      setIsRecording(false);
      onRecordingStateChange?.(false);
      await currentRecording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = currentRecording.getURI();
      console.log('Recording stopped and stored at:', uri);
      
      setRecording(null);
      
      if (uri) {
        onRecordingComplete(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      Alert.alert('Error', 'Failed to stop recording');
      setIsRecording(false);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.button,
          isRecording && styles.buttonRecording,
          disabled && styles.buttonDisabled
        ]}
        disabled={disabled}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>
          {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
        </Text>
      </TouchableOpacity>
      {isRecording && (
        <Text style={styles.recordingText}>Recording in progress...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#202254',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  buttonRecording: {
    backgroundColor: '#EF4444',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recordingText: {
    marginTop: 12,
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
