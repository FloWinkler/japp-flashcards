'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { BookOpen, Brain, Smartphone, Zap } from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { user, error } = await getCurrentUser();
      if (error) {
        console.error('Auth error:', error);
      } else if (user) {
        setUser(user);
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Navigation */}
      <nav className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Japp</span>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/login"
              className="btn-secondary"
            >
              Anmelden
            </Link>
            <Link
              href="/register"
              className="btn-primary"
            >
              Registrieren
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-4 py-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Lerne Japanisch mit{' '}
            <span className="text-primary-600">KI-gestützten</span> Karteikarten
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Erstelle automatisch Vokabeln zu jedem Thema und lerne effizient mit 
            personalisierten Karteikarten. Perfekt für Anfänger und Fortgeschrittene.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="btn-primary text-lg px-8 py-3"
            >
              Jetzt kostenlos starten
            </Link>
            <Link
              href="/login"
              className="btn-secondary text-lg px-8 py-3"
            >
              Bereits ein Konto?
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Brain className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">KI-gestützte Inhalte</h3>
            <p className="text-gray-600">
              Automatische Generierung von Vokabeln zu jedem Thema mit Groq AI
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Smartphone className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mobile-First</h3>
            <p className="text-gray-600">
              Optimiert für mobile Geräte mit intuitiver Swipe-Navigation
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Intelligentes Lernen</h3>
            <p className="text-gray-600">
              Personalisierte Lernfortschritte und adaptive Wiederholungen
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Schnell & Effizient</h3>
            <p className="text-gray-600">
              Lerne in kurzen Sessions mit maximaler Effektivität
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            So funktioniert's
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Thema eingeben</h3>
              <p className="text-gray-600">
                Gib ein Thema ein (z.B. "Farben", "Tiere") und lass die KI Vokabeln generieren
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Karten überprüfen</h3>
              <p className="text-gray-600">
                Überprüfe und bearbeite die generierten Karten vor dem Speichern
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lernen & Wiederholen</h3>
              <p className="text-gray-600">
                Lerne mit Swipe- oder Write-Modus und verfolge deinen Fortschritt
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bereit, Japanisch zu lernen?
            </h2>
            <p className="text-gray-600 mb-6">
              Starte noch heute mit deiner ersten Vokabelgruppe und erlebe, 
              wie einfach Japanisch lernen sein kann.
            </p>
            <Link
              href="/register"
              className="btn-primary text-lg px-8 py-3"
            >
              Kostenlos registrieren
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-6 w-6 text-primary-400" />
            <span className="text-xl font-bold">Japp</span>
          </div>
          <p className="text-gray-400 mb-4">
            Die moderne Art, Japanisch zu lernen
          </p>
          <div className="text-sm text-gray-500">
            © 2024 Japp. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
} 