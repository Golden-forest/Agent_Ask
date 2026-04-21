import { create } from 'zustand';
import type { ChatMessage, QuickActionType, SystemStatus, SystemPhase } from '../types';
import { socketService } from '../services/socket';
import type { AttachedFile } from '../types';
import { extractText } from '../services/fileParser';

interface ChatStore {
    messages: ChatMessage[];
    isLoading: boolean;
    isSearching: boolean;
    input: string;
    currentConversationId: string | null;
    selectedOptions: string[];
    systemStatus: SystemStatus[];
    currentPhase: SystemPhase;
    showTerminalLog: boolean;
    attachedFiles: AttachedFile[];
    _socketInitialized: boolean;
    addFile: (file: File) => Promise<void>;
    removeFile: (fileId: string) => void;
    clearFiles: () => void;
    setInput: (input: string) => void;
    addMessage: (message: ChatMessage) => void;
    setLoading: (loading: boolean) => void;
    setSearching: (searching: boolean) => void;
    clearChat: () => void;
    newConversation: () => void;
    sendMessage: (content: string) => Promise<void>;
    handleQuickAction: (action: QuickActionType) => Promise<void>;
    initSocket: () => void;
    toggleOption: (option: string) => void;
    clearSelectedOptions: () => void;
    addSystemStatus: (status: Omit<SystemStatus, 'id' | 'timestamp'>) => void;
    setPhase: (phase: SystemPhase) => void;
    clearSystemStatus: () => void;
    toggleTerminalLog: () => void;
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
    isSearching: false,
    input: '',
    currentConversationId: null,
    selectedOptions: [],
    systemStatus: [],
    currentPhase: 'idle',
    showTerminalLog: true,
    attachedFiles: [],
    _socketInitialized: false,

    setInput: (input) => set({ input }),

    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

    setLoading: (loading) => set({ isLoading: loading }),

    setSearching: (searching) => set({ isSearching: searching }),

    clearChat: () => set({ messages: [], currentConversationId: null }),

