import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CharacterImage } from '@/components/character/CharacterImage';
import { getTypeMeta } from '@/data/types';
import { getConfidenceLevel, findBorderlineAxes } from '@/features/diagnosis/logic';
import { AXES } from '@/features/diagnosis/logic/types';
import type { DiagnosisResult, Axis } from '@/features/diagnosis/logic/types';
import type { QuestionLocale } from '@/data/questions/types';
import {
  FogReveal,
  HeadingReveal,
  BodyReveal,
  AccordionFx,
  MotionButton,
} from '@/components/motion';

const AXIS_SIDE_LABELS: Record<Axis, [string, string]> = {
  EI: ['E', 'I'],
  SN: ['N', 'S'],
  TF: ['F', 'T'],
  JP: ['P', 'J'],
};

function getAxisStrengthKey(axis: Axis, score: number, strength: number): string {
  if (strength < 25) return `result.details.axis_${axis}_borderline`;
  const [positive, negative] = AXIS_SIDE_LABELS[axis];
  const side = score >= 0 ? positive : negative;
  if (strength >= 75) return `result.details.axis_${axis}_strong_${side}`;
  if (strength >= 45) return `result.details.axis_${axis}_moderate_${side}`;
  return `result.details.axis_${axis}_mild_${side}`;
}

export function ResultScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { resultId } = useParams();
  const { state } = useLocation();
  const result = state?.result as DiagnosisResult | undefined;
  const locale = (i18n.language.startsWith('ko') ? 'ko' : 'ja') as QuestionLocale;
  const [revealKey] = useState(0);

  if (!result) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-ink-soft text-center">{t('common.error')}</p>
        <MotionButton variant="primary" onClick={() => navigate('/')}>
          {t('common.back')}
        </MotionButton>
      </div>
    );
  }

  const meta = getTypeMeta(result.type, locale);
  const level = getConfidenceLevel(result.confidence);
  const borderlineAxes = findBorderlineAxes(result.scores);
  const primaryBorderlineAxis = borderlineAxes[0] ?? null;

  return (
    <main className="min-h-full safe-top safe-bottom flex flex-col">
      <div className="container-app flex-1 flex flex-col py-8 gap-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs text-ink-mute uppercase tracking-widest">
            {t('result.your_type')}
          </p>
          <h1 className="font-serif text-h1 text-ink" style={{ letterSpacing: '0.18em' }}>
            <HeadingReveal variant="tracking" triggerKey={revealKey}>
              {result.type}
            </HeadingReveal>
          </h1>
          <p className="text-ink-soft font-serif text-lg">
            <HeadingReveal variant="tracking" triggerKey={revealKey} style={{ animationDelay: '80ms' }}>
              {meta.nameJa}
            </HeadingReveal>
          </p>
          <p className="text-xs text-ink-mute">
            <HeadingReveal variant="tracking" triggerKey={revealKey} style={{ animationDelay: '160ms' }}>
              {meta.groupJa}
            </HeadingReveal>
          </p>
        </div>

        {/* Character — fog ritual reveal with beam */}
        <div className="flex justify-center" style={{ position: 'relative' }}>
          <FogReveal triggerKey={revealKey}>
            <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden' }}>
              <CharacterImage
                type={result.type}
                confidence={result.confidence}
                locale={locale}
                className="w-full max-w-[280px] mx-auto"
              />
              {/* 09 B — Light beam scan */}
              <div
                key={`beam-${revealKey}`}
                className="am-beam"
                aria-hidden
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(115deg, transparent 35%, rgba(255,253,247,.65) 50%, transparent 65%)',
                  pointerEvents: 'none',
                  animationDelay: '800ms',
                }}
              />
            </div>
          </FogReveal>
        </div>

        {/* Type description */}
        <div className="bg-bg-subtle rounded-2xl p-5 space-y-2">
          <p className="font-serif text-ink leading-relaxed">
            <BodyReveal variant="clause" triggerKey={revealKey} speed={1.8} showCaret={false}>
              {meta.tagline}
            </BodyReveal>
          </p>
          <p className="text-sm text-ink-soft leading-relaxed">
            <BodyReveal variant="clause" triggerKey={revealKey} speed={1.8} showCaret={false}>
              {meta.essence}
            </BodyReveal>
          </p>
        </div>

        {/* Confidence-based main message */}
        <div className="space-y-3">
          <p className="text-sm text-ink leading-relaxed">
            <BodyReveal variant="clause" triggerKey={revealKey} speed={1.8} showCaret={false}>
              {t(`result.message_${level}`, { typeName: meta.nameJa, tagline: meta.tagline })}
            </BodyReveal>
          </p>
          {primaryBorderlineAxis && (
            <p className="text-sm text-ink-soft leading-relaxed">
              {t(`result.borderline_${primaryBorderlineAxis}`)}
            </p>
          )}
        </div>

        {/* Details accordion */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <AccordionFx title={t('result.details.axes_title')}>
            <div className="space-y-3 px-1">
              {AXES.map((axis) => {
                const score = result.scores[axis];
                const strength = result.strengths[axis];
                const strengthKey = getAxisStrengthKey(axis, score, strength);
                return (
                  <div key={axis} className="flex justify-between items-baseline gap-3">
                    <span className="text-xs text-ink-mute shrink-0">
                      {t(`result.details.axis_${axis}_label`)}
                    </span>
                    <span className="text-sm text-ink font-medium text-right">
                      {t(strengthKey)}
                    </span>
                  </div>
                );
              })}
            </div>
          </AccordionFx>

          <AccordionFx title={t('result.details.strengths_title')}>
            <ul className="space-y-2 px-1">
              {meta.strengths.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-soft leading-relaxed">
                  <span className="text-ink-mute shrink-0 mt-0.5">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionFx>

          <AccordionFx title={t('result.details.relationship_title')}>
            <p className="text-sm text-ink-soft leading-relaxed px-1">{meta.relationshipNote}</p>
          </AccordionFx>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-auto pt-2">
          <button
            type="button"
            onClick={() => alert('シェア機能はPhase 2で実装します')}
            className="w-full py-3.5 rounded-xl border border-border text-ink text-sm font-medium hover:bg-bg-subtle transition am-polaroid"
          >
            {t('result.share')}
          </button>
          <MotionButton variant="primary" fullWidth onClick={() => navigate('/diagnosis')}>
            {t('result.retake')}
          </MotionButton>
        </div>

        {resultId && resultId !== 'local' && (
          <p className="text-center text-xs text-ink-mute">ID: {resultId.slice(0, 8)}…</p>
        )}
      </div>
    </main>
  );
}
