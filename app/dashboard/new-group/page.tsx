'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, createGroup, createCards } from '@/lib/supabase';
import { GeneratedCard } from '@/types';
import { Brain, Plus, X, Check, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewGroupPage() {
  const [groupName, setGroupName] = useState('');
  const [topic, setTopic] = useState('');
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showKanji, setShowKanji] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Prüfe Online-Status
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const generateCards = async () => {
    if (!topic.trim()) {
      toast.error('Bitte gib ein Thema ein');
      return;
    }

    if (!isOnline) {
      toast.error('Keine Internetverbindung. AI-Funktion nur online verfügbar.');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Thema konnte nicht automatisch geladen werden – bitte Thema manuell eingeben.');
        return;
      }

      setGeneratedCards(result.data);
      // Alle Karten standardmäßig auswählen
      setSelectedCards(new Set(result.data.map((_: any, index: number) => index)));
      toast.success(`${result.data.length} Vokabeln generiert!`);
    } catch (error) {
      console.error('Error generating cards:', error);
      toast.error('Thema konnte nicht automatisch geladen werden – bitte Thema manuell eingeben.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleCardSelection = (index: number) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCards(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error('Bitte gib einen Gruppennamen ein');
      return;
    }

    if (selectedCards.size === 0) {
      toast.error('Bitte wähle mindestens eine Karte aus');
      return;
    }

    setLoading(true);
    try {
      const { user, error: userError } = await getCurrentUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      // Erstelle Gruppe
      const { data: group, error: groupError } = await createGroup(groupName.trim(), user.id);
      if (groupError) {
        toast.error('Fehler beim Erstellen der Gruppe');
        return;
      }

      // Erstelle ausgewählte Karten
      const selectedCardsArray = Array.from(selectedCards).map(index => ({
        ...generatedCards[index],
        group_id: group.id,
      }));

      const { error: cardsError } = await createCards(selectedCardsArray);
      if (cardsError) {
        toast.error('Fehler beim Erstellen der Karten');
        return;
      }

      toast.success(`Gruppe "${groupName}" mit ${selectedCards.size} Karten erstellt!`);
      router.push(`/dashboard/group/${group.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Fehler beim Erstellen der Gruppe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Neue Gruppe erstellen</h1>
        <p className="text-gray-600 mt-1">
          Erstelle eine neue Vokabelgruppe mit KI-gestützter Inhaltsgenerierung
        </p>
      </div>

      {/* Online Status */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <WifiOff className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              Du bist offline. AI-Funktion nur bei Internetverbindung verfügbar.
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Name */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gruppendetails</h2>
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              Gruppenname
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input-field"
              placeholder="z.B. Farben, Tiere, Essen..."
              required
            />
          </div>
        </div>

        {/* AI Generation */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">KI-gestützte Inhaltsgenerierung</h2>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-xs text-gray-500">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                Thema für Vokabeln
              </label>
              <div className="flex space-x-2">
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="input-field flex-1"
                  placeholder="z.B. Farben, Tiere, Essen, Familie..."
                  disabled={!isOnline}
                />
                <button
                  type="button"
                  onClick={generateCards}
                  disabled={!isOnline || generating || !topic.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-2"></div>
                      Generiere...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      Generieren
                    </div>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Die KI generiert automatisch deutsche Wörter und japanische Übersetzungen
              </p>
            </div>

            {!isOnline && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Offline-Modus
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Du kannst Karten manuell hinzufügen oder warten, bis du wieder online bist.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Cards */}
        {generatedCards.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Generierte Karten ({selectedCards.size} von {generatedCards.length} ausgewählt)
              </h2>
              <div className="flex items-center space-x-2">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showKanji}
                    onChange={(e) => setShowKanji(e.target.checked)}
                    className="mr-2"
                  />
                  Kanji anzeigen
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedCards.map((card, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCards.has(index)
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleCardSelection(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedCards.has(index)}
                          onChange={() => toggleCardSelection(index)}
                          className="text-primary-600"
                        />
                        <span className="font-medium text-gray-900">{card.german}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Romanji:</span> {card.romanji}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Kana:</span> {card.kana}
                        </p>
                        {showKanji && card.kanji && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Kanji:</span> {card.kanji}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCardSelection(index);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {selectedCards.has(index) ? (
                        <Check className="h-5 w-5 text-primary-600" />
                      ) : (
                        <X className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || selectedCards.size === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="loading-spinner mr-2"></div>
                Erstelle Gruppe...
              </div>
            ) : (
              <div className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Gruppe erstellen ({selectedCards.size} Karten)
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 