    newConversation: () => {
        socketService.disconnect();
        set({
            messages: [
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: 'Hello! I am agent_ask. Please tell me your requirements, and I will help you clarify the details.',
                    timestamp: new Date(),
                }
            ],
            currentConversationId: null,
            selectedOptions: [],
            input: '',
            isLoading: false,
            isSearching: false,
            attachedFiles: [],
            _socketInitialized: false,
        });
    },

    initSocket: () => {
        const { addSystemStatus, setPhase } = get();

        // Skip if already initialized
        if (get()._socketInitialized) return;

        socketService.connect();
        get()._socketInitialized = true;

        // Add connection status
        addSystemStatus({
            phase: 'connecting',
            message: '[CONNECT] → Establishing secure connection...',
            details: 'Host: localhost:8000'
        });

        socketService.on('connect', () => {
            addSystemStatus({
                phase: 'complete',
                message: '[✓] Connection established',
                details: '12ms',
                metadata: { latency: 12 }
            });
            setPhase('idle');
        });

        socketService.on('stream_chunk', (data: { content: string; conversation_id: string }) => {
            // Update streaming status on first chunk
            if (get().currentPhase !== 'streaming') {
                addSystemStatus({
                    phase: 'streaming',
                    message: '[STREAM] Receiving AI response...',
                });
                setPhase('streaming');
            }

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

            // Set phase to complete after streaming finishes
            setPhase('complete');
        });

        socketService.on('search_status', (data: { status: 'searching' | 'completed' | 'error'; info?: string; error?: string }) => {
            const { setSearching } = get();

            if (data.status === 'searching') {
                addSystemStatus({
                    phase: 'searching',
                    message: '[SEARCH] → Querying knowledge graph...',
                });
                setSearching(true);
                setPhase('searching');
            } else if (data.status === 'completed') {
                addSystemStatus({
                    phase: 'complete',
                    message: '[✓] Search complete',
                    details: `${data.info?.length || 0} bytes retrieved`,
                });
                setSearching(false);
            } else if (data.status === 'error') {
                addSystemStatus({
                    phase: 'error',
                    message: '[!] Search failed',
                    details: data.error,
                });
                setSearching(false);
            }

            console.log('Search status:', data);
        });

        socketService.on('error', (data: { message: string }) => {
            console.error('Socket error:', data);
            addSystemStatus({
                phase: 'error',
                message: '[!] Socket error',
                details: data.message,
            });
            set({ isLoading: false, isSearching: false });
            setPhase('error');
        });
    },

    sendMessage: async (content) => {
        const { addMessage, setLoading, messages, currentConversationId, initSocket, selectedOptions, clearSelectedOptions, addSystemStatus, setPhase, attachedFiles, clearFiles } = get();
        if (!content.trim() && selectedOptions.length === 0 && attachedFiles.length === 0) return;

        // Ensure socket is connected
        initSocket();

        // Reset states when sending new message
        set({ isSearching: false });

        // Build file content section
        let fileSection = '';
        const readyFiles = attachedFiles.filter(f => f.status === 'ready');
        if (readyFiles.length > 0) {
            const fileBlocks = readyFiles.map(f =>
                `--- 附件: ${f.name} ---\n${f.content}`
            );
            fileSection = '\n\n' + fileBlocks.join('\n\n');
        }

        // Build full message with selected options and file content
        let fullMessage = content;
        if (selectedOptions.length > 0) {
            fullMessage += `\n\nSelected options: ${selectedOptions.join('; ')}`;
        }
        fullMessage += fileSection;

        // Add sending status
        addSystemStatus({
            phase: 'sending',
            message: '[>] Transmitting payload...',
            details: `${fullMessage.length} bytes`,
        });
        setPhase('sending');

        // Add user message (display original text without file content)
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
            history: messages.map(m => ({
                role: m.role,
                content: m.content,
                id: m.id,
                timestamp: m.timestamp
            })),
            conversation_id: currentConversationId || undefined
        });

        // Add sent status
        addSystemStatus({
            phase: 'complete',
            message: '[✓] Sent successfully',
        });

        // Clear selected options and files after sending
        clearSelectedOptions();
        clearFiles();
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

    clearSelectedOptions: () => set({ selectedOptions: [] }),

    addFile: async (file: File) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Add file in pending state
        set((state) => ({
            attachedFiles: [...state.attachedFiles, {
                id,
                name: file.name,
                size: file.size,
                type: file.type,
                content: '',
                status: 'pending',
            }]
        }));

        try {
            // Update to parsing
            set((state) => ({
                attachedFiles: state.attachedFiles.map(f =>
                    f.id === id ? { ...f, status: 'parsing' as const } : f
                )
            }));

            const content = await extractText(file);

            // Update to ready
            set((state) => ({
                attachedFiles: state.attachedFiles.map(f =>
                    f.id === id ? { ...f, content, status: 'ready' as const } : f
                )
            }));
        } catch (err: any) {
            // Update to error
            set((state) => ({
                attachedFiles: state.attachedFiles.map(f =>
                    f.id === id ? { ...f, status: 'error' as const, error: err.message } : f
                )
            }));
        }
    },

    removeFile: (fileId: string) => {
        set((state) => ({
            attachedFiles: state.attachedFiles.filter(f => f.id !== fileId)
        }));
    },

    clearFiles: () => set({ attachedFiles: [] }),

    addSystemStatus: (status) => {
        const newStatus: SystemStatus = {
            ...status,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };
        set((state) => ({
            systemStatus: [...state.systemStatus, newStatus]
        }));
    },

    setPhase: (phase) => set({ currentPhase: phase }),

    clearSystemStatus: () => set({ systemStatus: [] }),

    toggleTerminalLog: () => set((state) => ({ showTerminalLog: !state.showTerminalLog })),
}));
