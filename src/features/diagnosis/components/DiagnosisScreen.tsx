import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { useDiagnosisStore } from '../store';
import { sampleQuestions } from '@/data/questions';
import { buildDiagnosisResult } from '../logic';
import { saveResult } from '../lib/saveResult';
import { QuestionCard } from './QuestionCard';
import { ShaderBackground, AmbientGlyph } from '@/components/motion';
import { useBgm } from '@/hooks/useBgm';
import type { Answer } from '../logic/types';
import type { Axis } from '../logic/types';

const MILESTONES: Record<number, 'milestone_10' | 'milestone_20' | 'milestone_30'> = {
  10: 'milestone_10',
  20: 'milestone_20',
  30: 'milestone_30',
};

const PHASE_BG = ['var(--bg)', 'var(--bg-rose)', 'var(--bg-sage)', 'var(--bg-gold)'];
const PHASE_ACC = [
  'rgba(156,152,143,.2)',
  'rgba(217,165,160,.35)',
  'rgba(168,181,160,.35)',
  'rgba(201,167,106,.35)',
];

// 13種のシェーダーからランダムに次を選ぶ（直前と同じにならないよう除外）
function pickNextVariant(exclude: number): number {
  const total = 13;
  const idx = Math.floor(Math.random() * (total - 1));
  return idx >= exclude ? idx + 1 : idx;
}

export function DiagnosisScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const initRef = useRef(false);
  const [milestoneKey, setMilestoneKey] = useState<string | null>(null);
  // 診断開始時にランダムなシェーダーで始まり、10問ごとに切り替わる
  const [shaderVariant, setShaderVariant] = useState(() => Math.floor(Math.random() * 13));
  // BGM（ループ再生）
  const { muted, toggleMute } = useBgm('/audio/diagnosis.mp3', 0.35);

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
  const phase = Math.min(Math.floor(currentIndex / 10), 3);
  const currentAxis = currentQuestion.axis as Axis;

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
      // 10問ごとにシェーダーをランダム切替（前回と重複しない）
      setShaderVariant((prev) => pickNextVariant(prev));
    }

    if (newIndex >= questions.length) {
      const result = buildDiagnosisResult(newAnswers);
      const duration = startedAt ? (Date.now() - startedAt) / 1000 : 0;
      const questionIds = questions.map((q) => q.id);

      // Race saveResult against a 4-second timeout so navigation always happens
      // even when Firebase Auth hangs (no network / wrong config)
      Promise.race([
        saveResult(result, newAnswers, questionIds, duration),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
      ])
        .then((resultId) => {
          navigate(`/result/${resultId ?? 'local'}`, { state: { result } });
        })
        .catch(() => {
          navigate('/result/local', { state: { result } });
        });
    }
  }

  return (
    <main
      className="min-h-full safe-top safe-bottom flex flex-col"
      style={{
        position: 'relative',
        backgroundColor: PHASE_BG[phase],
        transition: 'background-color 1000ms var(--am-ease)',
        overflow: 'hidden',
      }}
    >
      {/* phase pulse */}
      <div
        key={`phase-${phase}`}
        className="am-phase-pulse"
        style={{
          background: `radial-gradient(circle, ${PHASE_ACC[phase]} 0%, transparent 70%)`,
          inset: '-20%',
        }}
      />

      {/* WebGL shader background — starts random, changes randomly every 10 questions */}
      <ShaderBackground variant={shaderVariant} opacity={0.3} />

      <div className="container-app flex-1 flex flex-col py-8 gap-4" style={{ position: 'relative', zIndex: 1 }}>
        {/* Progress */}
        <div className="space-y-2">
          <div className="h-[3px] bg-bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-ink rounded-full"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-ink-mute">
            <span>
              {t('diagnosis.progress', {
                current: currentIndex + 1,
                total: questions.length,
              })}
            </span>
            <div className="flex items-center gap-3">
              <span>{Math.round(progress * 100)}%</span>
              {/* BGM ミュートボタン */}
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? 'BGMを再生' : 'BGMをミュート'}
                className="text-ink-mute/60 hover:text-ink-mute transition-colors"
              >
                {muted
                  ? <VolumeX className="w-3.5 h-3.5" strokeWidth={1.5} />
                  : <Volume2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                }
              </button>
            </div>
          </div>
          <div className="h-1 bg-bg-muted rounded-full overflow-hidden">
            <div
              className="am-prog-glow h-full rounded-full"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, var(--accent-rose), var(--accent-gold))',
                transition: 'width 500ms var(--am-ease)',
              }}
            />
          </div>

          {/* phase dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: 9999,
                background: phase >= i ? 'var(--accent-gold)' : 'var(--border)',
                transition: 'background 600ms var(--am-ease)',
                display: 'block',
              }} />
            ))}
          </div>

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

        {/* Question area with ambient glyphs */}
        <div className="flex-1 flex flex-col justify-center gap-1 py-2">
          <AmbientGlyph axis={currentAxis} position="top" />
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={handleAnswer}
              isFirstQuestion={currentIndex === 0}
              index={currentIndex + 1}
            />
          </AnimatePresence>
          <AmbientGlyph axis={currentAxis} position="bottom" />
        </div>

        <p className="text-center text-xs text-ink-mute" style={{ position: 'relative', zIndex: 1 }}>
          A / B どちらかを選んでください
        </p>
      </div>
    </main>
  );
}
