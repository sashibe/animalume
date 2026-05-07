import { motion, useReducedMotion } from 'framer-motion';
import { CharacterImage } from '@/components/character/CharacterImage';
import type { MbtiType } from '@/features/diagnosis/logic/types';
import type { QuestionLocale } from '@/data/questions/types';
import { GROUP_OF, GROUP_ACCENT } from '@/lib/group';

type Props = {
  type: MbtiType;
  confidence: number;
  locale: QuestionLocale;
};

export function CharacterFrame({ type, confidence, locale }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const accent = GROUP_ACCENT[GROUP_OF[type]].hex;

  return (
    <div className="relative mx-auto my-8 w-full max-w-sm aspect-square">
      {/* Watercolor glow: group-color radial that bleeds outside the frame */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] blur-3xl opacity-60"
        style={{ background: `radial-gradient(closest-side, ${accent}55, transparent 70%)` }}
      />
      {/* Secondary warm layer */}
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[2rem] blur-2xl opacity-40"
        style={{
          background: `radial-gradient(closest-side at 30% 30%, rgba(217,165,160,0.35), transparent 60%),
                       radial-gradient(closest-side at 70% 70%, rgba(201,180,138,0.28), transparent 60%)`,
        }}
      />
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[1] w-full h-full rounded-3xl overflow-hidden border border-border/70"
      >
        <CharacterImage
          type={type}
          confidence={confidence}
          locale={locale}
          className="w-full h-full object-cover rounded-none"
          themed={false}
        />
      </motion.div>
    </div>
  );
}
