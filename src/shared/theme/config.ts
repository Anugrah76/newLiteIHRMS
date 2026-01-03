/**
 * Professional Corporate Theme Configuration
 * Clean, mechanical, bureaucratic design for enterprise organizations
 */

export const colors = {
    light: {
        // Primary - Professional blues and grays
        primary: '#2563eb', // Corporate blue
        primaryDark: '#1e40af',
        primaryLight: '#3b82f6',

        // Background - Clean whites and light grays
        background: '#f8f9fa',
        surface: '#ffffff',
        surfaceVariant: '#f1f3f5',

        // Text - Strong contrast for readability
        text: '#1f2937',
        textSecondary: '#6b7280',
        textTertiary: '#9ca3af',

        // Borders - Subtle but defined
        border: '#e5e7eb',
        borderLight: '#f3f4f6',

        // Status - Muted, professional colors
        success: '#059669',
        error: '#dc2626',
        warning: '#d97706',
        info: '#0284c7',

        // Card backgrounds
        cardPrimary: '#ffffff',
        cardSecondary: '#f9fafb',

        // Gradients - Subtle, professional
        gradientStart: '#1e3a8a', // Deep navy
        gradientMiddle: '#1e40af', // Corporate blue
        gradientEnd: '#2563eb', // Bright blue

        // Accent for highlights
        accent: '#6366f1',
    },
    dark: {
        // Primary - Softer blues for dark mode
        primary: '#60a5fa',
        primaryDark: '#3b82f6',
        primaryLight: '#93c5fd',

        // Background - Professional dark grays
        background: '#111827',
        surface: '#1f2937',
        surfaceVariant: '#374151',

        // Text - High contrast for readability
        text: '#f9fafb',
        textSecondary: '#d1d5db',
        textTertiary: '#9ca3af',

        // Borders
        border: '#374151',
        borderLight: '#4b5563',

        // Status
        success: '#10b981',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#38bdf8',

        // Card backgrounds
        cardPrimary: '#1f2937',
        cardSecondary: '#374151',

        // Gradients - Deeper, more subtle
        gradientStart: '#1e293b',
        gradientMiddle: '#1e40af',
        gradientEnd: '#3b82f6',

        // Accent
        accent: '#818cf8',
    },
} as const;

/**
 * Spacing scale (consistent across light/dark)
 */
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
} as const;

/**
 * Border radius - More angular for corporate feel
 */
export const borderRadius = {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
} as const;

/**
 * Typography - Clean, geometric fonts
 */
export const typography = {
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
    fontWeight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
} as const;

/**
 * Shadow definitions - Subtle, professional
 */
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
} as const;

export type ThemeColors = typeof colors.light;
export type Theme = {
    colors: ThemeColors;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    typography: typeof typography;
    shadows: typeof shadows;
    isDark: boolean;
};
