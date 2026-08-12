import type { Provider, ProviderId } from '../types';

export const PROVIDERS: Record<ProviderId, Provider> = {
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    models: [
      { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' },
      { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro' },
    ],
    defaultModel: 'deepseek-v4-flash',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol' },
      { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra' },
      { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna' },
      { id: 'gpt-5.5', name: 'GPT-5.5' },
      { id: 'gpt-5', name: 'GPT-5' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    ],
    defaultModel: 'gpt-5.6-luna',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    baseUrl: 'https://gateway.ai-yyds.com/v1',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-opus-5', name: 'Claude Opus 5' },
      { id: 'claude-sonnet-5', name: 'Claude Sonnet 5' },
      { id: 'claude-opus-4-8', name: 'Claude Opus 4.8' },
      { id: 'claude-opus-4-7', name: 'Claude Opus 4.7' },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
    ],
    defaultModel: 'claude-sonnet-5',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash' },
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
      { id: 'gemini-3-pro', name: 'Gemini 3 Pro' },
      { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
    ],
    defaultModel: 'gemini-3.6-flash',
  },
  qwen: {
    id: 'qwen',
    name: 'Qwen',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode',
    apiKeyUrl: 'https://dashscope.console.aliyun.com/apiKey',
    models: [
      { id: 'qwen-3.6-plus', name: 'Qwen 3.6-Plus' },
      { id: 'qwen3-235b-a22b', name: 'Qwen3-235B' },
      { id: 'qwen3-30b-a3b', name: 'Qwen3-30B' },
      { id: 'qwen-max', name: 'Qwen Max' },
      { id: 'qwen-plus', name: 'Qwen Plus' },
      { id: 'qwen-turbo', name: 'Qwen Turbo' },
      { id: 'qwq-32b', name: 'QwQ-32B' },
    ],
    defaultModel: 'qwen-3.6-plus',
  },
  custom: {
    id: 'custom',
    name: 'Custom (OpenAI Compatible)',
    baseUrl: '',
    apiKeyUrl: '',
    models: [],
    defaultModel: '',
  },
};

export const PROVIDER_LIST = Object.values(PROVIDERS);

export function getProvider(id: ProviderId): Provider {
  return PROVIDERS[id];
}

/**
 * 根据 settings 获取实际使用的 baseUrl
 */
export function resolveBaseUrl(settings: { provider: ProviderId; customBaseUrl: string }): string {
  if (settings.provider === 'custom') {
    return settings.customBaseUrl;
  }
  return PROVIDERS[settings.provider].baseUrl;
}

/**
 * 根据 settings 获取实际使用的 model
 */
export function resolveModel(settings: { provider: ProviderId; model: string; customModel: string }): string {
  if (settings.provider === 'custom') {
    return settings.customModel;
  }
  return settings.model;
}
