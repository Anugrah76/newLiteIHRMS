/**
 * Server Rail Component
 * Discord-style vertical server list with app theme integration
 */

import React from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Text,
} from 'react-native';
import { Plus, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@shared/theme';
import { Server } from '../services';

interface ServerRailProps {
    servers: Server[];
    activeServerId: string | null;
    onSelectServer: (serverId: string) => void;
    onCreateServer: () => void;
}

export function ServerRail({
    servers,
    activeServerId,
    onSelectServer,
    onCreateServer,
}: ServerRailProps) {
    const theme = useTheme();

    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            {/* Home/DMs Button */}
            <TouchableOpacity style={styles.homeButton}>
                <MessageCircle size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Server List */}
            <ScrollView
                style={styles.serverList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.serverListContent}
            >
                {servers.map((server) => (
                    <TouchableOpacity
                        key={server.id}
                        style={[
                            styles.serverButton,
                            activeServerId === server.id && styles.serverButtonActive,
                        ]}
                        onPress={() => onSelectServer(server.id)}
                        activeOpacity={0.7}
                    >
                        {/* Active Indicator - Animated pill */}
                        <View style={[
                            styles.activeIndicator,
                            activeServerId === server.id && styles.activeIndicatorVisible,
                        ]} />

                        {/* Server Icon with glow effect when active */}
                        <View style={[
                            styles.serverIconWrapper,
                            activeServerId === server.id && styles.serverIconWrapperActive,
                        ]}>
                            <Image
                                source={{ uri: server.icon }}
                                style={[
                                    styles.serverIcon,
                                    activeServerId === server.id && styles.serverIconActive,
                                ]}
                            />
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Add Server Button */}
                <TouchableOpacity
                    style={styles.addServerButton}
                    onPress={onCreateServer}
                    activeOpacity={0.7}
                >
                    <Plus size={24} color={theme.colors.success} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
    container: {
        width: 72,
        backgroundColor: theme.isDark ? '#0f172a' : '#e2e8f0',
        paddingTop: 12,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    homeButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        // Subtle shadow
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    divider: {
        width: 32,
        height: 2,
        backgroundColor: theme.colors.border,
        borderRadius: 1,
        marginBottom: 8,
    },
    serverList: {
        flex: 1,
        width: '100%',
    },
    serverListContent: {
        alignItems: 'center',
        paddingBottom: 12,
    },
    serverButton: {
        width: 72,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    serverButtonActive: {},
    activeIndicator: {
        position: 'absolute',
        left: 0,
        width: 4,
        height: 8,
        backgroundColor: theme.colors.text,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        opacity: 0,
    },
    activeIndicatorVisible: {
        opacity: 1,
        height: 36,
    },
    serverIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    serverIconWrapperActive: {
        borderRadius: 16,
        // Glow effect
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 3,
    },
    serverIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
    },
    serverIconActive: {
        borderRadius: 16,
    },
    addServerButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        borderStyle: 'dashed',
    },
});
