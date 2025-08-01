import { NextRequest, NextResponse } from 'next/server';
import { generateJapaneseVocabulary } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    // Parse Request Body
    const { topic } = await request.json();
    
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Thema ist erforderlich' },
        { status: 400 }
      );
    }

    // Generiere Vokabeln
    const result = await generateJapaneseVocabulary(topic);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Thema konnte nicht automatisch geladen werden – bitte Thema manuell eingeben.',
          success: false,
          debug: result.debug || null
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      topic
    });

  } catch (error) {
    console.error('AI Generation API Error:', error);
    return NextResponse.json(
      { 
        error: 'Thema konnte nicht automatisch geladen werden – bitte Thema manuell eingeben.',
        success: false 
      },
      { status: 500 }
    );
  }
} 