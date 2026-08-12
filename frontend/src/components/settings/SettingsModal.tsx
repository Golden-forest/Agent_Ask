import React, { useState, useCallback } from 'react';
import { Eye, EyeSlash, X, ArrowSquareOut, CircleNotch, Lightning } from 'phosphor-react';
import { useSettingsStore } from '../../store/settingsStore';
import { PROVIDER_LIST, getProvider } from '../../services/providers';
import { testConnection } from '../../services/llm';
import type { ProviderId } from '../../types';
import toast from 'react-hot-toast';
import { useT } from '../../i18n';
import type { Language } from '../../i18n/types';

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
  const setEnableSearch = useSettingsStore((s) => s.setEnableSearch);
  const setEnableVision = useSettingsStore((s) => s.setEnableVision);
  const setModalOpen = useSettingsStore((s) => s.setModalOpen);
  const language = useSettingsStore((s) => s.settings.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const { t } = useT();

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
              {forceOpen ? t('settings.titleFirstUse') : t('settings.title')}
            </h2>
            {!forceOpen && (
              <p className="text-xs text-textSecondary mt-0.5">{t('settings.subtitle')}</p>
            )}
          </div>
          {!forceOpen && (
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-textSecondary hover:text-text hover:bg-surfaceHover transition-colors"
              title={t('settings.close')}
            >
              <X weight="bold" size={16} />
            </button>
          )}
        </div>

        {/* ========== Body ========== */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* ----- 语言选择 ----- */}
          <div className="space-y-2">
            <label htmlFor="language-select" className="block text-sm font-medium text-text">
              {t('settings.languageLabel')}
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* ----- 供应商选择 ----- */}
          <div className="space-y-2">
            <label htmlFor="provider-select" className="block text-sm font-medium text-text">
              {t('settings.providerLabel')}
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
              {t('settings.modelLabel')}
            </label>
            {isCustom ? (
              <input
                id="model-input"
                type="text"
                value={settings.customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder={t('settings.modelPlaceholder')}
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
                {t('settings.baseUrlLabel')}
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
                {t('settings.baseUrlHint')} <code className="px-1 py-0.5 bg-surface rounded text-text">/v1/chat/completions</code>
              </p>
            </div>
          )}

          {/* ----- API Key ----- */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="apikey-input" className="block text-sm font-medium text-text">
                {t('settings.apiKeyLabel')}
              </label>
              {currentProvider.apiKeyUrl && (
                <a
                  href={currentProvider.apiKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-text hover:text-white underline underline-offset-2 transition-colors"
                >
                  {t('settings.getApiKey')}
                  <ArrowSquareOut weight="thin" size={14} />
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
                title={showApiKey ? t('settings.hideApiKey') : t('settings.showApiKey')}
                tabIndex={-1}
              >
                {showApiKey ? <EyeSlash weight="thin" size={18} /> : <Eye weight="thin" size={18} />}
              </button>
            </div>
          </div>

          {/* ----- 高级功能开关 ----- */}
          <div className="space-y-3 pt-2 border-t border-border/30">
            <div className="text-sm font-medium text-text">{t('settings.advanced')}</div>

            {/* 网络搜索开关 */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex-1">
                <div className="text-sm text-text group-hover:text-white transition-colors">
                  {t('settings.enableSearch')}
                </div>
                <div className="text-xs text-textSecondary mt-0.5">
                  {settings.provider === 'deepseek' || settings.provider === 'qwen'
                    ? t('settings.searchSupported')
                    : t('settings.searchUnsupported')}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.enableSearch}
                disabled={settings.provider !== 'deepseek' && settings.provider !== 'qwen'}
                onClick={() => setEnableSearch(!settings.enableSearch)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  settings.enableSearch ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableSearch ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            {/* 多模态视觉开关 */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex-1">
                <div className="text-sm text-text group-hover:text-white transition-colors">
                  {t('settings.enableVision')}
                </div>
                <div className="text-xs text-textSecondary mt-0.5">
                  {t('settings.visionHint')}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.enableVision}
                onClick={() => setEnableVision(!settings.enableVision)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableVision ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableVision ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
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
            {isTesting ? <CircleNotch weight="bold" size={16} className="animate-spin" /> : <Lightning weight="thin" size={16} />}
            {isTesting ? t('settings.testing') : t('settings.testConnection')}
          </button>

          {/* Cancel / Save */}
          <div className="flex items-center gap-2">
            {!forceOpen && (
              <button
                onClick={handleClose}
                className="bg-transparent border border-border text-textSecondary hover:text-text hover:bg-surfaceHover rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                {t('settings.cancel')}
              </button>
            )}
            <button
              onClick={handleSave}
              className="bg-primary text-background hover:bg-primaryHover rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {t('settings.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
