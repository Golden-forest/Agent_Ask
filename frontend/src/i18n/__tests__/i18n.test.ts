import { describe, it, expect } from 'vitest';
import { interpolate, detectDefaultLanguage } from '../index';
import zh from '../zh';
import en from '../en';

describe('interpolate', () => {
  it('returns template unchanged when no vars', () => {
    expect(interpolate('hello world')).toBe('hello world');
  });
  it('replaces {{name}} with provided var', () => {
    expect(interpolate('hi {{name}}', { name: 'foo' })).toBe('hi foo');
  });
  it('replaces multiple vars', () => {
    expect(interpolate('{{a}} and {{b}}', { a: 'x', b: 'y' })).toBe('x and y');
  });
  it('leaves unknown placeholder intact', () => {
    expect(interpolate('hi {{missing}}', {})).toBe('hi {{missing}}');
  });
  it('coerces number vars to string', () => {
    expect(interpolate('count {{n}}', { n: 3 })).toBe('count 3');
  });
});

describe('detectDefaultLanguage', () => {
  it('returns zh for zh-CN', () => {
    expect(detectDefaultLanguage('zh-CN')).toBe('zh');
  });
  it('returns zh for zh-TW', () => {
    expect(detectDefaultLanguage('zh-TW')).toBe('zh');
  });
  it('returns en for en-US', () => {
    expect(detectDefaultLanguage('en-US')).toBe('en');
  });
  it('returns en for other languages like ja-JP', () => {
    expect(detectDefaultLanguage('ja-JP')).toBe('en');
  });
  it('returns en when navigator.language undefined', () => {
    expect(detectDefaultLanguage(undefined)).toBe('en');
  });
});

describe('translation table completeness', () => {
  const zhKeys = Object.keys(zh).sort();
  const enKeys = Object.keys(en).sort();
  it('zh and en have identical key sets', () => {
    expect(enKeys).toEqual(zhKeys);
  });
  it('tables are non-empty', () => {
    expect(zhKeys.length).toBeGreaterThan(0);
  });
});
