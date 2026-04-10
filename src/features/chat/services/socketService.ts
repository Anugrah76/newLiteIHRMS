/**
 * Socket.io Client Service
 * Singleton connection manager for React Native
 */

import { io, Socket } from 'socket.io-client';

// Update this to your machine's local IP when testing on physical device
const SOCKET_URL = 'http://192.168.1.10:3001';

class SocketService {
    private socket: Socket | null = null;
    private userId: string | null = null;

    /**
     * Initialize socket connection
     */
    connect(userId: string): Socket {
        if (this.socket?.connected && this.userId === userId) {
            return this.socket;
        }

        // Disconnect existing connection if different user
        if (this.socket) {
            this.socket.disconnect();
        }

        this.userId = userId;
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('🔌 Socket connected');
            this.socket?.emit('identify', userId);
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error.message);
        });

        return this.socket;
    }

    /**
     * Get current socket instance
     */
    getSocket(): Socket | null {
        return this.socket;
    }

    /**
     * Join a specific channel
     */
    joinChannel(channelId: string): void {
        this.socket?.emit('join_channel', channelId);
    }

    /**
     * Send a message to current channel
     */
    sendMessage(channelId: string, content: string, attachments: string[] = []): void {
        if (!this.userId) {
            console.error('Cannot send message: user not identified');
            return;
        }
        this.socket?.emit('send_message', {
            channelId,
            authorId: this.userId,
            content,
            attachments,
        });
    }

    /**
     * Emit typing start
     */
    startTyping(channelId: string, userName: string): void {
        this.socket?.emit('typing_start', {
            channelId,
            userId: this.userId,
            userName,
        });
    }

    /**
     * Emit typing stop
     */
    stopTyping(channelId: string): void {
        this.socket?.emit('typing_stop', {
            channelId,
            userId: this.userId,
        });
    }

    /**
     * Disconnect socket
     */
    disconnect(): void {
        this.socket?.disconnect();
        this.socket = null;
        this.userId = null;
    }
}

// Export singleton instance
export const socketService = new SocketService();
