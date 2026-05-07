import type { Answer, Axis, AxisScores, DiagnosisResult, MbtiType } from './types';
import { AXES } from './types';

function calcAxisScore(answers: Answer[], axis: Axis): number {
  const axisAnswers = answers.filter((a) => a.axis === axis);
  if (axisAnswers.length === 0) return 0;
  const sum = axisAnswers.reduce((acc, a) => acc + a.weight, 0);
  return Math.round((sum / axisAnswers.length) * 100);
}

function determineMbtiType(scores: AxisScores): MbtiType {
  const e = scores.EI >= 0 ? 'E' : 'I';
  const n = scores.SN >= 0 ? 'N' : 'S';
  const f = scores.TF >= 0 ? 'F' : 'T';
  const p = scores.JP >= 0 ? 'P' : 'J';
  return `${e}${n}${f}${p}` as MbtiType;
}

export function buildDiagnosisResult(answers: Answer[]): DiagnosisResult {
  const scores: AxisScores = {
    EI: calcAxisScore(answers, 'EI'),
    SN: calcAxisScore(answers, 'SN'),
    TF: calcAxisScore(answers, 'TF'),
    JP: calcAxisScore(answers, 'JP'),
  };

  const type = determineMbtiType(scores);

  const strengths: AxisScores = {
    EI: Math.abs(scores.EI),
    SN: Math.abs(scores.SN),
    TF: Math.abs(scores.TF),
    JP: Math.abs(scores.JP),
  };

  const confidence =
    AXES.reduce((sum, axis) => sum + strengths[axis], 0) / (AXES.length * 100);

  return { type, scores, strengths, confidence };
}

export function formatAxisScore(axis: Axis, score: number, strength: number): string {
  const labels: Record<Axis, [string, string]> = {
    EI: ['E', 'I'],
    SN: ['N', 'S'],
    TF: ['F', 'T'],
    JP: ['P', 'J'],
  };
  const [positive, negative] = labels[axis];
  const side = score >= 0 ? positive : negative;
  return `${side} ${strength}%`;
}

export type ConfidenceLevel = 'very_high' | 'high' | 'moderate' | 'low';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.75) return 'very_high';
  if (confidence >= 0.55) return 'high';
  if (confidence >= 0.35) return 'moderate';
  return 'low';
}

export function findBorderlineAxes(scores: AxisScores): Axis[] {
  return [...AXES].filter((axis) => Math.abs(scores[axis]) < 25);
}
