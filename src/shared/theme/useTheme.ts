import { useThemeStore } from '@shared/store';
import { colors, spacing, borderRadius, typography, shadows, type Theme } from './config';

/**
 * Custom hook to access current theme
 * Returns complete theme object with colors, spacing, etc.
 */
export const useTheme = (): Theme => {
    const isDark = useThemeStore((state) => state.isDark);

    return {
        colors: (isDark ? colors.dark : colors.light) as any,
        spacing,
        borderRadius,
        typography,
        shadows,
        isDark,
    };
};
