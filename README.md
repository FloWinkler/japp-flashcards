# Japp - Japanisch Karteikarten App

Eine mobile-first Karteikarten-App zum Lernen japanischer Vokabeln mit KI-gestützter Inhaltsgenerierung.

## Features

- 🔐 **Authentifizierung**: Supabase Auth mit E-Mail/Passwort
- 🧠 **KI-gestützte Inhalte**: Automatische Generierung von Vokabeln via Groq (LLaMA 3)
- 📚 **Lernmodi**: Swipe-Modus und Write-Modus
- 📱 **Mobile-First**: Optimiert für mobile Geräte
- 🌐 **Offline-Unterstützung**: Funktioniert auch ohne Internetverbindung
- 📊 **Fortschrittsverfolgung**: Detaillierte Statistiken und Lernfortschritt

## Tech Stack

- **Frontend**: Next.js 14 mit App Router
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **KI**: Groq API (LLaMA 3)
- **Deployment**: Vercel
- **Konvertierung**: wanakana.js für Romanji ↔ Kana

## Setup

### 1. Repository klonen
```bash
git clone <repository-url>
cd japp-flashcards
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren
Kopiere `env.example` zu `.env.local` und fülle die Werte aus:

```bash
cp env.example .env.local
```

#### Supabase Setup
1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Gehe zu Settings > API
3. Kopiere die URL und anon key

#### Groq Setup
1. Registriere dich auf [groq.com](https://groq.com)
2. Erstelle einen API Key
3. Füge ihn zu den Umgebungsvariablen hinzu

### 4. Datenbank-Schema erstellen
Führe folgende SQL-Befehle in der Supabase SQL Editor aus:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create groups table
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cards table
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  german TEXT NOT NULL,
  romanji TEXT NOT NULL,
  kana TEXT NOT NULL,
  kanji TEXT,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  difficult BOOLEAN DEFAULT FALSE,
  hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
CREATE POLICY "Users can view own groups" ON groups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own groups" ON groups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own groups" ON groups
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = cards.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own cards" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = cards.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = cards.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cards" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = cards.group_id 
      AND groups.user_id = auth.uid()
    )
  );
```

### 5. Entwicklungsserver starten
```bash
npm run dev
```

Die App ist unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Deployment auf Vercel

1. Push das Repository zu GitHub
2. Verbinde das Repository mit Vercel
3. Füge die Umgebungsvariablen in Vercel hinzu
4. Deploy!

## Verwendung

### Registrierung/Login
- Erstelle ein Konto mit E-Mail und Passwort
- Melde dich an, um deine Karteikarten zu verwalten

### Gruppen erstellen
- Erstelle Gruppen für verschiedene Themen (z.B. "Farben", "Tiere")
- Nutze die KI-Funktion, um automatisch Vokabeln zu generieren

### KI-gestützte Inhaltsgenerierung
- Gib ein Thema ein (z.B. "Farben")
- Die App generiert automatisch deutsche Wörter und japanische Übersetzungen
- Überprüfe und bearbeite die generierten Karten vor dem Speichern

### Lernen
- **Swipe-Modus**: Wische nach rechts für richtig, links für falsch
- **Write-Modus**: Tippe die japanischen Wörter selbst ein
- Filtere nach schwierigen oder falschen Karten
- Verstecke Karten, die du bereits gut beherrschst

## Projektstruktur

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-bezogene Seiten
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard und Lernbereiche
│   └── globals.css        # Globale Styles
├── components/            # React Komponenten
├── lib/                   # Supabase und AI Funktionen
├── utils/                 # Hilfsfunktionen
└── types/                 # TypeScript Typen
```

## Lizenz

MIT 