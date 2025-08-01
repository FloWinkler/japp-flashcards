export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Group {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  card_count?: number;
}

export interface Card {
  id: string;
  group_id: string;
  german: string;
  romanji: string;
  kana: string;
  kanji?: string;
  correct_count: number;
  wrong_count: number;
  difficult: boolean;
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface CardWithGroup extends Card {
  group: Group;
}

export interface GeneratedCard {
  german: string;
  romanji: string;
  kana: string;
  kanji?: string;
}

export interface LearningStats {
  total_cards: number;
  correct_cards: number;
  wrong_cards: number;
  difficult_cards: number;
  hidden_cards: number;
  accuracy_percentage: number;
}

export interface FilterOptions {
  show_hidden: boolean;
  show_difficult_only: boolean;
  show_wrong_only: boolean;
}

export type LearningMode = 'swipe' | 'write';

export interface SwipeDirection {
  direction: 'left' | 'right';
  card_id: string;
  correct: boolean;
} 