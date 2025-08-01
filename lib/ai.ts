import { GeneratedCard } from '@/types';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface AIResponse {
  success: boolean;
  data?: GeneratedCard[];
  error?: string;
}

/**
 * Generiert japanische Vokabeln für ein gegebenes Thema
 */
export async function generateJapaneseVocabulary(topic: string): Promise<AIResponse> {
  if (!GROQ_API_KEY) {
    return {
      success: false,
      error: 'Groq API Key nicht konfiguriert'
    };
  }

  // Prüfe Online-Status
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      error: 'Keine Internetverbindung. AI-Funktion nur online verfügbar.'
    };
  }

  const prompt = `Generiere 10 deutsche Wörter zum Thema "${topic}" mit ihren japanischen Übersetzungen.

Antworte nur mit einem JSON-Array in folgendem Format:
[
  {
    "german": "deutsches Wort",
    "romanji": "japanische Aussprache in lateinischen Buchstaben",
    "kana": "Hiragana oder Katakana",
    "kanji": "Kanji (falls vorhanden, sonst null)"
  }
]

Wichtige Regeln:
- Verwende Hiragana für japanische Wörter
- Verwende Katakana für ausländische Wörter
- Romanji sollte die korrekte japanische Aussprache widerspiegeln
- Kanji nur angeben, wenn das Wort tatsächlich Kanji verwendet
- Antworte nur mit dem JSON, keine zusätzlichen Erklärungen`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Keine Antwort von der AI erhalten');
    }

    // Versuche JSON zu parsen
    let parsedCards: GeneratedCard[];
    try {
      // Entferne mögliche Markdown-Code-Blöcke
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedCards = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content:', content);
      throw new Error('Ungültiges JSON-Format von der AI erhalten');
    }

    // Validiere die Struktur
    if (!Array.isArray(parsedCards)) {
      throw new Error('AI-Antwort ist kein Array');
    }

    // Validiere jedes Element
    const validatedCards: GeneratedCard[] = parsedCards
      .filter(card => 
        card.german && 
        card.romanji && 
        card.kana &&
        typeof card.german === 'string' &&
        typeof card.romanji === 'string' &&
        typeof card.kana === 'string'
      )
      .map(card => ({
        german: card.german.trim(),
        romanji: card.romanji.trim(),
        kana: card.kana.trim(),
        kanji: card.kanji?.trim() || undefined
      }));

    if (validatedCards.length === 0) {
      throw new Error('Keine gültigen Karten in der AI-Antwort gefunden');
    }

    return {
      success: true,
      data: validatedCards
    };

  } catch (error) {
    console.error('AI Generation Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler bei der AI-Generierung'
    };
  }
}

/**
 * Verbessert die Romanji-Aussprache basierend auf der Kana
 */
export function improveRomanji(kana: string, romanji: string): string {
  // Einfache Verbesserungen für häufige Fälle
  let improved = romanji.toLowerCase();
  
  // Entferne doppelte Vokale (außer bei langen Vokalen)
  improved = improved.replace(/([aeiou])\1+/g, '$1');
  
  // Korrigiere häufige Fehler
  improved = improved
    .replace(/tsu/g, 'tsu')
    .replace(/shi/g, 'shi')
    .replace(/chi/g, 'chi')
    .replace(/ji/g, 'ji')
    .replace(/zu/g, 'zu')
    .replace(/fu/g, 'fu');
  
  return improved;
}

/**
 * Prüft, ob ein Wort Kanji verwendet
 */
export function hasKanji(text: string): boolean {
  const kanjiRegex = /[\u4e00-\u9faf]/;
  return kanjiRegex.test(text);
}

/**
 * Prüft, ob ein Wort nur Hiragana enthält
 */
export function isHiragana(text: string): boolean {
  const hiraganaRegex = /^[\u3040-\u309f]+$/;
  return hiraganaRegex.test(text);
}

/**
 * Prüft, ob ein Wort nur Katakana enthält
 */
export function isKatakana(text: string): boolean {
  const katakanaRegex = /^[\u30a0-\u30ff]+$/;
  return katakanaRegex.test(text);
} 