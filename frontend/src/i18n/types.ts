import type zh from './zh';

export type Language = 'zh' | 'en';
export type TranslationDict = typeof zh;
export type TranslationKey = keyof TranslationDict;
