import { create } from 'zustand';
import type { Answer } from './logic/types';
import type { Question } from '@/data/questions/types';

type DiagnosisStore = {
  questions: Question[];
  currentIndex: number;
  answers: Answer[];
  startedAt: number | null;

  startDiagnosis: (questions: Question[]) => void;
  recordAnswer: (answer: Answer) => void;
  goBack: () => void;
  reset: () => void;
};

export const useDiagnosisStore = create<DiagnosisStore>()((set) => ({
  questions: [],
  currentIndex: 0,
  answers: [],
  startedAt: null,

  startDiagnosis: (questions) =>
    set({ questions, currentIndex: 0, answers: [], startedAt: Date.now() }),

  recordAnswer: (answer) =>
    set((s) => ({
      answers: [...s.answers, answer],
      currentIndex: s.currentIndex + 1,
    })),

  goBack: () =>
    set((s) => {
      if (s.currentIndex === 0) return s;
      return {
        currentIndex: s.currentIndex - 1,
        answers: s.answers.slice(0, s.currentIndex - 1),
      };
    }),

  reset: () =>
    set({ questions: [], currentIndex: 0, answers: [], startedAt: null }),
}));
