import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

/**
 * Common styles that can be used across all screens
 * These are theme-aware and work on both Android and iOS
 */

/**
 * Get themed common styles
 * Call this inside a component with useTheme() to get dynamic colors
 */
export const createCommonStyles = (isDark: boolean) => {
    const themeColors = isDark ? colors.dark : colors.light;

    return StyleSheet.create({
        // Container Styles
        container: {
            flex: 1,
            backgroundColor: themeColors.background,
        },
        safeArea: {
            flex: 1,
            backgroundColor: themeColors.background,
        },
        scrollContainer: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: spacing.xxxl,
        },

        // Card Styles
        card: {
            backgroundColor: themeColors.cardPrimary,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: themeColors.border,
            ...shadows.md,
        },
        cardCompact: {
            backgroundColor: themeColors.cardPrimary,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: themeColors.border,
            ...shadows.sm,
        },
        cardPrimary: {
            backgroundColor: themeColors.cardPrimary,
            borderTopWidth: 2,
            borderTopColor: themeColors.primary,
        },

        // Section Styles
        section: {
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.xl,
        },
        sectionTitle: {
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: themeColors.text,
            marginBottom: spacing.md,
        },

        // Text Styles
        title: {
            fontSize: typography.fontSize.xxl,
            fontWeight: typography.fontWeight.bold,
            color: themeColors.text,
        },
        subtitle: {
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.medium,
            color: themeColors.textSecondary,
        },
        bodyText: {
            fontSize: typography.fontSize.md,
            color: themeColors.text,
            lineHeight: typography.fontSize.md * typography.lineHeight.normal,
        },
        captionText: {
            fontSize: typography.fontSize.sm,
            color: themeColors.textTertiary,
        },

        // Button Styles
        button: {
            backgroundColor: themeColors.primary,
            borderRadius: borderRadius.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.sm,
        },
        buttonText: {
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
            color: '#ffffff',
        },
        buttonSecondary: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: themeColors.border,
        },
        buttonSecondaryText: {
            color: themeColors.text,
        },
        buttonDisabled: {
            opacity: 0.6,
        },

        // Input Styles
        input: {
            fontSize: typography.fontSize.md,
            color: themeColors.text,
            backgroundColor: themeColors.surfaceVariant,
            borderWidth: 1,
            borderColor: themeColors.border,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            height: 48,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: themeColors.surfaceVariant,
            borderWidth: 1,
            borderColor: themeColors.border,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.sm,
        },
        inputLabel: {
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.medium,
            color: themeColors.text,
            marginBottom: spacing.xs,
        },

        // Header Styles
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: themeColors.surface,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.border,
        },
        headerTitle: {
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: themeColors.text,
        },

        // List Styles
        listItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.borderLight,
        },
        listItemText: {
            fontSize: typography.fontSize.md,
            color: themeColors.text,
            flex: 1,
        },

        // Status Badge Styles
        badge: {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.sm,
            alignSelf: 'flex-start',
        },
        badgeSuccess: {
            backgroundColor: themeColors.success + '20',
        },
        badgeError: {
            backgroundColor: themeColors.error + '20',
        },
        badgeWarning: {
            backgroundColor: themeColors.warning + '20',
        },
        badgeInfo: {
            backgroundColor: themeColors.info + '20',
        },
        badgeText: {
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.medium,
        },
        badgeTextSuccess: {
            color: themeColors.success,
        },
        badgeTextError: {
            color: themeColors.error,
        },
        badgeTextWarning: {
            color: themeColors.warning,
        },
        badgeTextInfo: {
            color: themeColors.info,
        },

        // Divider
        divider: {
            height: 1,
            backgroundColor: themeColors.border,
            marginVertical: spacing.md,
        },

        // Center Content
        centerContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },

        // Loading Container
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: themeColors.background,
        },

        // Empty State
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.xxxl,
        },
        emptyStateText: {
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.medium,
            color: themeColors.textSecondary,
            marginTop: spacing.md,
            textAlign: 'center',
        },
    });
};
