/**
 * Channel Drawer Component
 * Discord-style channel list with app theme integration
 */

import React from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
    Image,
} from 'react-native';
import { Hash, Volume2, Plus, Settings, ChevronDown, Crown } from 'lucide-react-native';
import { useTheme } from '@shared/theme';
import { Server, Channel, User } from '../services';

interface ChannelDrawerProps {
    server: Server | null;
    channels: Channel[];
    activeChannelId: string | null;
    currentUser: User | null;
    onSelectChannel: (channelId: string) => void;
    onCreateChannel: () => void;
}

export function ChannelDrawer({
    server,
    channels,
    activeChannelId,
    currentUser,
    onSelectChannel,
    onCreateChannel,
}: ChannelDrawerProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    // Group channels by type
    const textChannels = channels.filter(c => c.type === 'text');
    const voiceChannels = channels.filter(c => c.type === 'voice');

    return (
        <View style={styles.container}>
            {/* Server Header - Glassmorphism effect */}
            <TouchableOpacity style={styles.serverHeader}>
                <Text style={styles.serverName} numberOfLines={1}>
                    {server?.name || 'No Server'}
                </Text>
                <ChevronDown size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {/* Channels List */}
            <ScrollView
                style={styles.channelList}
                showsVerticalScrollIndicator={false}
            >
                {/* Text Channels Category */}
                <View style={styles.category}>
                    <TouchableOpacity style={styles.categoryHeader}>
                        <ChevronDown size={12} color={theme.colors.textTertiary} />
                        <Text style={styles.categoryTitle}>TEXT CHANNELS</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={onCreateChannel}
                        >
                            <Plus size={16} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    {textChannels.map((channel) => (
                        <TouchableOpacity
                            key={channel.id}
                            style={[
                                styles.channelItem,
                                activeChannelId === channel.id && styles.channelItemActive,
                            ]}
                            onPress={() => onSelectChannel(channel.id)}
                            activeOpacity={0.7}
                        >
                            <Hash
                                size={20}
                                color={activeChannelId === channel.id ? theme.colors.text : theme.colors.textTertiary}
                            />
                            <Text
                                style={[
                                    styles.channelName,
                                    activeChannelId === channel.id && styles.channelNameActive,
                                ]}
                                numberOfLines={1}
                            >
                                {channel.name}
                            </Text>
                            {/* Unread indicator dot */}
                            {activeChannelId !== channel.id && (
                                <View style={styles.unreadDot} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Voice Channels Category (if any) */}
                {voiceChannels.length > 0 && (
                    <View style={styles.category}>
                        <TouchableOpacity style={styles.categoryHeader}>
                            <ChevronDown size={12} color={theme.colors.textTertiary} />
                            <Text style={styles.categoryTitle}>VOICE CHANNELS</Text>
                        </TouchableOpacity>

                        {voiceChannels.map((channel) => (
                            <TouchableOpacity
                                key={channel.id}
                                style={[
                                    styles.channelItem,
                                    activeChannelId === channel.id && styles.channelItemActive,
                                ]}
                                onPress={() => onSelectChannel(channel.id)}
                            >
                                <Volume2
                                    size={20}
                                    color={activeChannelId === channel.id ? theme.colors.text : theme.colors.textTertiary}
                                />
                                <Text
                                    style={[
                                        styles.channelName,
                                        activeChannelId === channel.id && styles.channelNameActive,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {channel.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* User Panel (bottom) - Enhanced with status */}
            <View style={styles.userPanel}>
                <View style={styles.userAvatarContainer}>
                    {currentUser?.avatar ? (
                        <Image source={{ uri: currentUser.avatar }} style={styles.userAvatar} />
                    ) : (
                        <View style={[styles.userAvatar, styles.userAvatarFallback]}>
                            <Text style={styles.userAvatarText}>
                                {currentUser?.name?.charAt(0) || 'U'}
                            </Text>
                        </View>
                    )}
                    {/* Online status indicator */}
                    <View style={[styles.statusIndicator, styles.statusOnline]} />
                </View>
                <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {currentUser?.name || 'User'}
                        </Text>
                        {server?.ownerId === currentUser?.id && (
                            <Crown size={12} color={theme.colors.warning} />
                        )}
                    </View>
                    <Text style={styles.userStatus}>Online</Text>
                </View>
                <TouchableOpacity style={styles.settingsButton}>
                    <Settings size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
    container: {
        width: 240,
        backgroundColor: theme.isDark ? '#1e293b' : '#f1f5f9',
        flexDirection: 'column',
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    serverHeader: {
        height: 48,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(241, 245, 249, 0.9)',
    },
    serverName: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    channelList: {
        flex: 1,
        paddingTop: 16,
    },
    category: {
        marginBottom: 16,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    categoryTitle: {
        color: theme.colors.textTertiary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginLeft: 4,
        flex: 1,
    },
    addButton: {
        padding: 4,
    },
    channelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginHorizontal: 8,
        borderRadius: 6,
    },
    channelItemActive: {
        backgroundColor: theme.isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.1)',
    },
    channelName: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        marginLeft: 8,
        flex: 1,
        fontWeight: '500',
    },
    channelNameActive: {
        color: theme.colors.text,
        fontWeight: '600',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        opacity: 0, // Hidden by default, show when has unread
    },
    userPanel: {
        height: 56,
        backgroundColor: theme.isDark ? '#0f172a' : '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    userAvatarContainer: {
        position: 'relative',
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary,
    },
    userAvatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: -1,
        right: -1,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 3,
        borderColor: theme.isDark ? '#0f172a' : '#e2e8f0',
    },
    statusOnline: {
        backgroundColor: theme.colors.success,
    },
    userInfo: {
        flex: 1,
        marginLeft: 10,
    },
    userNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    userName: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    userStatus: {
        color: theme.colors.textTertiary,
        fontSize: 12,
    },
    settingsButton: {
        width: 36,
        height: 36,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
