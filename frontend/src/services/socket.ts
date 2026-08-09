import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../types';

// Define events
interface ServerToClientEvents {
    connect: () => void;
    disconnect: () => void;
    stream_chunk: (data: { content: string; conversation_id: string }) => void;
    stream_complete: (data: { full_content: string; conversation_id: string; search_info?: string }) => void;
    search_status: (data: { status: 'searching' | 'completed' | 'error'; info?: string; error?: string }) => void;
    error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
    chat_message: (data: {
        message: string;
        history: ChatMessage[];
        conversation_id?: string;
        enable_search?: boolean;
    }) => void;
}

class SocketService {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

    private getUrl(): string {
        // 同源连接：前端和后端在同一个端口，部署时由后端统一服务
        // 开发模式（vite dev server）走 vite proxy，也走同源
        return window.location.origin;
    }

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(this.getUrl(), {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit<T extends keyof ClientToServerEvents>(event: T, ...args: Parameters<ClientToServerEvents[T]>) {
        if (!this.socket) {
            this.connect();
        }
        this.socket?.emit(event, ...args);
    }

    on<T extends keyof ServerToClientEvents>(event: T, callback: ServerToClientEvents[T]) {
        if (!this.socket) {
            this.connect();
        }
        // Use type assertion for Socket.io event registration
        (this.socket as Socket<ServerToClientEvents, ClientToServerEvents>).on(event, callback as any);
    }

    off<T extends keyof ServerToClientEvents>(event: T) {
        this.socket?.off(event);
    }
}

export const socketService = new SocketService();
