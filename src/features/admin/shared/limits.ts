import type { Locale } from './types';

export const LIMITS = {
  // ─── タイプ説明 ───
  tagline:     { ja: 22,  ko: 18,  hard: true  },
  typeHeading: { ja: 20,  ko: 18,  hard: false },
  typeBody:    { ja: 400, ko: 350, hard: false },

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
