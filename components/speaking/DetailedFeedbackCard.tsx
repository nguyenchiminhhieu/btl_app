import {
    Body,
    Caption,
    Card,
    DesignTokens,
    Heading4,
    HStack,
    Label,
    VStack,
} from '@/components/design-system';
import React from 'react';

interface DetailedFeedbackCardProps {
  overallFeedback?: string;
  strengths: string[];
  improvements: string[];
}

export const DetailedFeedbackCard: React.FC<DetailedFeedbackCardProps> = ({
  overallFeedback,
  strengths,
  improvements,
}) => {
  return (
    <Card variant="default" padding="lg">
      <VStack gap="lg">
        <Heading4>💬 Detailed Feedback</Heading4>
        
        {overallFeedback && (
          <Card variant="outlined" padding="md">
            <VStack gap="sm">
              <Label color={DesignTokens.colors.primary[600]}>
                Overall Assessment
              </Label>
              <Body color={DesignTokens.colors.neutral[600]}>
                {overallFeedback}
              </Body>
            </VStack>
          </Card>
        )}
        
        <VStack gap="md">
          {/* Strengths */}
          {strengths.length > 0 && (
            <VStack gap="sm">
              <Label color={DesignTokens.colors.success}>
                ✅ Strengths
              </Label>
              {strengths.map((item, index) => (
                <FeedbackItem key={`strength-${index}`} text={item} />
              ))}
            </VStack>
          )}
          
          {/* Areas for Improvement */}
          {improvements.length > 0 && (
            <VStack gap="sm">
              <Label color={DesignTokens.colors.warning}>
                🎯 Areas for Improvement
              </Label>
              {improvements.map((item, index) => (
                <FeedbackItem key={`improvement-${index}`} text={item} />
              ))}
            </VStack>
          )}
        </VStack>
      </VStack>
    </Card>
  );
};

const FeedbackItem: React.FC<{ text: string }> = ({ text }) => (
  <HStack gap="sm" align="flex-start">
    <Caption 
      color={DesignTokens.colors.primary[600]} 
      weight="bold"
      style={{ marginTop: 2 }}
    >
      •
    </Caption>
    <Body style={{ flex: 1 }} color={DesignTokens.colors.neutral[600]}>
      {text}
    </Body>
  </HStack>
);