import type { Localized } from './types';

// ───── Question 統合形式 ─────

export type QuestionFormat = 'situation' | 'binary' | 'likert';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type Axis = 'EI' | 'SN' | 'TF' | 'JP';

/**
 * 既存の Question 型に対応するエディタ統合形式。
 * locale フィールドはなく、content / optionA.text / optionB.text が Localized になる。
 */
export type SourceQuestion = {
  id: string;
  axis: Axis;
  format: QuestionFormat;
  content: Localized;
  optionA: { text: Localized; weight: number };
  optionB: { text: Localized; weight: number };
  active: boolean;
  difficulty: QuestionDifficulty;
  tags: string[];
};

// ───── TypeMeta 統合形式 ─────

export type MbtiType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type GroupCode = 'NT' | 'NF' | 'SJ' | 'SP';

/**
 * 既存の TypeMeta 型に対応するエディタ統合形式。
 * name/group/tagline/essence/strengths/relationshipNote を Localized にまとめる。
 * groupCode と folderName は言語によらず固定。
 */
export type SourceTypeMeta = {
  code: MbtiType;
  groupCode: GroupCode;
  folderName: string;
  name: Localized;
  group: Localized;
  tagline: Localized;
  essence: Localized;
  strengths: Localized[];
  relationshipNote: Localized;
};
