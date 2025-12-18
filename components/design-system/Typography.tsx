import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { DesignTokens } from '../../constants/design-tokens';

// Helper to get proper font weight for React Native
const getFontWeight = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => {
  const weightMap = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  };
  return weightMap[weight];
};

/**
 * Typography Components - Consistent text styles
 * 
 * COMPONENTS:
 * - Heading1: fontSize 42, weight bold, color neutral.900
 * - Heading2: fontSize 32, weight bold, color neutral.900
 * - Heading3: fontSize 24, weight semibold, color neutral.900
 * - Heading4: fontSize 20, weight semibold, color neutral.800
 * - Body: fontSize 16, weight regular, color neutral.800, lineHeight 1.5
 * - BodySmall: fontSize 14, weight regular, color neutral.600
 * - Label: fontSize 14, weight medium, color neutral.600
 * - Caption: fontSize 12, weight regular, color neutral.400
 * 
 * USAGE:
 * <Heading1>Welcome to Lingua Talk</Heading1>
 * <Body>Practice your IELTS speaking skills</Body>
 */

interface BaseTextProps {
  children: React.ReactNode;
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
  weight?: keyof typeof DesignTokens.typography.weight;
  italic?: boolean;
}

// HEADING 1 - Hero titles
export const Heading1: React.FC<BaseTextProps> = ({ 
  children, 
  color = DesignTokens.colors.neutral[800], 
  align = 'left',
  numberOfLines,
  style,
  weight = 'bold',
  italic = false,
}) => (
  <Text 
    style={[
      styles.heading1, 
      { 
        color, 
        textAlign: align, 
        fontWeight: getFontWeight(weight),
        fontStyle: italic ? 'italic' : 'normal',
      }, 
      style
    ]}
    numberOfLines={numberOfLines}
    accessibilityRole="header"
  >
    {children}
  </Text>
);

// HEADING 2 - Large headers
export const Heading2: React.FC<BaseTextProps> = ({ 
  children, 
  color = DesignTokens.colors.neutral[800], 
  align = 'left',
  numberOfLines,
  style,
  weight = 'bold',
  italic = false,
}) => (
  <Text 
    style={[
      styles.heading2, 
      { 
        color, 
        textAlign: align, 
        fontWeight: getFontWeight(weight),
        fontStyle: italic ? 'italic' : 'normal',
      }, 
      style
    ]}
    numberOfLines={numberOfLines}
    accessibilityRole="header"
  >
    {children}
  </Text>
);

// HEADING 3 - Page titles
export const Heading3: React.FC<BaseTextProps> = ({ 
  children, 
  color = DesignTokens.colors.neutral[700], 
  align = 'left',
  numberOfLines,
  style,
  weight = 'semibold',
  italic = false,
}) => (
  <Text 
    style={[
      styles.heading3, 
      { 
        color, 
        textAlign: align, 
        fontWeight: getFontWeight(weight),
        fontStyle: italic ? 'italic' : 'normal',
      }, 
      style
    ]}
    numberOfLines={numberOfLines}
    accessibilityRole="header"
  >
    {children}
  </Text>
);

// HEADING 4 - Section headers
export const Heading4: React.FC<BaseTextProps> = ({ 
  children, 
  color = DesignTokens.colors.neutral[800], 
  align = 'left',
  numberOfLines,
  style,
  weight = 'semibold',
  italic = false,
}) => (
  <Text 
    style={[
      styles.heading4, 
      { 
        color, 
        textAlign: align, 
        fontWeight: getFontWeight(weight),
        fontStyle: italic ? 'italic' : 'normal',
      }, 
      style
    ]}
    numberOfLines={numberOfLines}
    accessibilityRole="header"
  >
    {children}
  </Text>
);

// BODY - Main text content
export const Body: React.FC<BaseTextProps> = ({ 
  children, 
  color = DesignTokens.colors.neutral[600], 
  align = 'left',
  numberOfLines,
  style,
  weight = 'regular',
  italic = false,
}) => (
  <Text 
    style={[
      styles.body, 
      { 
        color, 
        textAlign: align, 
        fontWeight: getFontWeight(weight),
        fontStyle: italic ? 'italic' : 'normal',
      }, 
      style
    ]}
    numberOfLines={numberOfLines}
  >
    {children}
  </Text>
);

