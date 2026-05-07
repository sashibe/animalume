import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { CharacterFrame } from './CharacterFrame';
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

function SectionEyebrow({ num, label }: { num: number; label: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-5">
      <span className="font-serif text-sm text-ink-mute tabular-nums">
        — {String(num).padStart(2, '0')} —
      </span>
      <span className="text-[11px] tracking-[0.3em] uppercase text-ink-mute">{label}</span>
    </div>
  );
}

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left text-base font-medium text-ink hover:no-underline hover:opacity-80 transition-opacity"
      >
        {title}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-ink-mute transition-transform duration-300',
            isOpen && 'rotate-180',
          )}
          strokeWidth={1.5}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6">{children}</div>
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
          className="px-6 py-2.5 rounded-full bg-ink text-bg text-sm font-medium"
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
      <div className="container-app flex-1 flex flex-col py-8 animate-slide-up">

        {/* ── Header ── */}
        <header className="text-center pt-2 pb-10">
          <p className="text-[11px] tracking-[0.32em] text-ink-mute uppercase mb-6">
            {t('result.your_type_eyebrow', 'Your Type')}
          </p>
          <h1
            className="font-serif text-ink leading-none mb-6 text-5xl sm:text-6xl"
            style={{ letterSpacing: '0.18em' }}
          >
            {result.type}
          </h1>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span aria-hidden className="block h-px w-6 bg-border-strong" />
            <h2 className="font-serif text-2xl text-ink-soft leading-none">{meta.nameJa}</h2>
            <span aria-hidden className="block h-px w-6 bg-border-strong" />
          </div>
          <p className="text-sm text-ink-mute">{meta.groupJa}</p>
        </header>

        {/* ── Character ── */}
        <CharacterFrame type={result.type} confidence={result.confidence} locale={locale} />

        {/* ── Tagline block ── */}
        <section className="text-center px-2 my-10 space-y-5">
          <p className="font-serif text-xl leading-snug text-ink text-balance">{meta.tagline}</p>
          <div aria-hidden className="flex items-center justify-center gap-1.5">
            <span className="block h-px w-12 bg-border-strong" />
            <span className="block h-1 w-1 rounded-full bg-accent-gold/70" />
            <span className="block h-px w-12 bg-border-strong" />
          </div>
          <p className="text-base leading-relaxed text-ink-soft text-balance">{meta.essence}</p>
        </section>

        {/* ── Page break ── */}
        <div aria-hidden className="my-12 flex items-center gap-3 text-ink-mute">
          <span className="h-px flex-1 bg-border" />
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* ── 01 — Reading ── */}
        <section className="mb-12">
          <SectionEyebrow num={1} label={t('result.section_reading', 'Reading')} />
          <p className="font-serif text-xl leading-snug text-ink mb-3 text-balance">
            {t(`result.message_${level}_lead`, { typeName: meta.nameJa })}
          </p>
          <p className="text-base leading-[1.85] text-ink-soft text-balance">
            {t(`result.message_${level}_body`, { typeName: meta.nameJa, tagline: meta.tagline })}
          </p>
          {primaryBorderlineAxis && (
            <p className="mt-6 text-base leading-[1.85] text-ink-soft text-balance border-l-2 border-border-strong pl-4">
              {t(`result.borderline_${primaryBorderlineAxis}`)}
            </p>
          )}
        </section>

        {/* ── 02 — More ── */}
        <section className="mb-12">
          <SectionEyebrow num={2} label={t('result.section_more', 'More')} />
          <div className="border-y border-border divide-y divide-border">
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
              <ul className="space-y-4 px-1">
                {meta.strengths.map((item, i) => (
                  <li key={i} className="flex gap-3 text-ink-soft leading-relaxed">
                    <span className="text-ink-mute shrink-0" aria-hidden>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </AccordionItem>

            <AccordionItem title={t('result.details.relationship_title')}>
              <p className="text-base text-ink-soft leading-[1.85] text-balance px-1">
                {meta.relationshipNote}
              </p>
            </AccordionItem>
          </div>
        </section>

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3 mt-auto pt-2">
          <button
            type="button"
            onClick={() => alert('シェア機能はPhase 2で実装します')}
            className="w-full py-3.5 rounded-full border border-border text-ink text-sm font-medium hover:bg-bg-subtle transition"
          >
            {t('result.share')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/diagnosis')}
            className="w-full py-3.5 rounded-full bg-ink text-bg text-sm font-medium hover:opacity-90 transition"
          >
            {t('result.retake')}
          </button>
        </div>

        {/* ── Footnote ── */}
        <p className="mt-12 text-center text-xs text-ink-mute italic leading-relaxed">
          {t('result.footnote', '―― タイプは時間と共に変化することもあります')}
        </p>

        {resultId && resultId !== 'local' && (
          <p className="mt-4 text-center text-xs text-ink-mute">ID: {resultId.slice(0, 8)}…</p>
        )}
      </div>
    </main>
  );
}
