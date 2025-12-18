import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { DesignTokens } from '../../constants/design-tokens';

/**
 * Card Component - Container for content sections
 * 
 * VARIANTS:
 * - default: White bg, shadow-md, border subtle
 * - elevated: White bg, shadow-lg
 * - gradient: Linear gradient background
 * - outlined: White bg, border only, no shadow
 * 
 * USAGE:
 * <Card variant="elevated" padding="lg">
 *   <Text>Content here</Text>
 * </Card>
 */

type CardVariant = 'default' | 'elevated' | 'gradient' | 'outlined' | 'interactive' | 'achievement' | 'lesson' | 'success';
type CardPadding = 'sm' | 'md' | 'lg' | 'xl';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  pressable?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  borderRadius?: keyof typeof DesignTokens.radius;
  gap?: keyof typeof DesignTokens.spacing;
  align?: 'flex-start' | 'center' | 'flex-end';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  pressable = false,
  onPress,
  style,
  borderRadius = 'lg',
  gap,
  align,
  justify,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle = styles.card;
    const variantStyle = styles[`variant_${variant}`];
    const paddingStyle = styles[`padding_${padding}`];
    
    return {
      ...baseStyle,
      ...variantStyle,
      ...paddingStyle,
      borderRadius: DesignTokens.radius[borderRadius],
      gap: gap ? DesignTokens.spacing[gap] : undefined,
      alignItems: align,
      justifyContent: justify,
    };
  };

  const renderContent = () => (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );

  const renderGradientContent = () => (
    <LinearGradient
      colors={DesignTokens.colors.gradient.primary as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[getCardStyle(), style]}
    >
      {children}
    </LinearGradient>
  );

  if (variant === 'gradient') {
    if (pressable && onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          accessibilityRole="button"
          style={styles.pressableContainer}
        >
          {renderGradientContent()}
        </TouchableOpacity>
      );
    }
    return renderGradientContent();
  }

  if (pressable && onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        style={[getCardStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignTokens.radius.lg,
  },
  
  pressableContainer: {
    borderRadius: DesignTokens.radius.lg,
  },
  
  // VARIANTS
  variant_default: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[200],
    ...DesignTokens.shadows.md,
  },
  
  variant_elevated: {
    backgroundColor: DesignTokens.colors.neutral[0],
    ...DesignTokens.shadows.lg,
  },
  
  variant_gradient: {
    // Gradient styling is handled by LinearGradient component
  },
  
  variant_outlined: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[200],
  },

  // EDUCATION-SPECIFIC VARIANTS
  variant_interactive: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderWidth: 2,
    borderColor: DesignTokens.colors.primary[200],
    ...DesignTokens.shadows.md,
    transform: [{scale: 1}], // For press animations
  },

  variant_achievement: {
    backgroundColor: DesignTokens.colors.success + '10', // Light success background
    borderWidth: 1,
    borderColor: DesignTokens.colors.success,
    ...DesignTokens.shadows.sm,
  },

  variant_lesson: {
    backgroundColor: DesignTokens.colors.primary[50],
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[100],
    ...DesignTokens.shadows.sm,
  },

  variant_success: {
    backgroundColor: DesignTokens.colors.success + '15', // Light success background
    borderWidth: 1,
    borderColor: DesignTokens.colors.success,
    ...DesignTokens.shadows.sm,
  },
  
  // PADDING SIZES
  padding_sm: {
    padding: DesignTokens.spacing.sm,
  },
  
  padding_md: {
    padding: DesignTokens.spacing.md,
  },
  
  padding_lg: {
    padding: DesignTokens.spacing.lg,
  },
  
  padding_xl: {
    padding: DesignTokens.spacing.xl,
  },
});

export default Card;