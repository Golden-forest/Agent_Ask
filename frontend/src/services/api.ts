import axios from 'axios';
import type { ChatMessage } from '../types';

const API_URL = 'http://localhost:8000';

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
