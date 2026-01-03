import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type ColorScheme = 'light' | 'dark' | 'auto';

interface ThemeState {
    colorScheme: ColorScheme;
    isDark: boolean;
    setColorScheme: (scheme: ColorScheme) => void;
    toggleTheme: () => void;
}

/**
 * Get actual dark mode state based on color scheme setting
 */
const getIsDark = (scheme: ColorScheme): boolean => {
    if (scheme === 'auto') {
        return Appearance.getColorScheme() === 'dark';
    }
    return scheme === 'dark';
};

/**
 * Theme store
 * Manages app-wide theme and dark mode state
 */
export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            colorScheme: 'auto',
            isDark: getIsDark('auto'),

            setColorScheme: (scheme) => {
                set({
                    colorScheme: scheme,
                    isDark: getIsDark(scheme),
                });
            },

            toggleTheme: () => {
                const current = get().colorScheme;
                const newScheme: ColorScheme = current === 'dark' ? 'light' : 'dark';
                set({
                    colorScheme: newScheme,
                    isDark: getIsDark(newScheme),
                });
            },
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Listen to system theme changes when in auto mode
Appearance.addChangeListener(({ colorScheme }) => {
    const store = useThemeStore.getState();
    if (store.colorScheme === 'auto') {
        useThemeStore.setState({ isDark: colorScheme === 'dark' });
    }
});
