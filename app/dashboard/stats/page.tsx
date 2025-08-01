'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, getLearningStats, getGroups } from '@/lib/supabase';
import { LearningStats, Group } from '@/types';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function StatsPage() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { user, error: userError } = await getCurrentUser();
      if (userError || !user) {
        return;
      }

      const [statsResult, groupsResult] = await Promise.all([
        getLearningStats(user.id),
        getGroups(user.id)
      ]);

      if (statsResult.error) {
        console.error('Error loading stats:', statsResult.error);
      } else {
        setStats(statsResult.data);
      }

      if (groupsResult.error) {
        console.error('Error loading groups:', groupsResult.error);
      } else {
        setGroups(groupsResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Statistiken verfügbar
        </h3>
        <p className="text-gray-600">
          Starte mit dem Lernen, um Statistiken zu sehen.
        </p>
      </div>
    );
  }

  const totalAttempts = stats.total_cards > 0 
    ? stats.correct_cards + stats.wrong_cards 
    : 0;

  const getStreakColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMotivationalMessage = () => {
    if (stats.accuracy_percentage >= 90) {
      return "Ausgezeichnet! Du beherrschst Japanisch sehr gut! 🎉";
    } else if (stats.accuracy_percentage >= 75) {
      return "Gut gemacht! Du machst große Fortschritte! 💪";
    } else if (stats.accuracy_percentage >= 50) {
      return "Du bist auf dem richtigen Weg! Weiter so! 📚";
    } else {
      return "Jeder Anfang ist schwer. Übung macht den Meister! 🌱";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiken</h1>
        <p className="text-gray-600 mt-1">
          Übersicht über deine Lernfortschritte
        </p>
      </div>

      {/* Motivational Message */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="flex items-center">
          <Award className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getMotivationalMessage()}
            </h3>
            <p className="text-gray-600 mt-1">
              Du hast bereits {stats.total_cards} Karten erstellt und {totalAttempts} Versuche gemacht.
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <div className="stats-number">{stats.total_cards}</div>
              <div className="stats-label">Gesamt Karten</div>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="stats-number">{stats.correct_cards}</div>
              <div className="stats-label">Richtig beantwortet</div>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="stats-number">{stats.wrong_cards}</div>
              <div className="stats-label">Falsch beantwortet</div>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className={`stats-number ${getStreakColor(stats.accuracy_percentage)}`}>
                {stats.accuracy_percentage}%
              </div>
              <div className="stats-label">Genauigkeit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lernfortschritt</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Gesamtgenauigkeit</span>
                <span>{stats.accuracy_percentage}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${stats.accuracy_percentage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Richtige Antworten</span>
                <span>{stats.correct_cards} / {totalAttempts}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-green-600" 
                  style={{ width: `${totalAttempts > 0 ? (stats.correct_cards / totalAttempts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Falsche Antworten</span>
                <span>{stats.wrong_cards} / {totalAttempts}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-red-600" 
                  style={{ width: `${totalAttempts > 0 ? (stats.wrong_cards / totalAttempts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Management */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Kartenverwaltung</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Schwierige Karten</span>
              </div>
              <span className="text-lg font-semibold text-yellow-600">{stats.difficult_cards}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Versteckte Karten</span>
              </div>
              <span className="text-lg font-semibold text-red-600">{stats.hidden_cards}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Aktive Karten</span>
              </div>
              <span className="text-lg font-semibold text-green-600">
                {stats.total_cards - stats.hidden_cards}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Overview */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Gruppenübersicht</h2>
        {groups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Noch keine Gruppen erstellt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{group.name}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{group.card_count || 0} Karten</span>
                  <span>
                    {new Date(group.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learning Tips */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lerntipps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Regelmäßig üben</h4>
              <p className="text-sm text-gray-600">
                Kurze, tägliche Sessions sind effektiver als lange, seltene.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Target className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Schwierige Karten wiederholen</h4>
              <p className="text-sm text-gray-600">
                Markiere schwierige Karten und übe sie häufiger.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Fortschritt verfolgen</h4>
              <p className="text-sm text-gray-600">
                Schaue dir regelmäßig deine Statistiken an.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Konsistenz ist wichtig</h4>
              <p className="text-sm text-gray-600">
                Versuche, jeden Tag zu lernen, auch wenn nur kurz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 