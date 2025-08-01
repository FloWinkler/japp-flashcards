'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getGroups, getLearningStats, deleteGroup } from '@/lib/supabase';
import { Group, LearningStats } from '@/types';
import Link from 'next/link';
import { 
  Plus, 
  BookOpen, 
  TrendingUp, 
  Target, 
  Clock,
  ArrowRight,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Möchtest du die Gruppe "${groupName}" wirklich löschen? Alle Karten in dieser Gruppe gehen verloren.`)) {
      return;
    }

    setDeletingGroup(groupId);
    try {
      const { error } = await deleteGroup(groupId);
      if (error) {
        toast.error('Fehler beim Löschen der Gruppe');
        return;
      }

      setGroups(prev => prev.filter(group => group.id !== groupId));
      toast.success(`Gruppe "${groupName}" gelöscht`);
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Fehler beim Löschen der Gruppe');
    } finally {
      setDeletingGroup(null);
    }
  };

  const loadDashboardData = async () => {
    try {
      const { user, error: userError } = await getCurrentUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      const [groupsResult, statsResult] = await Promise.all([
        getGroups(user.id),
        getLearningStats(user.id)
      ]);

      if (groupsResult.error) {
        toast.error('Fehler beim Laden der Gruppen');
      } else {
        setGroups(groupsResult.data || []);
      }

      if (statsResult.error) {
        toast.error('Fehler beim Laden der Statistiken');
      } else {
        setStats(statsResult.data || null);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Fehler beim Laden der Daten');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Willkommen zurück! Hier ist eine Übersicht deiner Lernfortschritte.
          </p>
        </div>
        <Link
          href="/dashboard/new-group"
          className="btn-primary mt-4 sm:mt-0 inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Neue Gruppe
        </Link>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-primary-600" />
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
                <div className="stats-number">{stats.accuracy_percentage}%</div>
                <div className="stats-label">Genauigkeit</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Groups Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Deine Gruppen</h2>
          <Link
            href="/dashboard/new-group"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Alle anzeigen
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Noch keine Gruppen
            </h3>
            <p className="text-gray-600 mb-6">
              Erstelle deine erste Vokabelgruppe und starte mit dem Lernen.
            </p>
            <Link href="/dashboard/new-group" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Erste Gruppe erstellen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.slice(0, 6).map((group) => (
              <div key={group.id} className="card-hover group relative">
                <Link
                  href={`/dashboard/group/${group.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {group.card_count || 0} Karten
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Erstellt am {new Date(group.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteGroup(group.id, group.name);
                  }}
                  disabled={deletingGroup === group.id}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Gruppe löschen"
                >
                  {deletingGroup === group.id ? (
                    <div className="loading-spinner h-4 w-4"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Letzte Aktivität</h2>
        <div className="space-y-4">
          {groups.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Noch keine Aktivität. Starte mit dem Lernen!
            </p>
          ) : (
            groups.slice(0, 5).map((group) => (
              <div key={group.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Gruppe "{group.name}" erstellt
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(group.created_at).toLocaleDateString('de-DE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schnellstart</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/new-group"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-primary-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Neue Gruppe erstellen</span>
            </Link>
            {groups.length > 0 && (
              <Link
                href={`/dashboard/group/${groups[0].id}/learn`}
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <Target className="h-5 w-5 text-primary-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  Mit "{groups[0].name}" lernen
                </span>
              </Link>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lernziele</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tägliche Karten</span>
              <span className="text-sm font-medium text-gray-900">
                {stats?.total_cards || 0} / 20
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(((stats?.total_cards || 0) / 20) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              Ziel: 20 Karten pro Tag lernen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 