/**
 * Animalume - 問題プール統合と抽選ロジック
 *
 * 80問プール（各軸20問×4軸）から、層化サンプリングで40問を抽出する。
 * 各軸10問ずつ、ランダムに選ぶ。
 *
 * 将来拡張：
 *   - 弁別力（D係数）による重み付き抽選
 *   - 出題回数による調整（少ない問題を優先）
 *   - 過去に同ユーザーに出した問題を除外
 */

import { eiPoolJa } from './ei-pool.ja';
import { snPoolJa } from './sn-pool.ja';
import { tfPoolJa } from './tf-pool.ja';
import { jpPoolJa } from './jp-pool.ja';
import { eiPoolKo } from './ei-pool.ko';
import { snPoolKo } from './sn-pool.ko';
import { tfPoolKo } from './tf-pool.ko';
import { jpPoolKo } from './jp-pool.ko';
import type { Question, QuestionLocale } from './types';
import { AXES, type Axis } from '@/features/diagnosis/logic/types';

/** ロケール別の全問題プール */
export const ALL_POOLS_JA: Record<Axis, Question[]> = {
  EI: eiPoolJa,
  SN: snPoolJa,
  TF: tfPoolJa,
  JP: jpPoolJa,
};

export const ALL_POOLS_KO: Record<Axis, Question[]> = {
  EI: eiPoolKo,
  SN: snPoolKo,
  TF: tfPoolKo,
  JP: jpPoolKo,
};

/** ロケールから対応するプールを取得 */
export function getPoolsByLocale(locale: QuestionLocale): Record<Axis, Question[]> {
  return locale === 'ja' ? ALL_POOLS_JA : ALL_POOLS_KO;
}

/**
 * Fisher-Yates シャッフル
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 抽選オプション */
export type SamplingOptions = {
  /** 各軸からの抽選数（デフォルト: 10） */
  perAxis?: number;
  /** 出題順序をシャッフルするか（デフォルト: true） */
  shuffleOrder?: boolean;
  /** A/Bを左右ランダムにフリップするか（デフォルト: true） */
  flipOptions?: boolean;
  /** 除外するquestionId（過去に出した問題） */
  excludeIds?: string[];
};

/**
 * 層化サンプリングで問題を抽選する。
 *
 * @param locale - 言語
 * @param options - 抽選オプション
 * @returns 計40問（軸ごとに10問ずつ、出題順はシャッフル済み）
 */
export function sampleQuestions(
  locale: QuestionLocale,
  options: SamplingOptions = {},
): Question[] {
  const {
    perAxis = 10,
    shuffleOrder = true,
    flipOptions = true,
    excludeIds = [],
  } = options;

  const pools = getPoolsByLocale(locale);
  const excludeSet = new Set(excludeIds);

  const selected: Question[] = [];

  for (const axis of AXES) {
    // active なものだけ + 除外IDを除く
    const candidates = pools[axis].filter(
      (q) => q.active && !excludeSet.has(q.id),
    );

    if (candidates.length < perAxis) {
      // プール不足時は除外を諦める
      const fallback = pools[axis].filter((q) => q.active);
      const sampled = shuffle(fallback).slice(0, perAxis);
      selected.push(...sampled);
    } else {
      const sampled = shuffle(candidates).slice(0, perAxis);
      selected.push(...sampled);
    }
  }

  // 出題順序のシャッフル（軸の偏りを避ける）
  let result = shuffleOrder ? shuffle(selected) : selected;

  // A/Bフリップ（同じ方向に連続スワイプを防ぐ）
  if (flipOptions) {
    result = result.map((q) => {
      if (Math.random() < 0.5) {
        return {
          ...q,
          optionA: q.optionB,
          optionB: q.optionA,
        };
      }
      return q;
    });
  }

  return result;
}

/**
 * 特定のquestionId配列を再現する（再受験との比較用）
 *
 * 前回の診断で出題された問題セットを使って、もう一度回答してもらう。
 * compareResults() で「前回と同じ問題」での比較が可能になる。
 */
export function reconstructQuestionSet(
  locale: QuestionLocale,
  questionIds: string[],
): Question[] {
  const pools = getPoolsByLocale(locale);
  const allQuestions = AXES.flatMap((axis) => pools[axis]);
  const idMap = new Map(allQuestions.map((q) => [q.id, q]));

  return questionIds
    .map((id) => idMap.get(id))
    .filter((q): q is Question => q !== undefined);
}
