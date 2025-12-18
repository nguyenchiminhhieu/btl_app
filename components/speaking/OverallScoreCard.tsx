import {
    Caption,
    Card,
    DesignTokens,
    Display,
    VStack
} from '@/components/design-system';
import React from 'react';

interface OverallScoreCardProps {
  score: number;
  maxScore?: number;
  title?: string;
}

export const OverallScoreCard: React.FC<OverallScoreCardProps> = ({
  score,
  maxScore = 9.0,
  title = 'Overall IELTS Band Score',
}) => {
  const percentage = (score / maxScore) * 100;
  
  const getScoreColor = (score: number): string => {
    if (score >= 8) return DesignTokens.colors.success;
    if (score >= 7) return DesignTokens.colors.primary[600];
    if (score >= 6) return DesignTokens.colors.accent[500];
    if (score >= 5) return DesignTokens.colors.warning;
    return DesignTokens.colors.error;
  };

  const getScoreDescription = (score: number): string => {
    if (score >= 8) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Competent';
    if (score >= 5) return 'Modest';
    return 'Limited';
  };

  return (
    <Card variant="gradient" padding="xl">
      <VStack gap="lg" align="center">
        <Caption color={DesignTokens.colors.neutral[100]} align="center">
          🏆 {title}
        </Caption>
        
        <VStack gap="xs" align="center">
          <Display color={DesignTokens.colors.neutral[0]}>
            {score.toFixed(1)}
          </Display>
          <Caption color={DesignTokens.colors.neutral[100]}>
            out of {maxScore}
          </Caption>
        </VStack>
        
        {/* Progress Ring Visual */}
        <VStack 
          align="center" 
          justify="center"
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 6,
            borderColor: getScoreColor(score),
          }}
        >
          <Caption color={DesignTokens.colors.neutral[0]} weight="semibold">
            {Math.round(percentage)}%
          </Caption>
        </VStack>
        
        <Caption 
          color={DesignTokens.colors.neutral[50]} 
          align="center"
          weight="semibold"
        >
          {getScoreDescription(score)} Performance
        </Caption>
      </VStack>
    </Card>
  );
};