declare module 'wanakana' {
  export function toHiragana(input: string): string;
  export function toKatakana(input: string): string;
  export function toRomaji(input: string): string;
  export function toKana(input: string): string;
  export function isHiragana(input: string): boolean;
  export function isKatakana(input: string): boolean;
  export function isKana(input: string): boolean;
  export function isJapanese(input: string): boolean;
  export function tokenize(input: string): string[];
  export function stripOkurigana(input: string): string;
  export function convertKanaCase(input: string, toCase: 'hiragana' | 'katakana'): string;
} 