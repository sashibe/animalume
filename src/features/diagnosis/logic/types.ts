export type Axis = 'EI' | 'SN' | 'TF' | 'JP';

export const AXES: readonly Axis[] = ['EI', 'SN', 'TF', 'JP'] as const;

export type MbtiType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type Answer = {
  questionId: string;
  axis: Axis;
  selectedOption: 'A' | 'B';
  weight: number;
  responseTimeMs: number;
};

export type AxisScores = {
  EI: number;
  SN: number;
  TF: number;
  JP: number;
};

export type DiagnosisResult = {
  type: MbtiType;
  scores: AxisScores;
  strengths: AxisScores;
  confidence: number;
};
