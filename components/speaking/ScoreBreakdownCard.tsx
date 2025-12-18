import {
    Body,
    Caption,
    Card,
    DesignTokens,
    Divider,
    Heading4,
    HStack,
    VStack,
} from '@/components/design-system';
import React from 'react';

interface ScoreBreakdownCardProps {
  icon: string;
  title: string;
  score: number;
  description?: string;
  maxScore?: number;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({
  icon,
  title,
  score,
  description,
  maxScore = 9.0,
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 8) return DesignTokens.colors.success;
    if (score >= 7) return DesignTokens.colors.primary[600];
    if (score >= 6) return DesignTokens.colors.accent[500];
    if (score >= 5) return DesignTokens.colors.warning;
    return DesignTokens.colors.error;
  };

  return (
    <Card variant="outlined" padding="md">
      <VStack gap="md">
        {/* Header */}
        <HStack justify="space-between" align="flex-start">
          <HStack gap="sm" align="center" style={{ flex: 1 }}>
            <VStack
              align="center"
              justify="center"
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: DesignTokens.colors.primary[50],
              }}
            >
              <Body style={{ fontSize: 16 }}>{icon}</Body>
            </VStack>
            <VStack gap="xs" style={{ flex: 1 }}>
              <Body weight="semibold" numberOfLines={2}>
                {title}
              </Body>
            </VStack>
          </HStack>
          
          <VStack align="center">
            <Heading4 color={getScoreColor(score)}>
              {score.toFixed(1)}
            </Heading4>
            <Caption color={DesignTokens.colors.neutral[400]}>
              /{maxScore}
            </Caption>
          </VStack>
        </HStack>

        {description && (
          <>
            <Divider />
            <Caption color={DesignTokens.colors.neutral[600]}>
              {description}
            </Caption>
          </>
        )}
      </VStack>
    </Card>
  );
};