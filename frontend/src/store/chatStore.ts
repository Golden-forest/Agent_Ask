import { create } from 'zustand';
import type { ChatMessage, QuickActionType, SystemStatus, SystemPhase } from '../types';
import { streamChat, LlmError } from '../services/llm';
import { buildApiMessages } from '../services/promptTemplate';
import { useSettingsStore } from './settingsStore';
import toast from 'react-hot-toast';
import type { AttachedFile } from '../types';

interface ChatStore {
    messages: ChatMessage[];
    isLoading: boolean;
    input: string;
    currentConversationId: string | null;
    selectedOptions: string[];
    systemStatus: SystemStatus[];
    currentPhase: SystemPhase;
    showTerminalLog: boolean;
    attachedFiles: AttachedFile[];
    isStreaming: boolean;
    abortController: AbortController | null;
    addFile: (file: File) => Promise<void>;
    removeFile: (fileId: string) => void;
    clearFiles: () => void;
    setInput: (input: string) => void;
    addMessage: (message: ChatMessage) => void;
    setLoading: (loading: boolean) => void;
    clearChat: () => void;
    newConversation: () => void;
    sendMessage: (content: string) => Promise<void>;
    handleQuickAction: (action: QuickActionType) => Promise<void>;
    stopStreaming: () => void;
    toggleOption: (option: string) => void;
    clearSelectedOptions: () => void;
    addSystemStatus: (status: Omit<SystemStatus, 'id' | 'timestamp'>) => void;
    setPhase: (phase: SystemPhase) => void;
    clearSystemStatus: () => void;
    toggleTerminalLog: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: [],  // ✅ 移除初始欢迎消息，显示 Bento Grid 空状态
    isLoading: false,
    input: '',
    currentConversationId: null,
    selectedOptions: [],
    systemStatus: [],
    currentPhase: 'idle',
    showTerminalLog: true,
    attachedFiles: [],
    isStreaming: false,
    abortController: null,

    setInput: (input) => set({ input }),

    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

    setLoading: (loading) => set({ isLoading: loading }),

    clearChat: () => set({ messages: [], currentConversationId: null }),

    newConversation: () => {
        // 如果正在流式输出，先中止
        const { abortController } = get();
        if (abortController) {
            abortController.abort();
        }
        set({
            messages: [],  // ✅ 移除初始欢迎消息，显示 Bento Grid 空状态
            currentConversationId: null,
            selectedOptions: [],
            input: '',
            isLoading: false,
            isStreaming: false,
            abortController: null,
            attachedFiles: [],
        });
    },

