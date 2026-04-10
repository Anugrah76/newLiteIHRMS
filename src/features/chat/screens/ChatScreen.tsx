/**
 * Chat Screen
 * Main Discord-style chat interface with app theme integration
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    ActivityIndicator,
    Modal,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Hash, X, Wifi, WifiOff, Users, Bell, Pin, Search } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useTheme } from '@shared/theme';
import { useChatStore } from '../store';
import { ServerRail, ChannelDrawer, MessageRow, Composer } from '../components';
import { Message } from '../services';

export function ChatScreen() {
    const theme = useTheme();
    const styles = createStyles(theme);

    const flatListRef = useRef<FlatList>(null);
    const [showCreateServer, setShowCreateServer] = useState(false);
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [newName, setNewName] = useState('');

    const {
        currentUser,
        servers,
        activeServerId,
        channels,
        activeChannelId,
        messages,
        isConnected,
        isLoading,
        typingUsers,
        initialize,
        setActiveServer,
        setActiveChannel,
        sendMessage,
        createServer,
        createChannel,
    } = useChatStore();

    // Initialize on mount
    useEffect(() => {
        initialize();
    }, []);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    // Get active server and channel
    const activeServer = servers.find(s => s.id === activeServerId) || null;
    const activeChannel = channels.find(c => c.id === activeChannelId) || null;

    // Check if messages should be grouped (same author within 5 minutes)
    const shouldGroupMessage = (message: Message, index: number): boolean => {
        if (index === 0) return false;
        const prevMessage = messages[index - 1];
        if (prevMessage.authorId !== message.authorId) return false;

        const timeDiff = new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime();
        return timeDiff < 5 * 60 * 1000; // 5 minutes
    };

    // Handle create server
    const handleCreateServer = async () => {
        if (newName.trim()) {
            await createServer(newName.trim());
            setNewName('');
            setShowCreateServer(false);
        }
    };

    // Handle create channel
    const handleCreateChannel = async () => {
        if (newName.trim()) {
            await createChannel(newName.trim());
            setNewName('');
            setShowCreateChannel(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Connecting to chat...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style={theme.isDark ? 'light' : 'dark'} />

            {/* Server Rail (Left) */}
            <ServerRail
                servers={servers}
                activeServerId={activeServerId}
                onSelectServer={setActiveServer}
                onCreateServer={() => setShowCreateServer(true)}
            />

            {/* Channel Drawer (Middle) */}
            <ChannelDrawer
                server={activeServer}
                channels={channels}
                activeChannelId={activeChannelId}
                currentUser={currentUser}
                onSelectChannel={setActiveChannel}
                onCreateChannel={() => setShowCreateChannel(true)}
            />

            {/* Chat Area (Right) */}
            <View style={styles.chatArea}>
                {/* Chat Header - Enhanced with more actions */}
                <View style={styles.chatHeader}>
                    <Hash size={22} color={theme.colors.textTertiary} />
                    <Text style={styles.channelName}>
                        {activeChannel?.name || 'Select a channel'}
                    </Text>

                    {/* Divider */}
                    <View style={styles.headerDivider} />

                    {activeChannel?.topic && (
                        <Text style={styles.channelTopic} numberOfLines={1}>
                            {activeChannel.topic}
                        </Text>
                    )}

                    {/* Header Actions */}
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerActionButton}>
                            <Bell size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerActionButton}>
                            <Pin size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerActionButton}>
                            <Users size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>

                        {/* Search box */}
                        <View style={styles.headerSearch}>
                            <Text style={styles.headerSearchText}>Search</Text>
                            <Search size={16} color={theme.colors.textTertiary} />
                        </View>

                        {/* Connection Status */}
                        <View style={styles.connectionStatus}>
                            {isConnected ? (
                                <Wifi size={18} color={theme.colors.success} />
                            ) : (
                                <WifiOff size={18} color={theme.colors.error} />
                            )}
                        </View>
                    </View>
                </View>

                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    style={styles.messagesList}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <MessageRow
                            message={item}
                            isGrouped={shouldGroupMessage(item, index)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconWrapper}>
                                <Hash size={48} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.emptyTitle}>
                                Welcome to #{activeChannel?.name || 'channel'}!
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                This is the start of the #{activeChannel?.name || 'channel'} channel.
                            </Text>
                        </View>
                    }
                    contentContainerStyle={styles.messagesContent}
                />

                {/* Typing Indicator - Enhanced */}
                {typingUsers.length > 0 && (
                    <View style={styles.typingIndicator}>
                        <View style={styles.typingDots}>
                            <View style={[styles.typingDot, styles.typingDot1]} />
                            <View style={[styles.typingDot, styles.typingDot2]} />
                            <View style={[styles.typingDot, styles.typingDot3]} />
                        </View>
                        <Text style={styles.typingText}>
                            <Text style={styles.typingName}>
                                {typingUsers.map(u => u.userName).join(', ')}
                            </Text>
                            {' '}is typing...
                        </Text>
                    </View>
                )}

                {/* Message Composer */}
                {activeChannelId && (
                    <Composer
                        channelName={activeChannel?.name || 'channel'}
                        onSendMessage={sendMessage}
                    />
                )}
            </View>

            {/* Create Server Modal - Enhanced */}
            <Modal
                visible={showCreateServer}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCreateServer(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create a Server</Text>
                            <TouchableOpacity
                                onPress={() => setShowCreateServer(false)}
                                style={styles.modalCloseButton}
                            >
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalDescription}>
                            Your server is where you and your team hang out. Create channels to organize your conversations.
                        </Text>
                        <Text style={styles.inputLabel}>SERVER NAME</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter server name"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={newName}
                            onChangeText={setNewName}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowCreateServer(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    !newName.trim() && styles.modalButtonDisabled,
                                ]}
                                onPress={handleCreateServer}
                                disabled={!newName.trim()}
                            >
                                <Text style={styles.modalButtonText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Create Channel Modal - Enhanced */}
            <Modal
                visible={showCreateChannel}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCreateChannel(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create a Channel</Text>
                            <TouchableOpacity
                                onPress={() => setShowCreateChannel(false)}
                                style={styles.modalCloseButton}
                            >
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalDescription}>
                            Channels are where your team communicates. They're best when organized around a topic.
                        </Text>
                        <Text style={styles.inputLabel}>CHANNEL NAME</Text>
                        <View style={styles.channelInputWrapper}>
                            <Hash size={18} color={theme.colors.textTertiary} />
                            <TextInput
                                style={styles.channelInput}
                                placeholder="new-channel"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={newName}
                                onChangeText={setNewName}
                            />
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowCreateChannel(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    !newName.trim() && styles.modalButtonDisabled,
                                ]}
                                onPress={handleCreateChannel}
                                disabled={!newName.trim()}
                            >
                                <Text style={styles.modalButtonText}>Create Channel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
        paddingTop: Constants.statusBarHeight,
        paddingBottom: 33,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    loadingText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        marginTop: 16,
    },
    chatArea: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: theme.isDark ? '#0f172a' : '#ffffff',
    },
    chatHeader: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
    },
    channelName: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    headerDivider: {
        width: 1,
        height: 24,
        backgroundColor: theme.colors.border,
        marginHorizontal: 12,
    },
    channelTopic: {
        color: theme.colors.textTertiary,
        fontSize: 13,
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
        gap: 4,
    },
    headerActionButton: {
        padding: 8,
        borderRadius: 6,
    },
    headerSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
        marginLeft: 8,
    },
    headerSearchText: {
        color: theme.colors.textTertiary,
        fontSize: 12,
    },
    connectionStatus: {
        marginLeft: 12,
        padding: 4,
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        paddingBottom: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 24,
    },
    emptyIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)',
    },
    typingDots: {
        flexDirection: 'row',
        marginRight: 8,
        gap: 3,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.textTertiary,
    },
    typingDot1: {
        opacity: 0.4,
    },
    typingDot2: {
        opacity: 0.7,
    },
    typingDot3: {
        opacity: 1,
    },
    typingText: {
        color: theme.colors.textTertiary,
        fontSize: 12,
    },
    typingName: {
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxWidth: 440,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        color: theme.colors.text,
        fontSize: 22,
        fontWeight: '700',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalDescription: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    inputLabel: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: theme.isDark ? '#0f172a' : '#f1f5f9',
        borderRadius: 8,
        padding: 14,
        color: theme.colors.text,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    channelInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.isDark ? '#0f172a' : '#f1f5f9',
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 20,
    },
    channelInput: {
        flex: 1,
        padding: 14,
        color: theme.colors.text,
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalCancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    modalCancelText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    modalButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    modalButtonDisabled: {
        backgroundColor: theme.colors.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
