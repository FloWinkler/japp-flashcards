'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser, getCards, updateCardProgress } from '@/lib/supabase';
import { Card, LearningMode, FilterOptions } from '@/types';
import SwipeCard from '@/components/SwipeCard';
import WriteCard from '@/components/WriteCard';
import { 
  ArrowLeft, 
  Settings, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Filter,
  Target,
  Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LearnPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [learningMode, setLearningMode] = useState<LearningMode>('swipe');
  const [showKanji, setShowKanji] = useState(true);
  const [inputType, setInputType] = useState<'romanji' | 'kana'>('romanji');
  const [filters, setFilters] = useState<FilterOptions>({
    show_hidden: false,
    show_difficult_only: false,
    show_wrong_only: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    correct: 0,
    wrong: 0,
    total: 0,
  });
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  useEffect(() => {
    loadCards();
  }, [groupId, filters]);

  const loadCards = async () => {
    try {
      const { user, error: userError } = await getCurrentUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data, error } = await getCards(groupId, filters);
      if (error) {
        toast.error('Fehler beim Laden der Karten');
        return;
      }

      setCards(data || []);
      setCurrentCardIndex(0);
      setStats({ correct: 0, wrong: 0, total: data?.length || 0 });
    } catch (error) {
      console.error('Error loading cards:', error);
      toast.error('Fehler beim Laden der Karten');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', correct: boolean) => {
    if (currentCardIndex >= cards.length) return;

    const card = cards[currentCardIndex];
    const updates: any = {};

    if (correct) {
      updates.correct_count = card.correct_count + 1;
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      updates.wrong_count = card.wrong_count + 1;
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    try {
      await updateCardProgress(card.id, updates);
    } catch (error) {
      console.error('Error updating card progress:', error);
    }

    // Nächste Karte
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Alle Karten durch
      toast.success('Alle Karten durchgearbeitet!');
      setTimeout(() => {
        setCurrentCardIndex(0);
        setStats({ correct: 0, wrong: 0, total: cards.length });
      }, 2000);
    }
  };

  const handleWriteAnswer = async (correct: boolean) => {
    if (currentCardIndex >= cards.length) return;

    const card = cards[currentCardIndex];
    const updates: any = {};

    if (correct) {
      updates.correct_count = card.correct_count + 1;
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      updates.wrong_count = card.wrong_count + 1;
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    try {
      await updateCardProgress(card.id, updates);
    } catch (error) {
      console.error('Error updating card progress:', error);
    }
  };

  const resetSession = () => {
    setCurrentCardIndex(0);
    setStats({ correct: 0, wrong: 0, total: cards.length });
    toast.success('Session zurückgesetzt');
  };

  const toggleCardHidden = async (cardId: string, hidden: boolean) => {
    try {
      await updateCardProgress(cardId, { hidden });
      // Aktualisiere lokale Karten
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
      await updateCardProgress(cardId, { difficult });
      // Aktualisiere lokale Karten
      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, difficult } : card
      ));
      toast.success(difficult ? 'Als schwierig markiert' : 'Schwierig-Markierung entfernt');
    } catch (error) {
      console.error('Error toggling card difficult:', error);
      toast.error('Fehler beim Markieren der Karte');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="btn-secondary mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Lernen</h1>
        </div>
        
        <div className="card text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Karten zum Lernen
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.show_hidden || filters.show_difficult_only || filters.show_wrong_only
              ? 'Keine Karten entsprechen den aktuellen Filtern.'
              : 'Diese Gruppe enthält noch keine Karten.'}
          </p>
          <button
            onClick={() => setFilters({
              show_hidden: false,
              show_difficult_only: false,
              show_wrong_only: false,
            })}
            className="btn-primary"
          >
            Alle Karten anzeigen
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0;
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
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
          <h1 className="text-2xl font-bold text-gray-900">Lernen</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-primary-100 text-primary-700' : ''}`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button
            onClick={() => setShowKanji(!showKanji)}
            className="btn-secondary"
          >
            {showKanji ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            Kanji
          </button>
          <button
            onClick={resetSession}
            className="btn-secondary"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.show_hidden}
                onChange={(e) => setFilters(prev => ({ ...prev, show_hidden: e.target.checked }))}
                className="mr-2"
              />
              Ausgeblendete Karten anzeigen
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.show_difficult_only}
                onChange={(e) => setFilters(prev => ({ ...prev, show_difficult_only: e.target.checked }))}
                className="mr-2"
              />
              Nur schwierige Karten
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.show_wrong_only}
                onChange={(e) => setFilters(prev => ({ ...prev, show_wrong_only: e.target.checked }))}
                className="mr-2"
              />
              Nur falsche Karten
            </label>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stats-card">
          <div className="stats-number">{currentCardIndex + 1}</div>
          <div className="stats-label">Aktuelle Karte</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{cards.length}</div>
          <div className="stats-label">Gesamt Karten</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{accuracy}%</div>
          <div className="stats-label">Genauigkeit</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{Math.round(progress)}%</div>
          <div className="stats-label">Fortschritt</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Learning Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setLearningMode('swipe')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              learningMode === 'swipe'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Swipe-Modus
          </button>
          <button
            onClick={() => setLearningMode('write')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              learningMode === 'write'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Write-Modus
          </button>
        </div>
      </div>

      {/* Write Mode Settings */}
      {learningMode === 'write' && (
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setInputType('romanji')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                inputType === 'romanji'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Romanji
            </button>
            <button
              onClick={() => setInputType('kana')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                inputType === 'kana'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kana
            </button>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="flex justify-center mb-6">
        {learningMode === 'swipe' ? (
          <SwipeCard
            card={currentCard}
            onSwipe={handleSwipe}
            showKanji={showKanji}
            isActive={true}
          />
        ) : (
          <WriteCard
            card={currentCard}
            onAnswer={handleWriteAnswer}
            showKanji={showKanji}
            inputType={inputType}
            isActive={true}
          />
        )}
      </div>

      {/* Card Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => toggleCardDifficult(currentCard.id, !currentCard.difficult)}
          className={`btn-secondary ${currentCard.difficult ? 'bg-yellow-100 text-yellow-700' : ''}`}
        >
          <Target className="h-4 w-4 mr-2" />
          {currentCard.difficult ? 'Schwierig' : 'Als schwierig markieren'}
        </button>
        <button
          onClick={() => toggleCardHidden(currentCard.id, !currentCard.hidden)}
          className={`btn-secondary ${currentCard.hidden ? 'bg-gray-100 text-gray-700' : ''}`}
        >
          {currentCard.hidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
          {currentCard.hidden ? 'Wieder anzeigen' : 'Ausblenden'}
        </button>
      </div>
    </div>
  );
} 