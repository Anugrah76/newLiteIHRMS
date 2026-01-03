import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { Moon, Sun, Monitor } from 'lucide-react-native';
import { useThemeStore, type ColorScheme } from '@shared/store';
import { useTheme } from '@shared/theme';

/**
 * Theme Switcher Component
 * Allows users to toggle between light, dark, and auto modes
 */
export const ThemeSwitcher: React.FC = () => {
    const { colorScheme, setColorScheme } = useThemeStore();
    const theme = useTheme();

    const options: { value: ColorScheme; icon: any; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'auto', icon: Monitor, label: 'Auto' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
                Theme Mode
            </Text>

            <View style={styles.optionsContainer}>
                {options.map((option) => {
                    const Icon = option.icon;
                    const isActive = colorScheme === option.value;

                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.option,
                                {
                                    backgroundColor: isActive
                                        ? theme.colors.primary + '20'
                                        : theme.colors.surfaceVariant,
                                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                                },
                            ]}
                            onPress={() => setColorScheme(option.value)}
                            activeOpacity={0.7}
                        >
                            <Icon
                                width={20}
                                height={20}
                                color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                            />
                            <Text
                                style={[
                                    styles.optionText,
                                    { color: isActive ? theme.colors.primary : theme.colors.textSecondary },
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    optionsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    option: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
