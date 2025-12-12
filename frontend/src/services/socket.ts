import { io, Socket } from 'socket.io-client';

// Define events
interface ServerToClientEvents {
    stream_chunk: (data: { content: string; conversation_id: string }) => void;
    stream_complete: (data: { full_content: string; conversation_id: string; search_info?: string }) => void;
    search_status: (data: { status: 'searching' | 'completed' | 'error'; info?: string; error?: string }) => void;
    error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
    chat_message: (data: {
        message: string;
        history: any[];
        conversation_id?: string;
        enable_search?: boolean;
    }) => void;
}

class SocketService {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
    private url: string = 'http://localhost:8000';

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(this.url, {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
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
        // @ts-ignore - Socket.io types are complex to map perfectly here
        this.socket?.on(event, callback);
    }

    off<T extends keyof ServerToClientEvents>(event: T) {
        this.socket?.off(event);
    }
}

export const socketService = new SocketService();
