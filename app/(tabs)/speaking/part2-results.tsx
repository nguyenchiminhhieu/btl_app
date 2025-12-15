import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Part2ResultData {
  transcript: string;
  pronunciation: {
    overall: number;
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
  };
  content: {
    bandScore: number;
    fluencyCoherence: number;
    lexicalResource: number;
    grammaticalRange: number;
    pronunciation: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
  feedback: string;
  strengths: string[];
  improvements: string[];
  overallBand: number;
}

export default function Part2ResultsScreen() {
  const params = useLocalSearchParams();
  const [showDetails, setShowDetails] = useState(true);

  // Parse the result data with error handling
  let resultData: Part2ResultData;
  try {
    const assessmentString = params.assessmentData as string;
    if (!assessmentString) {
      throw new Error('No assessment data provided');
    }
    const parsedData = JSON.parse(assessmentString);
    
    // Validate required properties
    if (!parsedData || typeof parsedData.overallBand !== 'number') {
      throw new Error('Invalid assessment data structure');
    }
    
    resultData = parsedData;
  } catch (error) {
    console.error('Failed to parse assessment data:', error);
    console.log('Assessment string:', params.assessmentData);
    // Return to previous screen on parse error
    router.back();
    return null;
  }
  
  // Additional safety checks
  if (!resultData || !resultData.content || !resultData.pronunciation) {
    console.error('Missing required data properties');
    router.back();
    return null;
  }

  const getBandColor = (band: number) => {
    if (band >= 8) return Colors.accent.success;      // Green for excellent (8-9)
    if (band >= 7) return Colors.primary.main;        // Navy for good (7-7.5)
    if (band >= 6) return Colors.secondary.main;      // Orange for competent (6-6.5)
    if (band >= 5) return Colors.accent.warning;      // Yellow for modest (5-5.5)
    return Colors.accent.error;                       // Red for limited (<5)
  };

  const getBandDescription = (band: number) => {
    if (band >= 8) return 'Excellent';
    if (band >= 7) return 'Good';
    if (band >= 6) return 'Competent';
    if (band >= 5) return 'Modest';
    return 'Limited';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return Colors.accent.success;   // Green for 80-100%
    if (percentage >= 70) return Colors.primary.main;     // Navy for 70-79%
    if (percentage >= 60) return Colors.secondary.main;   // Orange for 60-69%
    if (percentage >= 50) return Colors.accent.warning;   // Yellow for 50-59%
    return Colors.accent.error;                          // Red for <50%
  };

  const handleBackToTopics = () => {
    // Navigate back to Part 2 categories
    router.push('/(tabs)/speaking/part2' as any);
  };

  const handleTryAgain = () => {
    // Navigate back to Part 2 categories to select another topic
    router.push('/(tabs)/speaking/part2' as any);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary.main, Colors.secondary.main]}
        style={styles.header}
      >
      </LinearGradient>

      {/* 1. OVERALL BAND SCORE - PRIMARY FOCUS */}
      <View style={styles.overallScoreContainer}>
        <Text style={styles.overallScoreTitle}>🏆 Overall IELTS Band Score</Text>
        <View style={styles.overallScoreCard}>
          <View style={[
            styles.overallBandCircle,
            { backgroundColor: getBandColor(resultData.overallBand) }
          ]}>
            <Text style={styles.overallBandNumber}>
              {resultData.overallBand.toFixed(1)}
            </Text>
          </View>
          <View style={styles.overallScoreInfo}>
            <Text style={styles.overallScoreLabel}>IELTS Speaking Band</Text>
            <Text style={[
              styles.bandDescription,
              { color: getBandColor(resultData.overallBand) }
            ]}>
              {getBandDescription(resultData.overallBand)}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. IELTS BAND SCORES - 4 CRITERIA */}
      <View style={styles.ieltsScoresContainer}>
        <Text style={styles.sectionTitle}>📊 IELTS Assessment Criteria</Text>
        
        <View style={styles.criteriaGrid}>
          <View style={styles.criteriaCard}>
            <Text style={styles.criteriaLabel}>Fluency &{'\n'}Coherence</Text>
            <View style={[styles.criteriaBadge, { backgroundColor: getBandColor(resultData.content.fluencyCoherence) }]}>
              <Text style={styles.criteriaBadgeText}>{resultData.content.fluencyCoherence.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.criteriaCard}>
            <Text style={styles.criteriaLabel}>Lexical{'\n'}Resource</Text>
            <View style={[styles.criteriaBadge, { backgroundColor: getBandColor(resultData.content.lexicalResource) }]}>
              <Text style={styles.criteriaBadgeText}>{resultData.content.lexicalResource.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.criteriaCard}>
            <Text style={styles.criteriaLabel}>Grammatical{'\n'}Range & Accuracy</Text>
            <View style={[styles.criteriaBadge, { backgroundColor: getBandColor(resultData.content.grammaticalRange) }]}>
              <Text style={styles.criteriaBadgeText}>{resultData.content.grammaticalRange.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.criteriaCard}>
            <Text style={styles.criteriaLabel}>Pronunciation</Text>
            <View style={[styles.criteriaBadge, { backgroundColor: getBandColor(resultData.content.pronunciation) }]}>
              <Text style={styles.criteriaBadgeText}>{resultData.content.pronunciation.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. PRONUNCIATION ANALYSIS - AZURE DETAILED METRICS */}
      <View style={styles.pronunciationAnalysisContainer}>
        <Text style={styles.sectionTitle}>🎤 Pronunciation Analysis (Azure Speech)</Text>
        
        <View style={styles.pronunciationMetrics}>
          <View style={styles.pronunciationItem}>
            <View style={styles.pronunciationLabelContainer}>
              <Text style={styles.pronunciationLabel}>Overall Score</Text>
              <Text style={styles.pronunciationValue}>{resultData.pronunciation.overall}%</Text>
            </View>
            <View style={styles.pronunciationBar}>
              <View style={[
                styles.pronunciationFill,
                { width: `${resultData.pronunciation.overall}%`, backgroundColor: getProgressColor(resultData.pronunciation.overall) }
              ]} />
            </View>
          </View>

          <View style={styles.pronunciationItem}>
            <View style={styles.pronunciationLabelContainer}>
              <Text style={styles.pronunciationLabel}>Accuracy</Text>
              <Text style={styles.pronunciationValue}>{resultData.pronunciation.accuracy}%</Text>
            </View>
            <View style={styles.pronunciationBar}>
              <View style={[
                styles.pronunciationFill,
                { width: `${resultData.pronunciation.accuracy}%`, backgroundColor: getProgressColor(resultData.pronunciation.accuracy) }
              ]} />
            </View>
          </View>

          <View style={styles.pronunciationItem}>
            <View style={styles.pronunciationLabelContainer}>
              <Text style={styles.pronunciationLabel}>Fluency</Text>
              <Text style={styles.pronunciationValue}>{resultData.pronunciation.fluency}%</Text>
            </View>
            <View style={styles.pronunciationBar}>
              <View style={[
                styles.pronunciationFill,
                { width: `${resultData.pronunciation.fluency}%`, backgroundColor: getProgressColor(resultData.pronunciation.fluency) }
              ]} />
            </View>
          </View>

          <View style={styles.pronunciationItem}>
            <View style={styles.pronunciationLabelContainer}>
              <Text style={styles.pronunciationLabel}>Completeness</Text>
              <Text style={styles.pronunciationValue}>{resultData.pronunciation.completeness}%</Text>
            </View>
            <View style={styles.pronunciationBar}>
              <View style={[
                styles.pronunciationFill,
                { width: `${resultData.pronunciation.completeness}%`, backgroundColor: getProgressColor(resultData.pronunciation.completeness) }
              ]} />
            </View>
          </View>

          <View style={styles.pronunciationItem}>
            <View style={styles.pronunciationLabelContainer}>
              <Text style={styles.pronunciationLabel}>Prosody</Text>
              <Text style={styles.pronunciationValue}>{resultData.pronunciation.prosody}%</Text>
            </View>
            <View style={styles.pronunciationBar}>
              <View style={[
                styles.pronunciationFill,
                { width: `${resultData.pronunciation.prosody}%`, backgroundColor: getProgressColor(resultData.pronunciation.prosody) }
              ]} />
            </View>
          </View>
        </View>
      </View>
      
      {/* 4. FEEDBACK SECTION - DETAILED ANALYSIS */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.sectionTitle}>💬 Detailed Feedback & Analysis</Text>
        
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Overall Assessment</Text>
          <Text style={styles.feedbackText}>{resultData.feedback}</Text>
        </View>

        <View style={styles.strengthsImprovements}>
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackSectionTitle}>✅ Strengths</Text>
            {resultData.strengths.map((strength, index) => (
              <View key={index} style={styles.feedbackItem}>
                <Text style={styles.feedbackBullet}>•</Text>
                <Text style={styles.feedbackItemText}>{strength}</Text>
              </View>
            ))}
          </View>

          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackSectionTitle}>🎯 Areas for Improvement</Text>
            {resultData.improvements.map((improvement, index) => (
              <View key={index} style={styles.feedbackItem}>
                <Text style={styles.feedbackBullet}>•</Text>
                <Text style={styles.feedbackItemText}>{improvement}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleTryAgain}
        >
          <Text style={styles.primaryButtonText}>Try Another Topic</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => router.push('/(tabs)/speaking' as any)}
        >
          <Text style={styles.secondaryButtonText}>Back to Speaking</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => router.push('/')}
        >
          <Text style={styles.secondaryButtonText}>Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 4,
  },
  overallScoreContainer: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  overallScoreLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginRight: 16,
  },
  bandBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bandScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bandDescription: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailedScoresContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailsToggleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  detailsContent: {
    padding: 20,
    paddingTop: 0,
  },
  criteriaSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 16,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  criteriaLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  criteriaScore: {
    backgroundColor: Colors.primary.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pronunciationSection: {
    marginTop: 24,
  },
  pronunciationItem: {
    marginBottom: 16,
  },
  pronunciationLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  pronunciationBar: {
    height: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  pronunciationFill: {
    height: '100%',
    backgroundColor: Colors.accent.success,
    borderRadius: 10,
  },
  pronunciationScore: {
    position: 'absolute',
    right: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  
  // Unified Action Buttons
  actionButtons: {
    padding: 20,
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: Colors.primary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  secondaryButtonText: {
    color: Colors.primary.main,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // NEW STYLES FOR REDESIGNED LAYOUT
  
  // 1. Overall Score Styles
  overallScoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 16,
    textAlign: 'center',
  },
  overallScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  overallBandCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  overallBandNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  overallScoreInfo: {
    flex: 1,
  },

  // 2. IELTS Criteria Grid Styles
  ieltsScoresContainer: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  criteriaCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  criteriaBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  criteriaBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // 3. Pronunciation Analysis Styles
  pronunciationAnalysisContainer: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pronunciationMetrics: {
    gap: 16,
  },
  pronunciationLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pronunciationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },

  // 4. Feedback Styles
  feedbackContainer: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  strengthsImprovements: {
    gap: 16,
  },
  feedbackSection: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  feedbackSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 12,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  feedbackBullet: {
    fontSize: 16,
    color: Colors.primary.main,
    marginRight: 8,
    fontWeight: 'bold',
  },
  feedbackItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});