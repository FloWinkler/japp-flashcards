import { NextRequest, NextResponse } from 'next/server';
import { generateJapaneseVocabulary } from '@/lib/ai';
import { getCurrentUser } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Prüfe Authentifizierung
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Parse Request Body
    const { topic } = await request.json();
    
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Thema ist erforderlich' },
        { status: 400 }
      );
    }

    // Prüfe Online-Status (Client-seitig, aber auch Server-seitig validieren)
    if (!request.headers.get('user-agent')) {
      return NextResponse.json(
        { error: 'Ungültige Anfrage' },
        { status: 400 }
      );
    }

    // Generiere Vokabeln
    const result = await generateJapaneseVocabulary(topic);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Thema konnte nicht automatisch geladen werden – bitte Thema manuell eingeben.',
          success: false 
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