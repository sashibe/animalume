/**
 * Animalume - 問題プール 型定義
 *
 * 各軸20問×4軸=80問の共通プール用。
 * 国別特化問題（ja/ko）も同じ Question 型で管理。
 */

import type { Axis } from '@/features/diagnosis/logic/types';

export type QuestionFormat = 'situation' | 'binary' | 'likert';

export type QuestionLocale = 'ja' | 'ko';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

/** 個別の問題定義 */
export type Question = {
  id: string;
  axis: Axis;
  format: QuestionFormat;
  locale: QuestionLocale;
  content: string;
  optionA: { text: string; weight: number };
  optionB: { text: string; weight: number };
  active: boolean;
  difficulty: QuestionDifficulty;
  tags: string[];
};
