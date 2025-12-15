/**
 * Lingua Talk - Talk. Be Heard
 * Modern color palette with navy blue primary and orange accents
 */

import { Platform } from 'react-native';

// Modern professional color system
export const Colors = {
  // Primary brand colors - Navy Blue
  primary: {
    main: '#202254',      // Navy Blue
    light: '#2D3A7F',     // Lighter Navy
    dark: '#151638',      // Darker Navy
    gradient: ['#202254', '#2D3A7F'] as const, // Navy gradient
  },
  
  // Secondary colors - Orange/Yellow gradient
  secondary: {
    main: '#F97316',      // Orange 500
    light: '#FB923C',     // Orange 400
    dark: '#EA580C',      // Orange 600
    gradient: ['#F97316', '#FBBF24'] as const, // Orange to Yellow
  },
  
  // Accent colors
  accent: {
    success: '#10B981',   // Green 500
    warning: '#FBBF24',   // Yellow 400
    error: '#EF4444',     // Red 500
    info: '#14B8A6',      // Teal 500
  },
  
  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    bg: '#F8FAFC',        // Slate 50
    bgDark: '#F1F5F9',    // Slate 100
    border: '#E2E8F0',    // Slate 200
    text: '#1E293B',      // Slate 800
    textLight: '#64748B', // Slate 500
    textMuted: '#94A3B8', // Slate 400
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Light theme
  light: {
    text: '#1E293B',
    background: '#FFFFFF',
    tint: '#202254',
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#6366F1',
    card: '#FFFFFF',
    border: '#E2E8F0',
  },
  
  // Dark theme
  dark: {
    text: '#F1F5F9',
    background: '#0F172A',
    tint: '#818CF8',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#818CF8',
    card: '#1E293B',
    border: '#334155',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
