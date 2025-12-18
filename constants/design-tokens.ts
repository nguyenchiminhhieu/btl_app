export const DesignTokens = {
  colors: {
    // PRIMARY - Warm Educational Blue
    primary: {
      50: '#F0F9FF',   // Lightest blue for backgrounds
      100: '#E0F2FE',  // Soft hover states
      200: '#BAE6FD',  // Light accents
      400: '#38BDF8',  // Interactive elements
      500: '#0EA5E9',  // Main primary color - friendly blue
      600: '#0284C7',  // Primary text, icons - education focus
      700: '#0369A1',  // Active states - professional yet warm
      800: '#075985',  // Dark text
      900: '#0C4A6E',  // Headers, deep emphasis
    },
    
    // ACCENT - Warm Orange (Engaging Actions)
    accent: {
      100: '#FED7AA',  // Light accent backgrounds
      400: '#FB923C',  // Interactive highlights
      500: '#F97316',  // Main CTA - encouraging
      600: '#EA580C',  // Active/pressed states
      700: '#C2410C',  // Strong emphasis
    },
    
    // NEUTRAL - Educational Warm Grays
    neutral: {
      0: '#FFFFFF',     // Pure white
      50: '#FAFAF9',    // Warm backgrounds
      100: '#F5F5F4',   // Card surfaces
      200: '#E7E5E4',   // Gentle borders
      300: '#D6D3D1',   // Subtle dividers
      400: '#A8A29E',   // Placeholder - softer
      500: '#78716C',   // Supporting text
      600: '#57534E',   // Body text - readable
      700: '#44403C',   // Important content
      800: '#292524',   // Headings - strong
      900: '#1C1917',   // Maximum emphasis
    },
    
    // SEMANTIC - Educational Context
    success: '#10B981',   // Achievements, correct answers
    error: '#DC2626',     // Gentle error - not harsh red
    warning: '#D97706',   // Constructive warnings
    info: '#0EA5E9',      // Helpful information
    
    // EDUCATIONAL SPECIFIC
    progress: '#8B5CF6',  // Progress indicators - purple
    focus: '#06B6D4',     // Focus/attention areas - cyan
    
    // GRADIENTS - Soft & Encouraging
    gradient: {
      primary: ['#0EA5E9', '#0284C7'] as const,        // Friendly blue
      accent: ['#F97316', '#EA580C'] as const,         // Warm orange
      success: ['#10B981', '#059669'] as const,        // Achievement green  
      background: ['#F0F9FF', '#E0F2FE'] as const,     // Gentle blue bg
      card: ['#FFFFFF', '#F8FAFC'] as const,           // Subtle card gradient
    },
  },
  
  typography: {
    // FONT FAMILY - System fonts only
    fontFamily: {
      default: 'System',
      ios: 'SF Pro',
      android: 'Roboto',
    },
    
    // FONT SIZES - Clear hierarchy
    size: {
      xs: 12,      // Labels, captions
      sm: 14,      // Secondary text, descriptions
      base: 16,    // Body text, buttons
      lg: 18,      // Subheadings, card titles
      xl: 20,      // Section headers
      '2xl': 24,   // Page titles
      '3xl': 32,   // Large headers
      '4xl': 42,   // Hero titles (home screen)
    },
    
    // FONT WEIGHTS
    weight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    
    // LINE HEIGHTS - Readability first
    lineHeight: {
      tight: 1.2,    // Headers
      normal: 1.5,   // Body text
      relaxed: 1.6,  // Long-form content
    },
  },
  
  spacing: {
    xs: 4,       // Minimal gaps
    sm: 8,       // Small related elements
    md: 12,      // Comfortable component spacing
    lg: 20,      // Section spacing - educational comfort
    xl: 28,      // Large section breaks
    '2xl': 40,   // Screen padding - not too tight
    '3xl': 56,   // Hero sections, major breaks
  },
  
  radius: {
    sm: 8,       // Small elements, tags
    md: 14,      // Buttons, inputs - friendlier
    lg: 18,      // Cards - approachable
    xl: 24,      // Large cards, modals
    '2xl': 32,   // Hero cards, special elements
    full: 9999,  // Pills, rounded elements
  },
  
  shadows: {
    none: {},
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
  },
  
  layout: {
    // SCREEN PADDING
    screenPadding: {
      horizontal: 20,  // Left/right padding
      vertical: 24,    // Top/bottom padding
    },
    
    // CONTAINER MAX WIDTH
    containerMaxWidth: 480,  // Max width for content on tablets
    
    // CARD SPACING
    cardGap: 12,  // Gap between cards in lists
    
    // SECTION SPACING
    sectionGap: 32,  // Gap between major sections
  },
};

// HELPER FUNCTIONS
export const getColor = (colorPath: string): string => {
  const keys = colorPath.split('.');
  let value: any = DesignTokens.colors;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const getSpacing = (size: keyof typeof DesignTokens.spacing): number => {
  return DesignTokens.spacing[size];
};

// TYPE DEFINITIONS
export type ColorKey = keyof typeof DesignTokens.colors;
export type SpacingKey = keyof typeof DesignTokens.spacing;
export type TypographySize = keyof typeof DesignTokens.typography.size;
export type TypographyWeight = keyof typeof DesignTokens.typography.weight;
export type RadiusKey = keyof typeof DesignTokens.radius;
export type ShadowKey = keyof typeof DesignTokens.shadows;