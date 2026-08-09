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

export interface AttachedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    content: string;
    status: 'pending' | 'parsing' | 'ready' | 'error';
    error?: string;
}

// ============ LLM Provider Types ============

export type ProviderId = 'deepseek' | 'openai' | 'qwen' | 'custom';

export interface ModelOption {
  id: string;
  name: string;
}

export interface Provider {
  id: ProviderId;
  name: string;
  baseUrl: string;
  apiKeyUrl: string;
  models: ModelOption[];
  defaultModel: string;
}

export interface LlmSettings {
  provider: ProviderId;
  apiKey: string;
  model: string;
  customBaseUrl: string;
  customModel: string;
}

// OpenAI API message format
export interface ApiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
