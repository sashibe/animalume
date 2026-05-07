import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { CharacterImage } from '@/components/character/CharacterImage';
import { getTypeMeta } from '@/data/types';
import { getConfidenceLevel, findBorderlineAxes } from '@/features/diagnosis/logic';
import { AXES } from '@/features/diagnosis/logic/types';
import type { DiagnosisResult, Axis } from '@/features/diagnosis/logic/types';
import type { QuestionLocale } from '@/data/questions/types';
import { cn } from '@/lib/cn';

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

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-ink hover:opacity-70 transition-opacity"
      >
        {title}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-ink-mute transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ResultScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { resultId } = useParams();
  const { state } = useLocation();
  const result = state?.result as DiagnosisResult | undefined;
  const locale = (i18n.language.startsWith('ko') ? 'ko' : 'ja') as QuestionLocale;

  if (!result) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-ink-soft text-center">{t('common.error')}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-ink text-bg text-sm font-medium"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  const meta = getTypeMeta(result.type, locale);
  const level = getConfidenceLevel(result.confidence);
  const borderlineAxes = findBorderlineAxes(result.scores);
  const primaryBorderlineAxis = borderlineAxes[0] ?? null;

  return (
    <main className="min-h-full safe-top safe-bottom flex flex-col">
      <div className="container-app flex-1 flex flex-col py-8 gap-6 animate-slide-up">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs text-ink-mute uppercase tracking-widest">
            {t('result.your_type')}
          </p>
          <h1 className="font-serif text-h1 text-ink">{result.type}</h1>
          <p className="text-ink-soft font-serif text-lg">{meta.nameJa}</p>
          <p className="text-xs text-ink-mute">{meta.groupJa}</p>
        </div>

        {/* Character */}
        <CharacterImage
          type={result.type}
          confidence={result.confidence}
          locale={locale}
          className="w-full max-w-[280px] mx-auto"
        />

        {/* Type description */}
        <div className="bg-bg-subtle rounded-2xl p-5 space-y-2">
          <p className="font-serif text-ink leading-relaxed">{meta.tagline}</p>
          <p className="text-sm text-ink-soft leading-relaxed">{meta.essence}</p>
        </div>

        {/* Confidence-based main message */}
        <div className="space-y-3">
          <p className="text-sm text-ink leading-relaxed">
            {t(`result.message_${level}`, { typeName: meta.nameJa, tagline: meta.tagline })}
          </p>
          {primaryBorderlineAxis && (
            <p className="text-sm text-ink-soft leading-relaxed">
              {t(`result.borderline_${primaryBorderlineAxis}`)}
            </p>
          )}
        </div>

        {/* Details accordion */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <AccordionItem title={t('result.details.axes_title')}>
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
          </AccordionItem>

          <AccordionItem title={t('result.details.strengths_title')}>
            <ul className="space-y-2 px-1">
              {meta.strengths.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-soft leading-relaxed">
                  <span className="text-ink-mute shrink-0 mt-0.5">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionItem>

          <AccordionItem title={t('result.details.relationship_title')}>
            <p className="text-sm text-ink-soft leading-relaxed px-1">{meta.relationshipNote}</p>
          </AccordionItem>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-auto pt-2">
          <button
            type="button"
            onClick={() => alert('シェア機能はPhase 2で実装します')}
            className="w-full py-3.5 rounded-xl border border-border text-ink text-sm font-medium hover:bg-bg-subtle transition"
          >
            {t('result.share')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/diagnosis')}
            className="w-full py-3.5 rounded-xl bg-ink text-bg text-sm font-medium hover:opacity-90 transition"
          >
            {t('result.retake')}
          </button>
        </div>

        {resultId && resultId !== 'local' && (
          <p className="text-center text-xs text-ink-mute">ID: {resultId.slice(0, 8)}…</p>
        )}
      </div>
    </main>
  );
}
