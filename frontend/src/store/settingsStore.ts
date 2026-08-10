import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LlmSettings, ProviderId } from '../types';
import { PROVIDERS } from '../services/providers';

const DEFAULT_SETTINGS: LlmSettings = {
  provider: 'deepseek',
  apiKey: '',
  model: PROVIDERS.deepseek.defaultModel,
  customBaseUrl: '',
  customModel: '',
  enableSearch: false,
  enableVision: false,
};

interface SettingsStore {
  settings: LlmSettings;
  isModalOpen: boolean;
  setProvider: (provider: ProviderId) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setCustomBaseUrl: (url: string) => void;
  setCustomModel: (model: string) => void;
  setEnableSearch: (enable: boolean) => void;
  setEnableVision: (enable: boolean) => void;
  setModalOpen: (open: boolean) => void;
  hasApiKey: () => boolean;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isModalOpen: false,

      setProvider: (provider) =>
        set((state) => ({
          settings: {
            ...state.settings,
            provider,
            model: PROVIDERS[provider].defaultModel,
          },
        })),

      setApiKey: (apiKey) =>
        set((state) => ({ settings: { ...state.settings, apiKey } })),

      setModel: (model) =>
        set((state) => ({ settings: { ...state.settings, model } })),

      setCustomBaseUrl: (customBaseUrl) =>
        set((state) => ({ settings: { ...state.settings, customBaseUrl } })),

      setCustomModel: (customModel) =>
        set((state) => ({ settings: { ...state.settings, customModel } })),

      setEnableSearch: (enableSearch) =>
        set((state) => ({ settings: { ...state.settings, enableSearch } })),

      setEnableVision: (enableVision) =>
        set((state) => ({ settings: { ...state.settings, enableVision } })),

      setModalOpen: (isModalOpen) => set({ isModalOpen }),

      hasApiKey: () => get().settings.apiKey.trim().length > 0,
    }),
    {
      name: 'agent_ask_settings',
      // 只持久化 settings，不持久化 isModalOpen
      partialize: (state) => ({ settings: state.settings }),
      // 读取容错
      merge: (persisted, current) => {
        const result = { ...current };
        if (persisted && typeof persisted === 'object') {
          const p = persisted as { settings?: Partial<LlmSettings> };
          if (p.settings) {
            // 字段缺失时用默认值填充
            result.settings = {
              ...DEFAULT_SETTINGS,
              ...p.settings,
            };
          }
        }
        return result;
      },
    }
  )
);
