'use client';

import { useState } from 'react';
import { signOut } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, User, Bell, Shield, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Fehler beim Abmelden');
      } else {
        toast.success('Erfolgreich abgemeldet');
        router.push('/');
      }
    } catch (error) {
      toast.error('Fehler beim Abmelden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-gray-600 mt-1">
          Verwalte deine Kontoeinstellungen
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Account Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Kontoeinstellungen
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">E-Mail-Adresse</h3>
                <p className="text-sm text-gray-600">Wird für die Anmeldung verwendet</p>
              </div>
              <span className="text-sm text-gray-500">user@example.com</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Passwort</h3>
                <p className="text-sm text-gray-600">Ändere dein Passwort</p>
              </div>
              <button className="btn-secondary text-sm">
                Ändern
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Benachrichtigungen
          </h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" defaultChecked />
              <div>
                <span className="font-medium text-gray-900">Tägliche Erinnerungen</span>
                <p className="text-sm text-gray-600">Erhalte Erinnerungen zum täglichen Lernen</p>
              </div>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <div>
                <span className="font-medium text-gray-900">Wöchentliche Statistiken</span>
                <p className="text-sm text-gray-600">Erhalte eine Zusammenfassung deiner Fortschritte</p>
              </div>
            </label>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Datenschutz
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Datenschutzrichtlinie</h3>
              <p className="text-sm text-blue-800 mb-3">
                Deine Daten werden sicher in Supabase gespeichert und nur für die Funktionalität der App verwendet.
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Datenschutzrichtlinie lesen
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Konto löschen</h3>
                <p className="text-sm text-gray-600">Lösche dein Konto und alle Daten unwiderruflich</p>
              </div>
              <button className="btn-danger text-sm">
                Löschen
              </button>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            Hilfe & Support
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Häufige Fragen</h3>
                <p className="text-sm text-gray-600">Finde Antworten auf häufige Fragen</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Kontakt</h3>
                <p className="text-sm text-gray-600">Kontaktiere uns bei Problemen</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Anleitung</h3>
                <p className="text-sm text-gray-600">Lerne, wie du die App optimal nutzt</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Feedback</h3>
                <p className="text-sm text-gray-600">Teile uns deine Meinung mit</p>
              </button>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <LogOut className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h3 className="font-medium text-gray-900">Abmelden</h3>
                <p className="text-sm text-gray-600">Melde dich von deinem Konto ab</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="btn-danger"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="loading-spinner mr-2"></div>
                  Abmelden...
                </div>
              ) : (
                'Abmelden'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Japp v1.0.0</p>
        <p className="mt-1">© 2024 Japp. Alle Rechte vorbehalten.</p>
      </div>
    </div>
  );
} 