export type Locale = 'ja' | 'ko';
export type Localized = Record<Locale, string>;

export const LOCALES: Locale[] = ['ja', 'ko'];

// ───── タイプ説明 ─────
export type TypeCode =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type TypeTopic = {
  id: string;
  heading: Localized;
  body: Localized;
};

export type TypeDescription = {
  typeCode: TypeCode;
  tagline: Localized;
  topics: TypeTopic[];
};

// ───── 問題文 ─────
export type Axis = 'EI' | 'SN' | 'TF' | 'JP';

export type Question = {
  id: string;
  axis: Axis;
  content: Localized;
  optionA: { text: Localized; weight: number };
  optionB: { text: Localized; weight: number };
};

// ───── UI文言 ─────
export type UiStringNode =
  | Localized
  | { [key: string]: UiStringNode };

export type UiStrings = Record<string, UiStringNode>;

// ───── 下書き共通 ─────
export type ContentType = 'type' | 'question' | 'ui-strings';

export type DraftRecord<T = unknown> = {
  contentType: ContentType;
  contentId: string;
  data: T;
  updatedAt: number;
  publishedHash?: string;
};
