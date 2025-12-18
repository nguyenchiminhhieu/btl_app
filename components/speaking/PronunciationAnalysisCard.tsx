import {
    Body,
    Caption,
    Card,
    DesignTokens,
    Heading4,
    HStack,
    VStack,
} from '@/components/design-system';
import React from 'react';

interface PronunciationMetric {
  overall: number;
  accuracy: number;
  fluency: number;
  completeness: number;
  prosody: number;
}

interface PronunciationAnalysisCardProps {
  pronunciation: PronunciationMetric;
  title?: string;
}

export const PronunciationAnalysisCard: React.FC<PronunciationAnalysisCardProps> = ({
  pronunciation,
  title = '🎤 Pronunciation Analysis',
}) => {
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return DesignTokens.colors.success;
    if (percentage >= 70) return DesignTokens.colors.primary[600];
    if (percentage >= 60) return DesignTokens.colors.accent[500];
    if (percentage >= 50) return DesignTokens.colors.warning;
    return DesignTokens.colors.error;
  };

  const metrics = [
    { label: 'Overall Score', value: pronunciation.overall },
    { label: 'Accuracy', value: pronunciation.accuracy },
    { label: 'Fluency', value: pronunciation.fluency },
    { label: 'Completeness', value: pronunciation.completeness },
    { label: 'Prosody', value: pronunciation.prosody },
  ];

  return (
    <Card variant="default" padding="lg">
      <VStack gap="md">
        <Heading4>{title}</Heading4>
        
        <Caption color={DesignTokens.colors.neutral[600]}>
          Powered by Azure Speech Service
        </Caption>
        
        <VStack gap="md">
          {metrics.map((metric) => (
            <MetricBar
              key={metric.label}
              label={metric.label}
              value={metric.value}
              color={getProgressColor(metric.value)}
            />
          ))}
        </VStack>
      </VStack>
    </Card>
  );
};

const MetricBar: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <VStack gap="xs">
    <HStack justify="space-between" align="center">
      <Body>{label}</Body>
      <Caption weight="semibold" color={color}>
        {value}%
      </Caption>
    </HStack>
    
    <VStack
      style={{
        height: 6,
        backgroundColor: DesignTokens.colors.neutral[200],
        borderRadius: DesignTokens.radius.sm,
        overflow: 'hidden',
      }}
    >
      <VStack
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, value))}%`,
          backgroundColor: color,
          borderRadius: DesignTokens.radius.sm,
        }}
      >
        <></>
      </VStack>
    </VStack>
  </VStack>
);