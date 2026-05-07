import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  useReducedMotion,
} from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Question } from '@/data/questions/types';
import type { Axis } from '@/features/diagnosis/logic/types';

const SWIPE_THRESHOLD = 100;

function axisGlowClass(axis: Axis): string {
  if (axis === 'EI') return 'bg-accent-rose/15';
  if (axis === 'SN') return 'bg-accent-sage/15';
  if (axis === 'TF') return 'bg-accent-mist/12';
  return 'bg-accent-gold/12';
}

function axisBorderClass(axis: Axis): string {
  if (axis === 'EI') return 'border-l-accent-rose/30';
  if (axis === 'SN') return 'border-l-accent-sage/30';
  if (axis === 'TF') return 'border-l-accent-mist/30';
  return 'border-l-accent-gold/30';
}

type Props = {
  question: Question;
  onAnswer: (option: 'A' | 'B', responseTimeMs: number) => void;
  isFirstQuestion: boolean;
  index: number;
};

export function QuestionCard({ question, onAnswer, isFirstQuestion, index }: Props) {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const startTimeRef = useRef(Date.now());
  const isFirstRef = useRef(isFirstQuestion);
  const controls = useAnimation();
  const dragX = useMotionValue(0);
  // Free 2D drag: rotation tracks x position
  const rotate = useTransform(dragX, [-200, 0, 200], [-15, 0, 15]);
  // Option border highlights: driven by x position, no React re-renders
  const aHighlight = useTransform(dragX, [-100, 0], [1, 0]);
  const bHighlight = useTransform(dragX, [0, 100], [0, 1]);
  const [flashOption, setFlashOption] = useState<'A' | 'B' | null>(null);

  // Shimmy hint on first question
  useEffect(() => {
    if (!isFirstRef.current || shouldReduceMotion) return;
    const timer = setTimeout(() => {
      controls.start({
        x: [-6, 6, -6, 6, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [controls, shouldReduceMotion]);

  function elapsed() {
    return Date.now() - startTimeRef.current;
  }

  // Called on button tap
  async function animateAndAnswer(option: 'A' | 'B') {
    setFlashOption(option);
    const ms = elapsed();
    const dir = option === 'A' ? -1 : 1;
    if (!shouldReduceMotion) {
      await controls.start({ scale: 0.97, transition: { duration: 0.08 } });
      await controls.start({
        x: dir * 600,
        opacity: 0,
        scale: 0.97,
        transition: { duration: 0.22, ease: 'easeIn' },
      });
    }
    onAnswer(option, ms);
  }

  async function handleDragEnd(
    _: unknown,
    info: { offset: { x: number; y: number }; velocity: { x: number } },
  ) {
    const { offset, velocity } = info;
    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
      const option = offset.x < 0 ? 'A' : 'B';
      setFlashOption(option);
      const ms = elapsed();
      if (!shouldReduceMotion) {
        // Fly in the direction of the throw, carrying y drift
        await controls.start({
          x: offset.x < 0 ? -1400 : 1400,
          y: offset.y * 1.5,
          opacity: 0,
          transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
        });
      }
      onAnswer(option, ms);
    } else {
      // Spring back to resting position
      controls.start({
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 400, damping: 28 },
      });
    }
  }

  const glowClass = axisGlowClass(question.axis);
  const borderClass = axisBorderClass(question.axis);

  return (
    <motion.div
      className="w-full"
      initial={shouldReduceMotion ? undefined : { x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="relative select-none touch-none">
        {/* Draggable card — free 2D drag, full finger tracking */}
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={1}
          dragMomentum={false}
          style={{ x: dragX, rotate }}
          animate={controls}
          onDragEnd={handleDragEnd}
          className={cn(
            'relative bg-bg border border-border rounded-2xl p-6 shadow-soft',
            'cursor-grab active:cursor-grabbing',
            'border-l-[3px]',
            borderClass,
          )}
        >
          {/* Watercolor blobs */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
            aria-hidden="true"
          >
            <div className={cn('absolute -top-10 -left-10 w-44 h-44 rounded-full blur-3xl', glowClass)} />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-accent-sage/8 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <p className="text-[11px] tracking-[0.3em] uppercase text-ink-mute mb-4">
              — Q.{String(index).padStart(2, '0')} —
            </p>
            <p className="font-serif text-xl text-ink leading-relaxed mb-8 min-h-[5rem]">
              {question.content}
            </p>

            {/* Options: A (left / swipe left) | B (right / swipe right) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Option A */}
              <button
                type="button"
                onClick={() => animateAndAnswer('A')}
                className={cn(
                  'relative flex flex-col w-full px-3 py-3.5 rounded-xl border text-sm leading-relaxed',
                  'border-border hover:border-ink-soft hover:bg-bg-subtle transition-all',
                  'active:scale-[0.98]',
                  flashOption === 'A' && 'bg-accent-rose/15 border-accent-rose/40',
                )}
              >
                {/* Drag-highlight overlay — rose border fades in as card moves left */}
                <motion.div
                  className="absolute inset-0 rounded-xl border border-accent-rose pointer-events-none"
                  style={{ opacity: aHighlight }}
                />
                <span className="leading-relaxed flex-1">{question.optionA.text}</span>
                <ArrowLeft className="w-3.5 h-3.5 text-ink-mute/50 mt-2" />
              </button>

              {/* Option B */}
              <button
                type="button"
                onClick={() => animateAndAnswer('B')}
                className={cn(
                  'relative flex flex-col items-end w-full px-3 py-3.5 rounded-xl border text-sm leading-relaxed',
                  'border-border hover:border-ink-soft hover:bg-bg-subtle transition-all',
                  'active:scale-[0.98]',
                  flashOption === 'B' && 'bg-accent-sage/15 border-accent-sage/40',
                )}
              >
                {/* Drag-highlight overlay — sage border fades in as card moves right */}
                <motion.div
                  className="absolute inset-0 rounded-xl border border-accent-sage pointer-events-none"
                  style={{ opacity: bHighlight }}
                />
                <span className="text-right leading-relaxed flex-1">{question.optionB.text}</span>
                <ArrowRight className="w-3.5 h-3.5 text-ink-mute/50 mt-2" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Swipe hint — first question only */}
      {isFirstQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex items-center gap-1.5 text-xs text-ink-mute justify-center pt-3"
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>{t('diagnosis.swipe_hint')}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
