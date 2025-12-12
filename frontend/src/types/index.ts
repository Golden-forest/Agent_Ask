export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    searchInfo?: string;
    options?: string[]; // A/B/C/D options
    isStreaming?: boolean;
}

export type QuickActionType = 'A' | 'B' | 'C' | 'D' | 'Accept';
