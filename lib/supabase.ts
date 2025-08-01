import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Group, Card, LearningStats } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Groups CRUD
export const createGroup = async (name: string, userId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .insert([{ name, user_id: userId }])
    .select()
    .single();
  return { data: data as Group | null, error };
};

export const getGroups = async (userId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      cards (count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateGroup = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from('groups')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteGroup = async (id: string) => {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id);
  return { error };
};

// Cards CRUD
export const createCard = async (card: {
  group_id: string;
  german: string;
  romanji: string;
}) => {
  const { data, error } = await supabase
    .from('cards')
    .insert([card])
    .select()
    .single();
  return { data, error };
};

export const createCards = async (cards: Array<{
  group_id: string;
  german: string;
  romanji: string;
}>) => {
  const { data, error } = await supabase
    .from('cards')
    .insert(cards)
    .select();
  return { data, error };
};

export const getCards = async (groupId: string, filters?: {
  show_hidden?: boolean;
  show_difficult_only?: boolean;
  show_wrong_only?: boolean;
}) => {
  let query = supabase
    .from('cards')
    .select('*')
    .eq('group_id', groupId);

  if (filters) {
    if (!filters.show_hidden) {
      query = query.eq('hidden', false);
    }
    if (filters.show_difficult_only) {
      query = query.eq('difficult', true);
    }
    if (filters.show_wrong_only) {
      query = query.gt('wrong_count', 0);
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  return { data: data as Card[] | null, error };
};

export const updateCardProgress = async (
  id: string,
  updates: {
    correct_count?: number;
    wrong_count?: number;
    difficult?: boolean;
    hidden?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('cards')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteCard = async (id: string) => {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id);
  return { error };
};

// Learning stats
export const getLearningStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('cards')
    .select(`
      correct_count,
      wrong_count,
      difficult,
      hidden,
      groups!inner(user_id)
    `)
    .eq('groups.user_id', userId);

  if (error) return { data: null, error };

  const stats = {
    total_cards: data.length,
    correct_cards: data.filter(card => card.correct_count > 0).length,
    wrong_cards: data.filter(card => card.wrong_count > 0).length,
    difficult_cards: data.filter(card => card.difficult).length,
    hidden_cards: data.filter(card => card.hidden).length,
    accuracy_percentage: 0,
  };

  const total_attempts = data.reduce((sum, card) => sum + card.correct_count + card.wrong_count, 0);
  const total_correct = data.reduce((sum, card) => sum + card.correct_count, 0);
  
  if (total_attempts > 0) {
    stats.accuracy_percentage = Math.round((total_correct / total_attempts) * 100);
  }

  return { data: stats, error: null };
}; 