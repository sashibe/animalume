import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useDiagnosisStore } from '../store';
import { sampleQuestions } from '@/data/questions';
import { buildDiagnosisResult } from '../logic';
import { saveResult } from '../lib/saveResult';
import { QuestionCard } from './QuestionCard';
import type { Answer } from '../logic/types';

const MILESTONES: Record<number, 'milestone_10' | 'milestone_20' | 'milestone_30'> = {
  10: 'milestone_10',
  20: 'milestone_20',
  30: 'milestone_30',
};

export function DiagnosisScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const initRef = useRef(false);
  const [milestoneKey, setMilestoneKey] = useState<string | null>(null);

  const questions = useDiagnosisStore((s) => s.questions);
  const currentIndex = useDiagnosisStore((s) => s.currentIndex);
  const answers = useDiagnosisStore((s) => s.answers);
  const startedAt = useDiagnosisStore((s) => s.startedAt);
  const startDiagnosis = useDiagnosisStore((s) => s.startDiagnosis);
  const recordAnswer = useDiagnosisStore((s) => s.recordAnswer);
  const goBack = useDiagnosisStore((s) => s.goBack);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const locale = i18n.language.startsWith('ko') ? 'ko' : 'ja';
    startDiagnosis(sampleQuestions(locale));
  }, [i18n.language, startDiagnosis]);

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-ink-soft animate-fade-in">{t('common.loading')}</p>
      </div>
    );
  }
  const progress = currentIndex / questions.length;

  function handleAnswer(selectedOption: 'A' | 'B', responseTimeMs: number) {
    const weight =
      selectedOption === 'A'
        ? currentQuestion.optionA.weight
        : currentQuestion.optionB.weight;

    const answer: Answer = {
      questionId: currentQuestion.id,
      axis: currentQuestion.axis,
      selectedOption,
      weight,
      responseTimeMs,
    };

    const newAnswers = [...answers, answer];
    const newIndex = currentIndex + 1;

    recordAnswer(answer);

    const milestoneKey = MILESTONES[newIndex];
    if (milestoneKey) {
      setMilestoneKey(milestoneKey);
      setTimeout(() => setMilestoneKey(null), 3000);
    }

    if (newIndex >= questions.length) {
      const result = buildDiagnosisResult(newAnswers);
      const duration = startedAt ? (Date.now() - startedAt) / 1000 : 0;
      const questionIds = questions.map((q) => q.id);

      saveResult(result, newAnswers, questionIds, duration)
        .then((resultId) => {
          navigate(`/result/${resultId ?? 'local'}`, { state: { result } });
        })
        .catch(() => {
          navigate('/result/local', { state: { result: buildDiagnosisResult(newAnswers) } });
        });
    }
  }

  return (
    <main className="min-h-full safe-top safe-bottom flex flex-col">
      <div className="container-app flex-1 flex flex-col py-8 gap-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="h-[3px] bg-bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-ink rounded-full"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex justify-between text-xs text-ink-mute">
            <span>
              {t('diagnosis.progress', {
                current: currentIndex + 1,
                total: questions.length,
              })}
            </span>
            <span>{Math.round(progress * 100)}%</span>
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={goBack}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 text-sm text-ink-soft disabled:text-ink-mute/60 hover:opacity-70 transition-opacity disabled:cursor-not-allowed mt-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{t('diagnosis.back')}</span>
          </button>
        </div>

        {/* Milestone message */}
        <AnimatePresence>
          {milestoneKey && (
            <motion.div
              key={milestoneKey}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="text-center text-xs text-ink-mute py-1"
            >
              {t(`diagnosis.${milestoneKey}`)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question card */}
        <div className="flex-1 flex items-center py-2">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={handleAnswer}
              isFirstQuestion={currentIndex === 0}
              index={currentIndex + 1}
            />
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
