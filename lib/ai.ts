import { GeneratedCard } from '@/types';

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
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
  console.log('Starting AI generation for topic:', topic);
  console.log('GROQ_API_KEY exists:', !!GROQ_API_KEY);
  
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY nicht gesetzt');
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

  const prompt = `Erstelle 10 deutsche Wörter zum Thema "${topic}" mit japanischen Übersetzungen.

Antworte NUR mit diesem JSON-Format, keine anderen Texte:

[
  {
    "german": "rot",
    "romanji": "aka", 
    "kana": "あか",
    "kanji": "赤"
  }
]

Regeln:
- Verwende Hiragana für japanische Wörter
- Verwende Katakana für ausländische Wörter  
- Kanji nur wenn vorhanden, sonst null
- Nur JSON, keine Erklärungen`;

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
      const errorText = await response.text();
      console.error('Groq API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Groq API Response:', data);
    
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('Keine content in AI response:', data);
      throw new Error('Keine Antwort von der AI erhalten');
    }

    // Versuche JSON zu parsen
    let parsedCards: GeneratedCard[];
    try {
      // Entferne mögliche Markdown-Code-Blöcke und andere Formatierungen
      let cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      // Entferne mögliche "Hier ist das JSON:" oder ähnliche Texte
      cleanContent = cleanContent.replace(/^[^{]*/, '');
      cleanContent = cleanContent.replace(/[^}]*$/, '');
      
      // Entferne Kommentare und zusätzliche Zeilen
      cleanContent = cleanContent.replace(/\/\/.*$/gm, '');
      cleanContent = cleanContent.replace(/\/\*[\s\S]*?\*\//g, '');
      
      console.log('Cleaned content:', cleanContent);
      
      parsedCards = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content:', content);
      
      // Fallback: Versuche das JSON zu reparieren
      try {
        const fixedContent = content.replace(/[^\x20-\x7E]/g, ''); // Entferne nicht-ASCII Zeichen
        const jsonMatch = fixedContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedCards = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Kein JSON-Array gefunden');
        }
      } catch (fallbackError) {
        console.error('Fallback parse error:', fallbackError);
        throw new Error('Ungültiges JSON-Format von der AI erhalten');
      }
    }

    // Validiere die Struktur
    if (!Array.isArray(parsedCards)) {
      throw new Error('AI-Antwort ist kein Array');
    }

    console.log('Parsed cards:', parsedCards);
    
    // Validiere und bereinige die Karten
    const validatedCards: GeneratedCard[] = parsedCards
      .filter(card => {
        // Prüfe ob alle erforderlichen Felder vorhanden sind
        return card && 
               typeof card.german === 'string' && card.german.trim() &&
               typeof card.romanji === 'string' && card.romanji.trim() &&
               typeof card.kana === 'string' && card.kana.trim();
      })
      .map(card => ({
        german: card.german.trim(),
        romanji: card.romanji.trim(),
        kana: card.kana.trim(),
        kanji: (card.kanji && typeof card.kanji === 'string' && card.kanji.trim()) ? card.kanji.trim() : undefined
      }));

    console.log('Validated cards:', validatedCards);

    if (validatedCards.length === 0) {
      console.error('No valid cards found in AI response');
      console.error('Original parsed cards:', parsedCards);
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