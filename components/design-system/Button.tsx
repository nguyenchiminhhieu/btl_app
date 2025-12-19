import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { DesignTokens } from '../../constants/design-tokens';

/**
 * Button Component - Unified button with variants
 * 
 * VARIANTS:
 * - primary: Blue gradient, white text (Main actions)
 * - secondary: White bg, blue border (Secondary actions)
 * - accent: Orange gradient (CTAs, important actions)
 * - ghost: Transparent, blue text (Tertiary actions)
 * - danger: Red bg (Delete, destructive actions)
 * 
 * SIZES:
 * - sm: height 40, padding 12, fontSize 14
 * - md: height 48, padding 16, fontSize 16
 * - lg: height 56, padding 20, fontSize 18
 * 
 * USAGE:
 * <Button variant="primary" size="lg" onPress={handlePress}>
 *   Start Practice
 * </Button>
 */

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'success' | 'lesson' | 'practice';
type ButtonSize = 'sm' | 'md' | 'lg';
type IconName = keyof typeof Ionicons.glyphMap;

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  style,
}) => {
  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.button;
    const sizeStyle = styles[`size_${size}`];
    const variantStyle = styles[`variant_${variant}`];
    
    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = styles.text;
    const sizeStyle = styles[`textSize_${size}`];
    const variantTextStyle = styles[`textVariant_${variant}`];
    
    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantTextStyle,
    };
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 20;
      default: return 18;
    }
  };

  const getIconColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'accent':
      case 'danger':
        return DesignTokens.colors.neutral[0];
      case 'secondary':
        return DesignTokens.colors.primary[600];
      case 'ghost':
        return DesignTokens.colors.primary[600];
      default:
        return DesignTokens.colors.neutral[0];
    }
  };

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getIconColor()} 
        />
      ) : (
        <>
          {leftIcon && (
            <Ionicons 
              name={leftIcon} 
              size={getIconSize()} 
              color={getIconColor()} 
              style={styles.leftIcon}
            />
          )}
          
          <Text style={getTextStyle()}>
            {children}
          </Text>
          
          {rightIcon && (
            <Ionicons 
              name={rightIcon} 
              size={getIconSize()} 
              color={getIconColor()} 
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </View>
  );

  // Use solid colors instead of gradient to avoid visual artifacts

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[getButtonStyle(), style]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: DesignTokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // SIZES
  size_sm: {
    height: 40,
    paddingHorizontal: 12,
  },
  size_md: {
    height: 48,
    paddingHorizontal: 16,
  },
  size_lg: {
    height: 56,
    paddingHorizontal: 20,
  },
  
  // VARIANTS
  variant_primary: {
    backgroundColor: DesignTokens.colors.primary[600],
  },
  variant_secondary: {
    backgroundColor: DesignTokens.colors.neutral[0],
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[600],
  },
  variant_accent: {
    backgroundColor: DesignTokens.colors.accent[500],
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: DesignTokens.colors.error,
  },

  // EDUCATION-SPECIFIC VARIANTS
  variant_success: {
    backgroundColor: DesignTokens.colors.success,
  },
  variant_lesson: {
    backgroundColor: DesignTokens.colors.primary[100],
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[200],
  },
  variant_practice: {
    backgroundColor: DesignTokens.colors.accent[100],
    borderWidth: 1,
    borderColor: DesignTokens.colors.accent[400],
  },
  
  // TEXT STYLES
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  textSize_sm: {
    fontSize: DesignTokens.typography.size.sm,
  },
  textSize_md: {
    fontSize: DesignTokens.typography.size.base,
  },
  textSize_lg: {
    fontSize: DesignTokens.typography.size.lg,
  },
  
  // TEXT VARIANTS
  textVariant_primary: {
    color: DesignTokens.colors.neutral[0],
  },
  textVariant_secondary: {
    color: DesignTokens.colors.primary[600],
  },
  textVariant_accent: {
    color: DesignTokens.colors.neutral[0],
  },
  textVariant_ghost: {
    color: DesignTokens.colors.primary[600],
  },
  textVariant_danger: {
    color: DesignTokens.colors.neutral[0],
  },

  // EDUCATION TEXT VARIANTS
  textVariant_success: {
    color: DesignTokens.colors.neutral[0],
  },
  textVariant_lesson: {
    color: DesignTokens.colors.primary[700],
  },
  textVariant_practice: {
    color: DesignTokens.colors.accent[700],
  },
  
  // CONTENT & ICONS
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  leftIcon: {
    marginRight: DesignTokens.spacing.xs,
  },
  
  rightIcon: {
    marginLeft: DesignTokens.spacing.xs,
  },
  
  // Removed gradientContainer - using solid colors now
});

export default Button;