import { create } from 'zustand';
import type { ChatMessage, QuickActionType } from '../types';
import { socketService } from '../services/socket';

interface ChatStore {
    messages: ChatMessage[];
    isLoading: boolean;
    input: string;
    currentConversationId: string | null;
    selectedOptions: string[];
    setInput: (input: string) => void;
    addMessage: (message: ChatMessage) => void;
    setLoading: (loading: boolean) => void;
    clearChat: () => void;
    sendMessage: (content: string) => Promise<void>;
    handleQuickAction: (action: QuickActionType) => Promise<void>;
    initSocket: () => void;
    toggleOption: (option: string) => void;
    clearSelectedOptions: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: [
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Hello! I am agent_ask. Please tell me your requirements, and I will help you clarify the details.',
            timestamp: new Date(),
        }
    ],
    isLoading: false,
    input: '',
    currentConversationId: null,
    selectedOptions: [],

    setInput: (input) => set({ input }),

    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

    setLoading: (loading) => set({ isLoading: loading }),

    clearChat: () => set({ messages: [], currentConversationId: null }),

    initSocket: () => {
        socketService.connect();

        socketService.on('stream_chunk', (data: { content: string; conversation_id: string }) => {
            set((state) => {
                const messages = [...state.messages];
                const lastMessage = messages[messages.length - 1];

                if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                    // Append to existing streaming message
                    return {
                        messages: [
                            ...messages.slice(0, -1),
                            { ...lastMessage, content: lastMessage.content + data.content }
                        ]
                    };
                } else {
                    // Start new streaming message (for backward compatibility)
                    return {
                        messages: [
                            ...messages,
                            {
                                id: Date.now().toString(),
                                role: 'assistant',
                                content: data.content,
                                timestamp: new Date(),
                                isStreaming: true
                            }
                        ]
                    };
                }
            });
        });

        socketService.on('stream_complete', (data: { full_content: string; conversation_id: string; search_info?: string }) => {
            set((state) => {
                const messages = [...state.messages];
                const lastMessage = messages[messages.length - 1];

                if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                    // Update existing streaming message
                    return {
                        messages: [
                            ...messages.slice(0, -1),
                            {
                                ...lastMessage,
                                content: data.full_content,
                                searchInfo: data.search_info,
                                isStreaming: false,
                            }
                        ],
                        isLoading: false,
                        currentConversationId: data.conversation_id
                    };
                } else if (lastMessage && lastMessage.role === 'assistant') {
                    // Update existing non-streaming message (for non-streaming mode)
                    return {
                        messages: [
                            ...messages.slice(0, -1),
                            {
                                ...lastMessage,
                                content: data.full_content,
                                searchInfo: data.search_info,
                                isStreaming: false,
                            }
                        ],
                        isLoading: false,
                        currentConversationId: data.conversation_id
                    };
                } else {
                    // Create new message (no streaming message exists)
                    return {
                        messages: [
                            ...messages,
                            {
                                id: Date.now().toString(),
                                role: 'assistant',
                                content: data.full_content,
                                timestamp: new Date(),
                                searchInfo: data.search_info,
                                isStreaming: false,
                            }
                        ],
                        isLoading: false,
                        currentConversationId: data.conversation_id
                    };
                }
            });
        });

        socketService.on('search_status', (data: { status: 'searching' | 'completed' | 'error'; info?: string; error?: string }) => {
            // Optional: Handle search status updates in UI
            console.log('Search status:', data);
        });

        socketService.on('error', (data: { message: string }) => {
            console.error('Socket error:', data);
            set({ isLoading: false });
        });
    },

    sendMessage: async (content) => {
        const { addMessage, setLoading, messages, currentConversationId, initSocket, selectedOptions, clearSelectedOptions } = get();
        if (!content.trim() && selectedOptions.length === 0) return;

        // Ensure socket is connected
        initSocket();

        // Build full message with selected options
        const fullMessage = selectedOptions.length > 0
            ? `${content}\n\nSelected options: ${selectedOptions.join('; ')}`
            : content;

        // Add user message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: fullMessage,
            timestamp: new Date(),
        };
        addMessage(userMsg);
        set({ input: '' });
        setLoading(true);

        // Emit to socket
        socketService.emit('chat_message', {
            message: fullMessage,
            history: messages.map(m => ({ role: m.role, content: m.content })),
            conversation_id: currentConversationId || undefined
        });

        // Clear selected options after sending
        clearSelectedOptions();
    },

    handleQuickAction: async (action) => {
        const { sendMessage } = get();
        await sendMessage(action === 'Accept' ? 'Accept' : `Select option ${action}`);
    },

    toggleOption: (option) => {
        set((state) => {
            const isSelected = state.selectedOptions.includes(option);
            return {
                selectedOptions: isSelected
                    ? state.selectedOptions.filter(o => o !== option)
                    : [...state.selectedOptions, option]
            };
        });
    },

    clearSelectedOptions: () => set({ selectedOptions: [] })
}));
