import * as wanakana from 'wanakana';

/**
 * Konvertiert Romanji zu Hiragana
 */
export function romanjiToHiragana(romanji: string): string {
  try {
    return wanakana.toHiragana(romanji);
  } catch (error) {
    console.error('Error converting romanji to hiragana:', error);
    return romanji;
  }
}

/**
 * Konvertiert Romanji zu Katakana
 */
export function romanjiToKatakana(romanji: string): string {
  try {
    return wanakana.toKatakana(romanji);
  } catch (error) {
    console.error('Error converting romanji to katakana:', error);
    return romanji;
  }
}

/**
 * Konvertiert Hiragana zu Romanji
 */
export function hiraganaToRomanji(hiragana: string): string {
  try {
    return wanakana.toRomaji(hiragana);
  } catch (error) {
    console.error('Error converting hiragana to romanji:', error);
    return hiragana;
  }
}

/**
 * Konvertiert Katakana zu Romanji
 */
export function katakanaToRomanji(katakana: string): string {
  try {
    return wanakana.toRomaji(katakana);
  } catch (error) {
    console.error('Error converting katakana to romanji:', error);
    return katakana;
  }
}

/**
 * Prüft, ob ein Text gültiges Romanji ist
 */
export function isValidRomanji(text: string): boolean {
  // Einfache Regex für Romanji (römische Buchstaben, Zahlen, Leerzeichen, Bindestriche)
  const romanjiRegex = /^[a-zA-Z0-9\s\-']+$/;
  return romanjiRegex.test(text);
}

/**
 * Prüft, ob ein Text Hiragana ist
 */
export function isHiragana(text: string): boolean {
  try {
    return wanakana.isHiragana(text);
  } catch (error) {
    return false;
  }
}

/**
 * Prüft, ob ein Text Katakana ist
 */
export function isKatakana(text: string): boolean {
  try {
    return wanakana.isKatakana(text);
  } catch (error) {
    return false;
  }
}

/**
 * Prüft, ob ein Text Kana (Hiragana oder Katakana) ist
 */
export function isKana(text: string): boolean {
  try {
    return wanakana.isKana(text);
  } catch (error) {
    return false;
  }
}

/**
 * Prüft, ob ein Text japanisch ist (Kana oder Kanji)
 */
export function isJapanese(text: string): boolean {
  try {
    return wanakana.isJapanese(text);
  } catch (error) {
    return false;
  }
}

/**
 * Tokenisiert japanischen Text
 */
export function tokenize(text: string): string[] {
  try {
    return wanakana.tokenize(text);
  } catch (error) {
    console.error('Error tokenizing text:', error);
    return [text];
  }
}

/**
 * Konvertiert gemischten Text zu Hiragana
 */
export function toHiragana(text: string): string {
  try {
    return wanakana.toHiragana(text);
  } catch (error) {
    console.error('Error converting to hiragana:', error);
    return text;
  }
}

/**
 * Konvertiert gemischten Text zu Katakana
 */
export function toKatakana(text: string): string {
  try {
    return wanakana.toKatakana(text);
  } catch (error) {
    console.error('Error converting to katakana:', error);
    return text;
  }
}

/**
 * Konvertiert gemischten Text zu Romanji
 */
export function toRomanji(text: string): string {
  try {
    return wanakana.toRomaji(text);
  } catch (error) {
    console.error('Error converting to romanji:', error);
    return text;
  }
}

/**
 * Prüft, ob eine Eingabe korrekt ist (für Write-Modus)
 */
export function checkAnswer(userInput: string, correctAnswer: string, inputType: 'romanji' | 'kana'): boolean {
  try {
    const normalizedUserInput = userInput.trim().toLowerCase();
    const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();

    // Direkter Vergleich
    if (normalizedUserInput === normalizedCorrectAnswer) {
      return true;
    }

    // Konvertierung und Vergleich
    if (inputType === 'romanji') {
      // Benutzer gibt Romanji ein, vergleiche mit korrektem Romanji
      return normalizedUserInput === normalizedCorrectAnswer;
    } else {
      // Benutzer gibt Kana ein, konvertiere beide zu Romanji und vergleiche
      const userRomanji = toRomanji(normalizedUserInput);
      const correctRomanji = toRomanji(normalizedCorrectAnswer);
      return userRomanji.toLowerCase() === correctRomanji.toLowerCase();
    }
  } catch (error) {
    console.error('Error checking answer:', error);
    return false;
  }
}

/**
 * Formatiert japanischen Text für die Anzeige
 */
export function formatJapaneseText(text: string, showKanji: boolean = true): string {
  if (!showKanji) {
    // Entferne Kanji und behalte nur Kana
    return text.replace(/[\u4e00-\u9faf]/g, '');
  }
  return text;
} 