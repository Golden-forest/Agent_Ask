import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, X, ExternalLink, Loader2, Zap } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { PROVIDER_LIST, getProvider } from '../../services/providers';
import { testConnection } from '../../services/llm';
import type { ProviderId } from '../../types';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  forceOpen?: boolean; // 首启动时强制打开（不可关闭）
  onConfigured?: () => void; // forceOpen 模式下保存成功后的回调
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ forceOpen = false, onConfigured }) => {
  // store 状态与方法
  const settings = useSettingsStore((s) => s.settings);
  const isModalOpen = useSettingsStore((s) => s.isModalOpen);
  const setProvider = useSettingsStore((s) => s.setProvider);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const setModel = useSettingsStore((s) => s.setModel);
  const setCustomBaseUrl = useSettingsStore((s) => s.setCustomBaseUrl);
  const setCustomModel = useSettingsStore((s) => s.setCustomModel);
  const setModalOpen = useSettingsStore((s) => s.setModalOpen);

  // 本地 UI 状态
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // 当前供应商配置
  const currentProvider = getProvider(settings.provider);
  const isCustom = settings.provider === 'custom';

  // 决定弹窗是否显示：forceOpen 模式下始终显示；否则由 isModalOpen 控制
  const isVisible = forceOpen || isModalOpen;

  /**
   * 关闭弹窗（仅非 forceOpen 模式可用）
   */
  const handleClose = useCallback(() => {
    if (forceOpen) return;
    setModalOpen(false);
  }, [forceOpen, setModalOpen]);

  /**
   * 点击遮罩关闭
   */
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !forceOpen) {
        setModalOpen(false);
      }
    },
    [forceOpen, setModalOpen]
  );

  /**
   * 切换供应商 - store 内部会自动设置默认模型
   */
  const handleProviderChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const provider = e.target.value as ProviderId;
      setProvider(provider);
      // 自定义供应商没有预设 model，清空 customModel 提示用户输入
      if (provider === 'custom') {
        setCustomModel('');
        setCustomBaseUrl('');
      }
    },
    [setProvider, setCustomBaseUrl, setCustomModel]
  );

  /**
   * 测试连接
   */
  const handleTestConnection = useCallback(async () => {
    // 前置校验
    if (!settings.apiKey.trim()) {
      toast.error('请先填写 API Key', { duration: 3000 });
      return;
    }
    if (isCustom) {
      if (!settings.customBaseUrl.trim()) {
        toast.error('请填写 Base URL', { duration: 3000 });
        return;
      }
      if (!settings.customModel.trim()) {
        toast.error('请填写 Model ID', { duration: 3000 });
        return;
      }
    }

    setIsTesting(true);
    const testToastId = toast.loading('正在测试连接...', { duration: Infinity });
    try {
      const result = await testConnection(settings);
      toast.dismiss(testToastId);
      if (result.success) {
        toast.success(`连接成功 - ${result.message}`, {
          duration: 4000,
          style: {
            background: '#1A1D24',
            color: '#F4F4F5',
            border: '1px solid #3F3F46',
          },
        });
      } else {
        toast.error(`连接失败 - ${result.message}`, {
          duration: 5000,
          style: {
            background: '#1A1D24',
            color: '#F4F4F5',
            border: '1px solid #52525B',
          },
        });
      }
    } catch (err) {
      toast.dismiss(testToastId);
      toast.error(`连接异常 - ${err instanceof Error ? err.message : '未知错误'}`, {
        duration: 5000,
        style: {
          background: '#1A1D24',
          color: '#F4F4F5',
          border: '1px solid #52525B',
        },
      });
    } finally {
      setIsTesting(false);
    }
  }, [settings, isCustom]);

  /**
   * 保存设置
   */
  const handleSave = useCallback(() => {
    // forceOpen 模式下必须填写 API Key 才允许保存
    if (forceOpen && !settings.apiKey.trim()) {
      toast.error('请先填写 API Key', { duration: 3000 });
      return;
    }
    // 自定义模式下额外校验
    if (isCustom) {
      if (!settings.customBaseUrl.trim()) {
        toast.error('请填写 Base URL', { duration: 3000 });
        return;
      }
      if (!settings.customModel.trim()) {
        toast.error('请填写 Model ID', { duration: 3000 });
        return;
      }
    }

    // settings 已通过 zustand persist 自动持久化
    toast.success('设置已保存', {
      duration: 2000,
      style: {
        background: '#1A1D24',
        color: '#F4F4F5',
        border: '1px solid #3F3F46',
      },
    });

    if (forceOpen && onConfigured) {
      // 首启动模式：通过回调通知父组件取消强制状态
      onConfigured();
    } else {
      setModalOpen(false);
    }
  }, [forceOpen, isCustom, settings.apiKey, settings.customBaseUrl, settings.customModel, setModalOpen, onConfigured]);

  // 不显示时返回 null
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="max-w-lg w-full bg-background border border-border rounded-2xl shadow-2xl shadow-black/50 animate-slide-up max-h-[90vh] flex flex-col">
        {/* ========== Header ========== */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-text">
              {forceOpen ? '首次使用，请配置 LLM 供应商和 API Key' : '设置'}
            </h2>
            {!forceOpen && (
              <p className="text-xs text-textSecondary mt-0.5">配置 LLM 供应商和 API Key</p>
            )}
          </div>
          {!forceOpen && (
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-textSecondary hover:text-text hover:bg-surfaceHover transition-colors"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ========== Body ========== */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* ----- 供应商选择 ----- */}
          <div className="space-y-2">
            <label htmlFor="provider-select" className="block text-sm font-medium text-text">
              LLM 供应商
            </label>
            <select
              id="provider-select"
              value={settings.provider}
              onChange={handleProviderChange}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
            >
              {PROVIDER_LIST.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* ----- 模型选择 ----- */}
          <div className="space-y-2">
            <label htmlFor="model-select" className="block text-sm font-medium text-text">
              模型
            </label>
            {isCustom ? (
              <input
                id="model-input"
                type="text"
                value={settings.customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="例如: deepseek-v4-flash, gpt-4o"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text placeholder-textSecondary focus:outline-none focus:border-white/30 transition-colors"
              />
            ) : (
              <select
                id="model-select"
                value={settings.model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
              >
                {currentProvider.models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.id})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ----- 自定义模式: Base URL ----- */}
          {isCustom && (
            <div className="space-y-2">
              <label htmlFor="baseurl-input" className="block text-sm font-medium text-text">
                Base URL
              </label>
              <input
                id="baseurl-input"
                type="text"
                value={settings.customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="https://your-api-endpoint.com"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text placeholder-textSecondary focus:outline-none focus:border-white/30 transition-colors"
              />
              <p className="text-xs text-textSecondary">
                需兼容 OpenAI API 格式，路径会自动追加 <code className="px-1 py-0.5 bg-surface rounded text-text">/v1/chat/completions</code>
              </p>
            </div>
          )}

          {/* ----- API Key ----- */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="apikey-input" className="block text-sm font-medium text-text">
                API Key
              </label>
              {currentProvider.apiKeyUrl && (
                <a
                  href={currentProvider.apiKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-text hover:text-white underline underline-offset-2 transition-colors"
                >
                  获取 Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="relative">
              <input
                id="apikey-input"
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 pr-10 text-text placeholder-textSecondary focus:outline-none focus:border-white/30 transition-colors font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-textSecondary hover:text-text hover:bg-surfaceHover transition-colors"
                title={showApiKey ? '隐藏' : '显示'}
                tabIndex={-1}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* ----- 当前生效信息（只读提示） ----- */}
          {!isCustom && (
            <div className="text-xs text-textSecondary bg-surface/50 border border-border/50 rounded-lg px-3 py-2 space-y-1">
              <div>
                <span className="text-textSecondary">Endpoint: </span>
                <span className="text-text font-mono">{currentProvider.baseUrl}/v1/chat/completions</span>
              </div>
            </div>
          )}
        </div>

        {/* ========== Footer / Actions ========== */}
        <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between gap-3">
          {/* 测试连接 */}
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-2 bg-transparent border border-border text-textSecondary hover:text-text hover:border-white/20 hover:bg-surfaceHover rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isTesting ? '测试中...' : '测试连接'}
          </button>

          {/* Cancel / Save */}
          <div className="flex items-center gap-2">
            {!forceOpen && (
              <button
                onClick={handleClose}
                className="bg-transparent border border-border text-textSecondary hover:text-text hover:bg-surfaceHover rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                取消
              </button>
            )}
            <button
              onClick={handleSave}
              className="bg-primary text-background hover:bg-primaryHover rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
