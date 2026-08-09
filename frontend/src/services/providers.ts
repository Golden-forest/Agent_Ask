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
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4.1', name: 'GPT-4.1' },
      { id: 'o3-mini', name: 'o3-mini' },
    ],
    defaultModel: 'gpt-4o-mini',
  },
  qwen: {
    id: 'qwen',
    name: '通义千问 (Qwen)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode',
    apiKeyUrl: 'https://dashscope.console.aliyun.com/apiKey',
    models: [
      { id: 'qwen-plus', name: 'Qwen Plus' },
      { id: 'qwen-max', name: 'Qwen Max' },
      { id: 'qwen-turbo', name: 'Qwen Turbo' },
      { id: 'qwq-32b', name: 'QwQ-32B' },
    ],
    defaultModel: 'qwen-plus',
  },
  custom: {
    id: 'custom',
    name: '自定义 (OpenAI 兼容)',
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
