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

// System state types for terminal status system
export type SystemPhase =
  | 'idle'
  | 'connecting'
  | 'sending'
  | 'searching'
  | 'inferring'
  | 'streaming'
  | 'complete'
  | 'error';

export interface SystemStatus {
  id: string;
  phase: SystemPhase;
  message: string;
  details?: string;
  timestamp: number;
  progress?: number; // 0-100
  metadata?: Record<string, string | number>;
}

export type TerminalLog = SystemStatus;
