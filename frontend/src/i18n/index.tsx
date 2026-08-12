import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import zh from './zh';
import en from './en';
import type { Language, TranslationKey } from './types';
import { useSettingsStore } from '../store/settingsStore';

const DICTS: Record<Language, typeof zh> = { zh, en };

export function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) =>
    vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`
  );
}

export function detectDefaultLanguage(navLang?: string): Language {
  if (navLang && navLang.toLowerCase().startsWith('zh')) return 'zh';
  return 'en';
}

interface I18nContextValue {
  lang: Language;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const language = useSettingsStore((s) => s.settings.language);
  const lang: Language = language;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const dict = DICTS[lang] ?? DICTS.en;
      const template = dict[key];
      return interpolate(template, vars);
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useT must be used within an I18nProvider');
  }
  return ctx;
}
