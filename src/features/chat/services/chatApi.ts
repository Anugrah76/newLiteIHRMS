/**
 * Chat API Client
 * REST API calls to the chat backend
 */

import axios from 'axios';

// Update this to your machine's local IP when testing on physical device
const API_BASE_URL = 'http://localhost:3001/api';

const chatApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============ TYPES ============
export interface User {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
}

export interface Server {
    id: string;
    name: string;
    icon: string;
    ownerId: string;
    inviteCode: string;
}

export interface Channel {
    id: string;
    serverId: string;
    name: string;
    type: 'text' | 'voice';
    topic: string;
}

export interface Message {
    id: string;
    channelId: string;
    authorId: string;
    author?: User;
    content: string;
    attachments: string[];
    timestamp: string;
}

// ============ USER API ============
export const userApi = {
    create: async (name: string, avatar?: string): Promise<User> => {
        const response = await chatApi.post('/users', { name, avatar });
        return response.data;
    },

    getAll: async (): Promise<User[]> => {
        const response = await chatApi.get('/users');
        return response.data;
    },

    getById: async (userId: string): Promise<User> => {
        const response = await chatApi.get(`/users/${userId}`);
        return response.data;
    },
};

// ============ SERVER API ============
export const serverApi = {
    create: async (name: string, ownerId: string, icon?: string): Promise<Server> => {
        const response = await chatApi.post('/servers', { name, ownerId, icon });
        return response.data;
    },

    getUserServers: async (userId: string): Promise<Server[]> => {
        const response = await chatApi.get(`/servers/user/${userId}`);
        return response.data;
    },

    getById: async (serverId: string): Promise<Server> => {
        const response = await chatApi.get(`/servers/${serverId}`);
        return response.data;
    },

    join: async (userId: string, inviteCode: string): Promise<Server> => {
        const response = await chatApi.post('/servers/join', { userId, inviteCode });
        return response.data;
    },

    getMembers: async (serverId: string): Promise<User[]> => {
        const response = await chatApi.get(`/servers/${serverId}/members`);
        return response.data;
    },
};

// ============ CHANNEL API ============
export const channelApi = {
    create: async (serverId: string, name: string, type?: string, topic?: string): Promise<Channel> => {
        const response = await chatApi.post('/channels', { serverId, name, type, topic });
        return response.data;
    },

    getServerChannels: async (serverId: string): Promise<Channel[]> => {
        const response = await chatApi.get(`/channels/server/${serverId}`);
        return response.data;
    },

    getById: async (channelId: string): Promise<Channel> => {
        const response = await chatApi.get(`/channels/${channelId}`);
        return response.data;
    },
};

// ============ MESSAGE API ============
export const messageApi = {
    getChannelMessages: async (channelId: string, limit?: number, before?: string): Promise<Message[]> => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (before) params.append('before', before);

        const response = await chatApi.get(`/messages/${channelId}?${params.toString()}`);
        return response.data;
    },
};

export { chatApi };
