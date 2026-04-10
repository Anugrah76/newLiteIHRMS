/**
 * Message Row Component
 * Discord-style message display with app theme integration
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MoreHorizontal, Smile, Reply } from 'lucide-react-native';
import { useTheme } from '@shared/theme';
import { Message } from '../services';

interface MessageRowProps {
    message: Message;
    isGrouped?: boolean;
}

export function MessageRow({ message, isGrouped = false }: MessageRowProps) {
    const theme = useTheme();
    const styles = createStyles(theme);
    const [showActions, setShowActions] = React.useState(false);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today at ${formatTime(timestamp)}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday at ${formatTime(timestamp)}`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            }) + ` ${formatTime(timestamp)}`;
        }
    };

    // Get author initials for avatar fallback
    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    };

    // Get a consistent color based on author name
    const getAvatarColor = (name: string) => {
        const colors = [
            '#ef4444', '#f97316', '#eab308', '#22c55e',
            '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899'
        ];
        const index = name?.charCodeAt(0) % colors.length || 0;
        return colors[index];
    };

    if (isGrouped) {
        return (
            <TouchableOpacity
                style={styles.groupedContainer}
                onPress={() => setShowActions(!showActions)}
                activeOpacity={0.8}
            >
                <Text style={styles.groupedTime}>{formatTime(message.timestamp)}</Text>
                <Text style={styles.messageContent}>{message.content}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => setShowActions(!showActions)}
            activeOpacity={0.8}
        >
            {/* Avatar */}
            {message.author?.avatar ? (
                <Image
                    source={{ uri: message.author.avatar }}
                    style={styles.avatar}
                />
            ) : (
                <View style={[
                    styles.avatar,
                    styles.avatarFallback,
                    { backgroundColor: getAvatarColor(message.author?.name || '') }
                ]}>
                    <Text style={styles.avatarText}>
                        {getInitials(message.author?.name || 'Unknown')}
                    </Text>
                </View>
            )}

            {/* Message Content */}
            <View style={styles.messageBody}>
                {/* Header: Username + Timestamp */}
                <View style={styles.messageHeader}>
                    <Text style={styles.authorName}>
                        {message.author?.name || 'Unknown User'}
                    </Text>
                    <Text style={styles.timestamp}>
                        {formatDate(message.timestamp)}
                    </Text>
                </View>

                {/* Message Text */}
                <Text style={styles.messageContent}>{message.content}</Text>

                {/* Attachments (if any) */}
                {message.attachments && message.attachments.length > 0 && (
                    <View style={styles.attachments}>
                        {message.attachments.map((attachment, index) => (
                            <View key={index} style={styles.attachment}>
                                <Text style={styles.attachmentText}>{attachment}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Quick Actions (show on hover/press) */}
            {showActions && (
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <Smile size={18} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <Reply size={18} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <MoreHorizontal size={18} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginTop: 16,
        position: 'relative',
    },
    groupedContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 2,
        paddingLeft: 72,
    },
    groupedTime: {
        color: theme.colors.textTertiary,
        fontSize: 11,
        marginRight: 8,
        opacity: 0,
        width: 0,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    avatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    messageBody: {
        flex: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    authorName: {
        color: theme.colors.text,
        fontSize: 15,
        fontWeight: '600',
        marginRight: 8,
    },
    timestamp: {
        color: theme.colors.textTertiary,
        fontSize: 12,
    },
    messageContent: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
    attachments: {
        marginTop: 8,
    },
    attachment: {
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 12,
        marginTop: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    attachmentText: {
        color: theme.colors.primary,
        fontSize: 14,
    },
    quickActions: {
        position: 'absolute',
        right: 16,
        top: 0,
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionButton: {
        padding: 8,
    },
});
