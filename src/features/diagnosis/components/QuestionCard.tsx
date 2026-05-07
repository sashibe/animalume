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

const SWIPE_THRESHOLD = 80;

// Axis-specific accent classes (full strings for Tailwind JIT)
function axisGlowClass(axis: Axis): string {
  if (axis === 'EI') return 'bg-accent-rose/15';
  if (axis === 'SN') return 'bg-accent-sage/15';
  if (axis === 'TF') return 'bg-accent-mist/12';
  return 'bg-accent-gold/12';
}

function axisBorderClass(axis: Axis): string {
  if (axis === 'EI') return 'border-l-accent-rose';
  if (axis === 'SN') return 'border-l-accent-sage';
  if (axis === 'TF') return 'border-l-accent-mist';
  return 'border-l-accent-gold';
}

type Props = {
  question: Question;
  onAnswer: (option: 'A' | 'B', responseTimeMs: number) => void;
  isFirstQuestion: boolean;
};

export function QuestionCard({ question, onAnswer, isFirstQuestion }: Props) {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const startTimeRef = useRef(Date.now());
  const isFirstRef = useRef(isFirstQuestion);
  const controls = useAnimation();
  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 0, 200], [-12, 0, 12]);
  // Left drag → option A, right drag → option B
  const leftOpacity = useTransform(dragX, [-100, -20, 0], [1, 0.3, 0]);
  const rightOpacity = useTransform(dragX, [0, 20, 100], [0, 0.3, 1]);
  const [flashOption, setFlashOption] = useState<'A' | 'B' | null>(null);

  // Shimmy hint on first question (Task 4-2)
  useEffect(() => {
    if (!isFirstRef.current || shouldReduceMotion) return;
    const timer = setTimeout(() => {
      controls.start({
        x: [-3, 3, -3, 3, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [controls, shouldReduceMotion]);

  function elapsed() {
    return Date.now() - startTimeRef.current;
  }

  async function animateAndAnswer(option: 'A' | 'B') {
    setFlashOption(option);
    const ms = elapsed();
    // A flies left, B flies right (matches visual layout)
    const dir = option === 'A' ? -1 : 1;

    if (!shouldReduceMotion) {
      await controls.start({ scale: 0.97, transition: { duration: 0.08 } });
      await controls.start({
        x: dir * 500,
        opacity: 0,
        scale: 0.97,
        transition: { duration: 0.2, ease: 'easeIn' },
      });
    }
    onAnswer(option, ms);
  }

  async function handleDragEnd(
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } },
  ) {
    const { offset, velocity } = info;
    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
      // Drag left → A, drag right → B
      await animateAndAnswer(offset.x < 0 ? 'A' : 'B');
    } else {
      controls.start({
        x: 0,
        scale: 1,
        rotate: 0,
        transition: { type: 'spring', stiffness: 300, damping: 25 },
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
        {/* Drag direction overlays */}
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-accent-rose/15 text-accent-rose text-xs font-medium pointer-events-none"
        >
          ← A
        </motion.div>
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-accent-sage/15 text-accent-sage text-xs font-medium pointer-events-none"
        >
          B →
        </motion.div>

        {/* Draggable card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x: dragX, rotate }}
          animate={controls}
          onDragEnd={handleDragEnd}
          className={cn(
            'relative bg-bg border border-border rounded-2xl p-6 shadow-sm',
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
            <div
              className={cn(
                'absolute -top-10 -left-10 w-44 h-44 rounded-full blur-3xl',
                glowClass,
              )}
            />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-accent-sage/8 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <p className="font-serif text-xl text-ink leading-relaxed mb-8 min-h-[5rem]">
              {question.content}
            </p>

            {/* Options: A (left, swipe left) | B (right, swipe right) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Option A */}
              <button
                type="button"
                onClick={() => animateAndAnswer('A')}
                className={cn(
                  'flex flex-col w-full px-3 py-3.5 rounded-xl border text-sm leading-relaxed',
                  'border-border hover:border-ink-soft hover:bg-bg-subtle transition-all',
                  'active:scale-[0.98]',
                  flashOption === 'A' && 'bg-accent-rose/15 border-accent-rose/40',
                )}
              >
                <span className="leading-relaxed flex-1">{question.optionA.text}</span>
                <ArrowLeft className="w-3.5 h-3.5 text-ink-mute/50 mt-2" />
              </button>

              {/* Option B */}
              <button
                type="button"
                onClick={() => animateAndAnswer('B')}
                className={cn(
                  'flex flex-col items-end w-full px-3 py-3.5 rounded-xl border text-sm leading-relaxed',
                  'border-border hover:border-ink-soft hover:bg-bg-subtle transition-all',
                  'active:scale-[0.98]',
                  flashOption === 'B' && 'bg-accent-sage/15 border-accent-sage/40',
                )}
              >
                <span className="text-right leading-relaxed flex-1">{question.optionB.text}</span>
                <ArrowRight className="w-3.5 h-3.5 text-ink-mute/50 mt-2" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Swipe hint — first question only (Task 4-1) */}
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
