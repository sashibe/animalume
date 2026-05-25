import type { Locale } from './types';

export const LIMITS = {
  // ─── タイプ説明 ───
  tagline:      { ja: 22,  ko: 18,  hard: true  },
  typeHeading:  { ja: 20,  ko: 18,  hard: false },
  typeEssence:  { ja: 40,  ko: 36,  hard: false },
  typeBody:     { ja: 400, ko: 350, hard: false },

  // ─── 問題文 ───
  questionBody: { ja: 60, ko: 50, hard: false },
  answerCard:   { ja: 14, ko: 12, hard: true  },

  // ─── UI文言 ───
  uiLabel:  { ja: 30,  ko: 26,  hard: false },
  uiNotice: { ja: 100, ko: 90,  hard: false },
} as const;

export type LimitKind = keyof typeof LIMITS;

export function getLimit(kind: LimitKind, lang: Locale) {
  const def = LIMITS[kind];
  return { max: def[lang], hard: def.hard };
}

// ─── 回答カード 3 段階判定 ───

/** iPhone SE (375px) でも崩れない安全ライン */
export const ANSWER_CARD_SAFE = { ja: 12, ko: 10 } as const;

export type AnswerSeverity = 'ok' | 'warn' | 'ng';

/**
 * 1 行あたりの文字数から重大度を返す。
 * ok  : 〜safe字   — iPhone SE でも安全
 * warn: safe+1〜max字 — iPhone 14 で OK、SE は要確認
 * ng  : max+1字以上  — iPhone 14 でも崩れる
 */
export function classifyAnswerLine(lineLength: number, lang: 'ja' | 'ko'): AnswerSeverity {
  const safe = ANSWER_CARD_SAFE[lang];
  const max  = LIMITS.answerCard[lang];
  if (lineLength <= safe) return 'ok';
  if (lineLength <= max)  return 'warn';
  return 'ng';
}