// BODY SMALL - Secondary text
export const BodySmall: React.FC<BaseTextProps> = ({ 
  children, 
  color = DesignTokens.colors.neutral[600], 
  align = 'left',
  numberOfLines,
  style,
  weight = 'regular',
  italic = false,
}) => (
  <Text 
    style={[
      styles.bodySmall, 
      { 
        color, 
        textAlign: align, 
        fontWeight: getFontWeight(weight),
        fontStyle: italic ? 'italic' : 'normal',
      }, 
      style
    ]}
    numberOfLines={numberOfLines}
  >
    {children}
  </Text>
);

// LABEL - Form labels, small headers
export const Label: React.FC<BaseTextProps> = ({ 
  children, 
  color = DesignTokens.colors.neutral[600], 
  align = 'left',
  numberOfLines,
  style,
  weight = 'medium',
  italic = false,
}) => (
  <Text 
    style={[
      styles.label, 
      { 
        color, 
        textAlign: align, 
        fontWeight: getFontWeight(weight),
        fontStyle: italic ? 'italic' : 'normal',
      }, 
      style
    ]}
    numberOfLines={numberOfLines}
  >
    {children}
  </Text>
);

// CAPTION - Small descriptive text
export const Caption: React.FC<BaseTextProps> = ({ 
  children, 
  color = DesignTokens.colors.neutral[400], 
  align = 'left',
  numberOfLines,
  style,
  weight = 'regular',
  italic = false,
}) => (
  <Text 
    style={[
      styles.caption, 
      { 
        color, 
        textAlign: align, 
        fontWeight: getFontWeight(weight),
        fontStyle: italic ? 'italic' : 'normal',
      }, 
      style
    ]}
    numberOfLines={numberOfLines}
  >
    {children}
  </Text>
);

// DISPLAY - Large numbers, scores
export const Display: React.FC<BaseTextProps> = ({ 
  children, 
  color = DesignTokens.colors.neutral[900], 
  align = 'center',
  numberOfLines,
  style,
  weight = 'bold',
  italic = false,
}) => (
  <Text 
    style={[
      styles.display, 
      { 
        color, 
        textAlign: align, 
        fontWeight: DesignTokens.typography.weight[weight],
        fontStyle: italic ? 'italic' : 'normal',
      }, 
      style
    ]}
    numberOfLines={numberOfLines}
  >
    {children}
  </Text>
);

const styles = StyleSheet.create({
  heading1: {
    fontSize: DesignTokens.typography.size['4xl'],
    lineHeight: DesignTokens.typography.size['4xl'] * DesignTokens.typography.lineHeight.tight,
  },
  
  heading2: {
    fontSize: DesignTokens.typography.size['3xl'],
    lineHeight: DesignTokens.typography.size['3xl'] * DesignTokens.typography.lineHeight.tight,
  },
  
  heading3: {
    fontSize: DesignTokens.typography.size['2xl'],
    lineHeight: DesignTokens.typography.size['2xl'] * DesignTokens.typography.lineHeight.tight,
  },
  
  heading4: {
    fontSize: DesignTokens.typography.size.xl,
    lineHeight: DesignTokens.typography.size.xl * DesignTokens.typography.lineHeight.tight,
  },
  
  body: {
    fontSize: DesignTokens.typography.size.base,
    lineHeight: DesignTokens.typography.size.base * DesignTokens.typography.lineHeight.normal,
  },
  
  bodySmall: {
    fontSize: DesignTokens.typography.size.sm,
    lineHeight: DesignTokens.typography.size.sm * DesignTokens.typography.lineHeight.normal,
  },
  
  label: {
    fontSize: DesignTokens.typography.size.sm,
    lineHeight: DesignTokens.typography.size.sm * DesignTokens.typography.lineHeight.normal,
  },
  
  caption: {
    fontSize: DesignTokens.typography.size.xs,
    lineHeight: DesignTokens.typography.size.xs * DesignTokens.typography.lineHeight.normal,
  },
  
  display: {
    fontSize: 64, // Extra large for scores/numbers
    lineHeight: 64 * DesignTokens.typography.lineHeight.tight,
  },
});