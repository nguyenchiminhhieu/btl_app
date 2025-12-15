import { AssessmentResult } from '@/services';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface QuestionResultProps {
  result: AssessmentResult;
  questionText: string;
  questionNumber: number;
}

export function QuestionResult({ result, questionText, questionNumber }: QuestionResultProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.questionNumber}>Question {questionNumber}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score:</Text>
          <Text style={styles.scoreValue}>{result.content.bandScore}/9</Text>
        </View>
      </View>
      
      <Text style={styles.questionText}>{questionText}</Text>
      
      <View style={styles.scoresGrid}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreItemLabel}>Fluency</Text>
          <Text style={styles.scoreItemValue}>{result.content.fluencyCoherence}/9</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreItemLabel}>Lexical</Text>
          <Text style={styles.scoreItemValue}>{result.content.lexicalResource}/9</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreItemLabel}>Grammar</Text>
          <Text style={styles.scoreItemValue}>{result.content.grammaticalRange}/9</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreItemLabel}>Pronunciation</Text>
          <Text style={styles.scoreItemValue}>{result.pronunciation.overall}/100</Text>
        </View>
      </View>
      
      {/* Detailed Pronunciation Breakdown */}
      <View style={styles.pronunciationDetails}>
        <Text style={styles.pronunciationTitle}>Đánh giá phát âm</Text>
        <View style={styles.pronunciationGrid}>
          <View style={styles.pronunciationItem}>
            <Text style={styles.pronunciationLabel}>Accuracy</Text>
            <Text style={styles.pronunciationValue}>{result.pronunciation.accuracy}/100</Text>
          </View>
          <View style={styles.pronunciationItem}>
            <Text style={styles.pronunciationLabel}>Fluency</Text>
            <Text style={styles.pronunciationValue}>{result.pronunciation.fluency}/100</Text>
          </View>
          <View style={styles.pronunciationItem}>
            <Text style={styles.pronunciationLabel}>Completeness</Text>
            <Text style={styles.pronunciationValue}>{result.pronunciation.completeness}/100</Text>
          </View>
          <View style={styles.pronunciationItem}>
            <Text style={styles.pronunciationLabel}>Prosody</Text>
            <Text style={styles.pronunciationValue}>{result.pronunciation.prosody}/100</Text>
          </View>
        </View>
      </View>
      
      {result.feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Feedback</Text>
          <Text style={styles.feedbackText}>{result.feedback}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#202254',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F97316',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  scoreItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  scoreItemLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  scoreItemValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#202254',
  },
  feedbackContainer: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6',
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#202254',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  pronunciationDetails: {
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
  },
  pronunciationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#202254',
    marginBottom: 12,
  },
  pronunciationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pronunciationItem: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  pronunciationLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  pronunciationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F97316',
  },
});