    sendMessage: async (content) => {
        const { addMessage, setLoading, messages, selectedOptions, clearSelectedOptions, addSystemStatus, setPhase, attachedFiles, clearFiles } = get();
        if (!content.trim() && selectedOptions.length === 0 && attachedFiles.length === 0) return;

        // 检查 API Key
        const settings = useSettingsStore.getState().settings;
        if (!settings.apiKey.trim()) {
            toast.error('未配置 API Key，请先前往设置');
            useSettingsStore.getState().setModalOpen(true);
            return;
        }

        // 检查网络
        if (!navigator.onLine) {
            toast.error('网络不可用');
            return;
        }

        // Build file content section
        let fileSection = '';
        const readyFiles = attachedFiles.filter(f => f.status === 'ready');
        if (readyFiles.length > 0) {
            const fileBlocks = readyFiles.map(f =>
                `--- 附件: ${f.name} ---\n${f.content}`
            );
            fileSection = '\n\n' + fileBlocks.join('\n\n');
        }

        // Build full message
        let fullMessage = content;
        if (selectedOptions.length > 0 && content.trim().toLowerCase() !== 'accept') {
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

        // Create assistant message placeholder for streaming
        const assistantMsg: ChatMessage = {
            id: `${Date.now()}-assistant`,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true,
        };
        addMessage(assistantMsg);

        // Clear selected options and files
        clearSelectedOptions();
        clearFiles();

        // Create AbortController
        const ac = new AbortController();
        set({ abortController: ac, isStreaming: true });

        try {
            // Build API messages
            const apiMessages = buildApiMessages(fullMessage, messages);

            // Stream response
            let firstChunk = true;
            let receivedContent = '';

            for await (const chunk of streamChat(apiMessages, settings, ac.signal)) {
                if (firstChunk) {
                    firstChunk = false;
                    addSystemStatus({
                        phase: 'streaming',
                        message: '[STREAM] Receiving AI response...',
                    });
                    setPhase('streaming');
                }
                receivedContent += chunk;

                // Append chunk to assistant message
                set((state) => {
                    const msgs = [...state.messages];
                    const lastIdx = msgs.length - 1;
                    if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant' && msgs[lastIdx].isStreaming) {
                        msgs[lastIdx] = { ...msgs[lastIdx], content: receivedContent };
                    }
                    return { messages: msgs };
                });
            }

            // Streaming complete
            set((state) => {
                const msgs = [...state.messages];
                const lastIdx = msgs.length - 1;
                if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
                    msgs[lastIdx] = {
                        ...msgs[lastIdx],
                        content: receivedContent || '未收到有效回复，请重试',
                        isStreaming: false,
                    };
                }
                return { messages: msgs };
            });

            addSystemStatus({
                phase: 'complete',
                message: '[✓] Response complete',
            });
            setPhase('complete');

        } catch (err: any) {
            if (err instanceof LlmError) {
                // Handle known errors
                switch (err.code) {
                    case 'aborted':
                        // User aborted - keep partial content, mark as not streaming
                        set((state) => {
                            const msgs = [...state.messages];
                            const lastIdx = msgs.length - 1;
                            if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
                                msgs[lastIdx] = {
                                    ...msgs[lastIdx],
                                    content: msgs[lastIdx].content || '请求已取消',
                                    isStreaming: false,
                                };
                            }
                            return { messages: msgs };
                        });
                        addSystemStatus({
                            phase: 'complete',
                            message: '[!] Request cancelled by user',
                        });
                        break;

                    case 'auth':
                        toast.error('API Key 无效');
                        useSettingsStore.getState().setModalOpen(true);
                        // Remove the empty assistant message
                        set((state) => ({
                            messages: state.messages.filter(m => m.id !== assistantMsg.id)
                        }));
                        break;

                    case 'forbidden':
                        toast.error('Key 无权限访问该模型');
                        set((state) => ({
                            messages: state.messages.filter(m => m.id !== assistantMsg.id)
                        }));
                        break;

                    case 'rate_limit':
                        toast.error('请求过于频繁，请稍后重试');
                        set((state) => ({
                            messages: state.messages.filter(m => m.id !== assistantMsg.id)
                        }));
                        break;

                    case 'server':
                        toast.error('服务暂时不可用');
                        set((state) => ({
                            messages: state.messages.filter(m => m.id !== assistantMsg.id)
                        }));
                        break;

                    case 'network':
                        toast.error('无法连接服务器');
                        set((state) => ({
                            messages: state.messages.filter(m => m.id !== assistantMsg.id)
                        }));
                        break;

                    default:
                        toast.error(err.message);
                        set((state) => ({
                            messages: state.messages.filter(m => m.id !== assistantMsg.id)
                        }));
                }
            } else {
                console.error('Unexpected error:', err);
                toast.error(`未知错误: ${err.message}`);
                set((state) => ({
                    messages: state.messages.filter(m => m.id !== assistantMsg.id)
                }));
            }

            setPhase('error');
        } finally {
            set({ isLoading: false, isStreaming: false, abortController: null });
        }
    },

    stopStreaming: () => {
        const { abortController } = get();
        if (abortController) {
            abortController.abort();
        }
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

            const { extractText } = await import('../services/fileParser');
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
