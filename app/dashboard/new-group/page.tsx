'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, createGroup, createCards, getGroups, createCard } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
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
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualCards, setManualCards] = useState<Array<{ german: string; romanji: string }>>([]);
  const [newCardGerman, setNewCardGerman] = useState('');
  const [newCardRomanji, setNewCardRomanji] = useState('');
  const [translating, setTranslating] = useState(false);

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

  const translateWord = async (germanWord: string) => {
    if (!germanWord.trim()) return;
    
    setTranslating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: germanWord }),
      });

      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setNewCardRomanji(result.data[0].romanji);
        toast.success('Übersetzung generiert!');
      } else {
        toast.error('Übersetzung konnte nicht generiert werden');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Fehler bei der Übersetzung');
    } finally {
      setTranslating(false);
    }
  };

  const addManualCard = () => {
    if (!newCardGerman.trim() || !newCardRomanji.trim()) {
      toast.error('Bitte fülle beide Felder aus');
      return;
    }

    setManualCards(prev => [...prev, {
      german: newCardGerman.trim(),
      romanji: newCardRomanji.trim()
    }]);

    setNewCardGerman('');
    setNewCardRomanji('');
    toast.success('Karte hinzugefügt!');
  };

  const removeManualCard = (index: number) => {
    setManualCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error('Bitte gib einen Gruppennamen ein');
      return;
    }

    setLoading(true);
    try {
      const { user, error: userError } = await getCurrentUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      // Prüfe auf Duplikate
      const existingGroups = await getGroups(user.id);
      if (existingGroups.data?.some(group => group.name.toLowerCase() === groupName.trim().toLowerCase())) {
        toast.error(`Eine Gruppe mit dem Namen "${groupName.trim()}" existiert bereits. Bitte wähle einen anderen Namen.`);
        setLoading(false);
        return;
      }

    if (selectedCards.size === 0 && manualCards.length === 0) {
      toast.error('Bitte wähle mindestens eine Karte aus oder füge manuelle Karten hinzu');
      return;
    }

      // Erstelle Gruppe
      const { data: group, error: groupError } = await createGroup(groupName.trim(), user.id);
      if (groupError) {
        toast.error('Fehler beim Erstellen der Gruppe');
        return;
      }

      // Erstelle alle Karten (KI-generierte + manuelle)
      const allCards = [
        ...Array.from(selectedCards).map(index => ({
          german: generatedCards[index].german,
          romanji: generatedCards[index].romanji,
          group_id: group!.id,
        })),
        ...manualCards.map(card => ({
          german: card.german,
          romanji: card.romanji,
          group_id: group!.id,
        }))
      ];

      console.log('Creating cards:', allCards);
      const { data: cardsData, error: cardsError } = await createCards(allCards);
      if (cardsError) {
        console.error('Cards creation error:', cardsError);
        toast.error(`Fehler beim Erstellen der Karten: ${cardsError.message}`);
        return;
      }
      console.log('Cards created successfully:', cardsData);

      const totalCards = selectedCards.size + manualCards.length;
      toast.success(`Gruppe "${groupName}" mit ${totalCards} Karten erstellt!`);
      router.push(`/dashboard/group/${group!.id}`);
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

        {/* Manual Cards */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Manuelle Karten ({manualCards.length} hinzugefügt)
            </h2>
            <button
              type="button"
              onClick={() => setShowManualAdd(!showManualAdd)}
              className="btn-secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showManualAdd ? 'Verstecken' : 'Karte hinzufügen'}
            </button>
          </div>

          {showManualAdd && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deutsches Wort
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newCardGerman}
                      onChange={(e) => setNewCardGerman(e.target.value)}
                      onBlur={() => newCardGerman.trim() && translateWord(newCardGerman)}
                      className="input-field flex-1"
                      placeholder="z.B. Haus"
                    />
                    {translating && (
                      <div className="loading-spinner h-6 w-6"></div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Japanische Übersetzung (Romanji)
                  </label>
                  <input
                    type="text"
                    value={newCardRomanji}
                    onChange={(e) => setNewCardRomanji(e.target.value)}
                    className="input-field"
                    placeholder="z.B. ie"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={addManualCard}
                  disabled={!newCardGerman.trim() || !newCardRomanji.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Karte hinzufügen
                </button>
              </div>
            </div>
          )}

          {manualCards.length > 0 && (
            <div className="space-y-2">
              {manualCards.map((card, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{card.german}</div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Romanji:</span> {card.romanji}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeManualCard(index)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generated Cards */}
        {generatedCards.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Generierte Karten ({selectedCards.size} von {generatedCards.length} ausgewählt)
              </h2>

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