import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    TextInput as RNTextInput,
    TextInputProps as RNTextInputProps,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { DesignTokens } from '../../constants/design-tokens';
import { Caption, Label } from './Typography';

/**
 * Form Components - Input fields with consistent styling
 * 
 * COMPONENTS:
 * - TextInput: Styled input with label and error states
 * - SearchInput: Input with search icon
 * - TextArea: Multi-line input
 * 
 * STATES:
 * - default: Border neutral.200
 * - focus: Border primary.500, shadow
 * - error: Border error, error message below
 * - disabled: Background neutral.100, opacity 0.6
 * 
 * USAGE:
 * <TextInput
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={emailError}
 * />
 */

type IconName = keyof typeof Ionicons.glyphMap;

interface BaseInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  disabled?: boolean;
}

interface TextInputCustomProps extends BaseInputProps {}

interface SearchInputProps extends Omit<BaseInputProps, 'leftIcon'> {
  loading?: boolean;
  onClear?: () => void;
}

interface TextAreaProps extends BaseInputProps {
  rows?: number;
}

// TEXT INPUT - Standard form input
export const TextInput: React.FC<TextInputCustomProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  disabled = false,
  value,
  onChangeText,
  placeholder,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputContainerStyle = (): ViewStyle => {
    let borderColor = DesignTokens.colors.neutral[200];
    let backgroundColor = DesignTokens.colors.neutral[0];
    
    if (disabled) {
      backgroundColor = DesignTokens.colors.neutral[100];
    } else if (error) {
      borderColor = DesignTokens.colors.error;
    } else if (isFocused) {
      borderColor = DesignTokens.colors.primary[500];
    }

    return {
      ...styles.inputContainer,
      borderColor,
      backgroundColor,
      opacity: disabled ? 0.6 : 1,
    };
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Label style={styles.label}>{label}</Label>
      )}
      
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={DesignTokens.colors.neutral[400]}
            style={styles.leftIcon}
          />
        )}
        
        <RNTextInput
          style={[styles.input, inputStyle] as any}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={DesignTokens.colors.neutral[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            accessibilityRole="button"
          >
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={DesignTokens.colors.neutral[400]}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Caption color={DesignTokens.colors.error} style={styles.errorText}>
          {error}
        </Caption>
      )}
    </View>
  );
};

// SEARCH INPUT - Input with search functionality
export const SearchInput: React.FC<SearchInputProps> = ({
  loading = false,
  onClear,
  value,
  placeholder = "Search...",
  ...props
}) => {
  const showClearButton = value && value.length > 0 && !loading;

  return (
    <TextInput
      leftIcon="search-outline"
      rightIcon={
        loading ? undefined : showClearButton ? "close-circle" : undefined
      }
      onRightIconPress={showClearButton ? onClear : undefined}
      placeholder={placeholder}
      value={value}
      {...props}
    />
  );
};

// TEXT AREA - Multi-line input
export const TextArea: React.FC<TextAreaProps> = ({
  rows = 4,
  containerStyle,
  inputStyle,
  ...props
}) => {
  const textAreaHeight = rows * 20 + DesignTokens.spacing.md * 2;

  return (
    <TextInput
      multiline
      numberOfLines={rows}
      containerStyle={containerStyle}
      inputStyle={[
        { 
          height: textAreaHeight, 
          textAlignVertical: 'top' as const,
          paddingTop: DesignTokens.spacing.sm,
        } as any, 
        inputStyle
      ] as any}
      {...props}
    />
  );
};

// FORM GROUP - Wrapper for multiple form fields
interface FormGroupProps {
  children: React.ReactNode;
  gap?: keyof typeof DesignTokens.spacing;
  style?: ViewStyle;
}

export const FormGroup: React.FC<FormGroupProps> = ({ 
  children, 
  gap = 'md',
  style,
}) => (
  <View style={[{ gap: DesignTokens.spacing[gap] }, style]}>
    {children}
  </View>
);

// FORM SECTION - Section with title
interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  gap?: keyof typeof DesignTokens.spacing;
  style?: ViewStyle;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  gap = 'md',
  style,
}) => (
  <View style={[styles.formSection, { gap: DesignTokens.spacing[gap] }, style]}>
    {title && (
      <Label style={styles.sectionTitle}>{title}</Label>
    )}
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: DesignTokens.spacing.xs,
  },
  
  label: {
    marginBottom: DesignTokens.spacing.xs,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: DesignTokens.radius.md,
    paddingHorizontal: DesignTokens.spacing.md,
    minHeight: 48,
  },
  
  input: {
    flex: 1,
    fontSize: DesignTokens.typography.size.base,
    color: DesignTokens.colors.neutral[800],
    paddingVertical: DesignTokens.spacing.sm,
  },
  
  leftIcon: {
    marginRight: DesignTokens.spacing.sm,
  },
  
  rightIconContainer: {
    marginLeft: DesignTokens.spacing.sm,
    padding: DesignTokens.spacing.xs,
  },
  
  errorText: {
    marginTop: DesignTokens.spacing.xs,
  },
  
  formSection: {
    marginBottom: DesignTokens.spacing.lg,
  },
  
  sectionTitle: {
    fontSize: DesignTokens.typography.size.lg,
    fontWeight: '600',
    color: DesignTokens.colors.neutral[900],
  },
});