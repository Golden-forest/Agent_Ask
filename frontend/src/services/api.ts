import axios from 'axios';
import type { ChatMessage } from '../types';

// 动态获取API地址，支持局域网访问
const getApiUrl = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1'
        ? 'http://localhost:8000'
        : `http://${hostname}:8000`;
};

const API_URL = getApiUrl();

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const chatApi = {
    getConversation: async (id: string) => {
        const response = await api.get<{ conversation_id: string; messages: ChatMessage[] }>(`/conversations/${id}`);
        return response.data;
    },

    healthCheck: async () => {
        const response = await api.get('/health');
        return response.data;
    }
};
