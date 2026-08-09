import axios from 'axios';
import type { ChatMessage } from '../types';

// 同源访问：前端和后端部署在同一端口
export const api = axios.create({
    baseURL: '',  // 空字符串 = 同源
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
