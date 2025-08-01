'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser, getCards, deleteCard, updateCardProgress } from '@/lib/supabase';
import { Card } from '@/types';
import { formatJapaneseText } from '@/utils/japanese';
import { 
  ArrowLeft, 
  Play, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Target,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function GroupPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [showDifficultOnly, setShowDifficultOnly] = useState(false);
  const [showWrongOnly, setShowWrongOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  useEffect(() => {
    loadCards();
  }, [groupId]);

  useEffect(() => {
    filterCards();
  }, [cards, searchTerm, showHidden, showDifficultOnly, showWrongOnly]);

  const loadCards = async () => {
    try {
      const { user, error: userError } = await getCurrentUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data, error } = await getCards(groupId, { show_hidden: true });
      if (error) {
        toast.error('Fehler beim Laden der Karten');
        return;
      }

      setCards(data || []);
    } catch (error) {
      console.error('Error loading cards:', error);
      toast.error('Fehler beim Laden der Karten');
    } finally {
      setLoading(false);
    }
  };

  const filterCards = () => {
    let filtered = [...cards];

    // Suchfilter
    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.german.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.romanji.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.kana.includes(searchTerm) ||
        (card.kanji && card.kanji.includes(searchTerm))
      );
    }

    // Versteckte Karten
    if (!showHidden) {
      filtered = filtered.filter(card => !card.hidden);
    }

    // Nur schwierige Karten
    if (showDifficultOnly) {
      filtered = filtered.filter(card => card.difficult);
    }

    // Nur falsche Karten
    if (showWrongOnly) {
      filtered = filtered.filter(card => card.wrong_count > 0);
    }

    setFilteredCards(filtered);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Möchtest du diese Karte wirklich löschen?')) return;

    try {
      const { error } = await deleteCard(cardId);
      if (error) {
        toast.error('Fehler beim Löschen der Karte');
        return;
      }

      setCards(prev => prev.filter(card => card.id !== cardId));
      toast.success('Karte gelöscht');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Fehler beim Löschen der Karte');
    }
  };

  const toggleCardHidden = async (cardId: string, hidden: boolean) => {
    try {
      const { error } = await updateCardProgress(cardId, { hidden });
      if (error) {
        toast.error('Fehler beim Ausblenden der Karte');
        return;
      }

      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, hidden } : card
      ));
      toast.success(hidden ? 'Karte ausgeblendet' : 'Karte wieder sichtbar');
    } catch (error) {
      console.error('Error toggling card hidden:', error);
      toast.error('Fehler beim Ausblenden der Karte');
    }
  };

  const toggleCardDifficult = async (cardId: string, difficult: boolean) => {
    try {
      const { error } = await updateCardProgress(cardId, { difficult });
      if (error) {
        toast.error('Fehler beim Markieren der Karte');
        return;
      }

      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, difficult } : card
      ));
      toast.success(difficult ? 'Als schwierig markiert' : 'Schwierig-Markierung entfernt');
    } catch (error) {
      console.error('Error toggling card difficult:', error);
      toast.error('Fehler beim Markieren der Karte');
    }
  };

  const getCardStats = () => {
    const total = cards.length;
    const hidden = cards.filter(card => card.hidden).length;
    const difficult = cards.filter(card => card.difficult).length;
    const wrong = cards.filter(card => card.wrong_count > 0).length;
    const correct = cards.filter(card => card.correct_count > 0).length;

    return { total, hidden, difficult, wrong, correct };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const stats = getCardStats();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="btn-secondary mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Gruppe</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-primary-100 text-primary-700' : ''}`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <Link
            href={`/dashboard/group/${groupId}/learn`}
            className="btn-primary"
          >
            <Play className="h-4 w-4 mr-2" />
            Lernen
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="stats-card">
          <div className="stats-number">{stats.total}</div>
          <div className="stats-label">Gesamt</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{stats.correct}</div>
          <div className="stats-label">Richtig</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{stats.wrong}</div>
          <div className="stats-label">Falsch</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{stats.difficult}</div>
          <div className="stats-label">Schwierig</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{stats.hidden}</div>
          <div className="stats-label">Versteckt</div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Suche in Karten..."
                  className="input-field pl-10"
                />
              </div>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
                className="mr-2"
              />
              Versteckte Karten anzeigen
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showDifficultOnly}
                onChange={(e) => setShowDifficultOnly(e.target.checked)}
                className="mr-2"
              />
              Nur schwierige Karten
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showWrongOnly}
                onChange={(e) => setShowWrongOnly(e.target.checked)}
                className="mr-2"
              />
              Nur falsche Karten
            </label>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Karten ({filteredCards.length} von {cards.length})
          </h2>
          <Link
            href={`/dashboard/group/${groupId}/add-card`}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Karte hinzufügen
          </Link>
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {cards.length === 0 
                ? 'Diese Gruppe enthält noch keine Karten.'
                : 'Keine Karten entsprechen den aktuellen Filtern.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className={`border rounded-lg p-4 transition-colors ${
                  card.hidden ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                } ${card.difficult ? 'border-yellow-300 bg-yellow-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {card.german}
                      </h3>
                      {card.hidden && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          Versteckt
                        </span>
                      )}
                      {card.difficult && (
                        <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-1 rounded">
                          Schwierig
                        </span>
                      )}
                    </div>
                    
                    <div className="japanese-text space-y-1">
                      <p className="text-lg font-semibold text-gray-800">
                        {formatJapaneseText(card.kana, true)}
                      </p>
                      {card.kanji && (
                        <p className="text-lg font-semibold text-gray-700">
                          {card.kanji}
                        </p>
                      )}
                      <p className="text-gray-600">
                        {card.romanji}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>✓ {card.correct_count}</span>
                      <span>✗ {card.wrong_count}</span>
                      <span>
                        {card.correct_count + card.wrong_count > 0
                          ? `${Math.round((card.correct_count / (card.correct_count + card.wrong_count)) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleCardDifficult(card.id, !card.difficult)}
                      className={`p-2 rounded-lg transition-colors ${
                        card.difficult 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      title={card.difficult ? 'Schwierig-Markierung entfernen' : 'Als schwierig markieren'}
                    >
                      <Target className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => toggleCardHidden(card.id, !card.hidden)}
                      className={`p-2 rounded-lg transition-colors ${
                        card.hidden 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                      title={card.hidden ? 'Karte anzeigen' : 'Karte ausblenden'}
                    >
                      {card.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Karte löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 