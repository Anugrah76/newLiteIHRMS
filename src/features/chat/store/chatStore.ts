/**
 * Chat Store
 * Zustand store for managing chat state
 */

import { create } from 'zustand';
import { Server, Channel, Message, User, serverApi, channelApi, userApi } from '../services';
import { socketService } from '../services/socketService';

interface ChatState {
    // Current user (for demo purposes)
    currentUser: User | null;

    // Server state
    servers: Server[];
    activeServerId: string | null;

    // Channel state
    channels: Channel[];
    activeChannelId: string | null;

    // Messages state
    messages: Message[];

    // UI state
    isConnected: boolean;
    isLoading: boolean;
    typingUsers: { userId: string; userName: string }[];

    // Actions
    initialize: (userId?: string) => Promise<void>;
    setActiveServer: (serverId: string) => Promise<void>;
    setActiveChannel: (channelId: string) => void;
    sendMessage: (content: string) => void;
    addMessage: (message: Message) => void;
    setTypingUser: (userId: string, userName: string, isTyping: boolean) => void;
    createServer: (name: string) => Promise<Server | null>;
    createChannel: (name: string, type?: string, topic?: string) => Promise<Channel | null>;
    joinServer: (inviteCode: string) => Promise<Server | null>;
    disconnect: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    // Initial state
    currentUser: null,
    servers: [],
    activeServerId: null,
    channels: [],
    activeChannelId: null,
    messages: [],
    isConnected: false,
    isLoading: false,
    typingUsers: [],

    // Initialize chat - connect socket and load servers
    initialize: async (userId?: string) => {
        set({ isLoading: true });

        try {
            let user: User;

            if (userId) {
                user = await userApi.getById(userId);
            } else {
                // Create a new demo user
                user = await userApi.create('App User');
            }

            set({ currentUser: user });

            // Connect socket
            const socket = socketService.connect(user.id);

            socket.on('connect', () => {
                set({ isConnected: true });
            });

            socket.on('disconnect', () => {
                set({ isConnected: false });
            });

            // Listen for new messages
            socket.on('new_message', (message: Message) => {
                get().addMessage(message);
            });

            // Listen for channel history
            socket.on('channel_history', ({ messages }: { channelId: string; messages: Message[] }) => {
                set({ messages });
            });

            // Listen for typing indicators
            socket.on('user_typing', ({ userId, userName, isTyping }: any) => {
                get().setTypingUser(userId, userName, isTyping);
            });

            // Load user's servers
            const servers = await serverApi.getUserServers(user.id);
            set({ servers });

            // Auto-select first server if available
            if (servers.length > 0) {
                await get().setActiveServer(servers[0].id);
            }

        } catch (error) {
            console.error('Failed to initialize chat:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    // Set active server and load its channels
    setActiveServer: async (serverId: string) => {
        set({ activeServerId: serverId, channels: [], activeChannelId: null, messages: [] });

        try {
            const channels = await channelApi.getServerChannels(serverId);
            set({ channels });

            // Auto-select first channel
            if (channels.length > 0) {
                get().setActiveChannel(channels[0].id);
            }
        } catch (error) {
            console.error('Failed to load channels:', error);
        }
    },

    // Set active channel and join socket room
    setActiveChannel: (channelId: string) => {
        set({ activeChannelId: channelId, messages: [], typingUsers: [] });
        socketService.joinChannel(channelId);
    },

    // Send a message
    sendMessage: (content: string) => {
        const { activeChannelId, currentUser } = get();
        if (!activeChannelId || !currentUser) return;

        socketService.sendMessage(activeChannelId, content);
    },

    // Add message to list
    addMessage: (message: Message) => {
        set((state) => ({
            messages: [...state.messages, message],
        }));
    },

    // Handle typing indicators
    setTypingUser: (userId: string, userName: string, isTyping: boolean) => {
        set((state) => {
            if (isTyping) {
                // Add user to typing list if not already there
                if (!state.typingUsers.find(u => u.userId === userId)) {
                    return { typingUsers: [...state.typingUsers, { userId, userName }] };
                }
            } else {
                // Remove user from typing list
                return { typingUsers: state.typingUsers.filter(u => u.userId !== userId) };
            }
            return state;
        });
    },

    // Create a new server
    createServer: async (name: string) => {
        const { currentUser } = get();
        if (!currentUser) return null;

        try {
            const server = await serverApi.create(name, currentUser.id);
            set((state) => ({ servers: [...state.servers, server] }));
            return server;
        } catch (error) {
            console.error('Failed to create server:', error);
            return null;
        }
    },

    // Create a new channel
    createChannel: async (name: string, type = 'text', topic = '') => {
        const { activeServerId } = get();
        if (!activeServerId) return null;

        try {
            const channel = await channelApi.create(activeServerId, name, type, topic);
            set((state) => ({ channels: [...state.channels, channel] }));
            return channel;
        } catch (error) {
            console.error('Failed to create channel:', error);
            return null;
        }
    },

    // Join server by invite code
    joinServer: async (inviteCode: string) => {
        const { currentUser } = get();
        if (!currentUser) return null;

        try {
            const server = await serverApi.join(currentUser.id, inviteCode);
            set((state) => ({ servers: [...state.servers, server] }));
            return server;
        } catch (error) {
            console.error('Failed to join server:', error);
            return null;
        }
    },

    // Disconnect and cleanup
    disconnect: () => {
        socketService.disconnect();
        set({
            currentUser: null,
            servers: [],
            activeServerId: null,
            channels: [],
            activeChannelId: null,
            messages: [],
            isConnected: false,
            typingUsers: [],
        });
    },
}));
