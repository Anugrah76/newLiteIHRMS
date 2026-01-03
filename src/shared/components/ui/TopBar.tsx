import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Menu, Search, Bell, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { GlobalSearchModal } from '../GlobalSearchModal';

interface TopBarProps {
    title: string;
    showBack?: boolean;
    onBackPress?: () => void;
    onMenuPress?: () => void;
    onSearchPress?: () => void;
    onNotificationPress?: () => void;
}

/**
 * Universal TopBar Component
 * Corporate navigation bar for all screens
 * Burger menu | Title | Search | Notifications
 */
export const TopBar: React.FC<TopBarProps> = ({
    title,
    showBack,
    onBackPress,
    onMenuPress,
    onNotificationPress,
}) => {
    const theme = useTheme();
    const router = useRouter();
    const [searchVisible, setSearchVisible] = useState(false);

    return (
        <>
            <StatusBar
                barStyle={theme.isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.surface}
            />
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.surface,
                        borderBottomColor: theme.colors.border,
                        paddingTop: Constants.statusBarHeight,
                    }
                ]}
            >
                <View style={styles.content}>
                    {/* Left Action (Back or Menu) */}
                    {showBack ? (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={onBackPress ? onBackPress : () => router.back()}
                            activeOpacity={0.7}
                        >
                            <ArrowLeft width={24} height={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={onMenuPress}
                            activeOpacity={0.7}
                        >
                            <Menu width={24} height={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    )}

                    {/* Title */}
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                            {title}
                        </Text>
                    </View>

                    {/* Right Actions */}
                    <View style={styles.actions}>
                        {/* Search */}
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => setSearchVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Search width={22} height={22} color={theme.colors.text} />
                        </TouchableOpacity>

                        {/* Notifications */}
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={onNotificationPress}
                            activeOpacity={0.7}
                        >
                            <Bell width={22} height={22} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <GlobalSearchModal
                visible={searchVisible}
                onClose={() => setSearchVisible(false)}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 100, // Ensure TopBar stays on top
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        marginLeft: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    actions: {
        flexDirection: 'row',
        gap: 4,
    },
});
