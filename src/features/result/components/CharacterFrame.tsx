import { motion, useReducedMotion } from 'framer-motion';
import { CharacterImage } from '@/components/character/CharacterImage';
import type { MbtiType } from '@/features/diagnosis/logic/types';
import type { QuestionLocale } from '@/data/questions/types';
import { GROUP_OF, GROUP_ACCENT } from '@/lib/group';
import { cn } from '@/lib/cn';

type Props = {
  type: MbtiType;
  confidence: number;
  locale: QuestionLocale;
};

export function CharacterFrame({ type, confidence, locale }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const group = GROUP_OF[type];
  const borderFaint = GROUP_ACCENT[group].borderFaint;

  return (
    <div className="relative mx-auto my-8 w-full max-w-sm aspect-square shadow-editorial">
      {/* Group-color outline just outside the frame */}
      <div
        aria-hidden
        className={cn('absolute -inset-1 rounded-3xl border', borderFaint)}
      />
      {/* Image */}
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[1] w-full h-full rounded-3xl overflow-hidden"
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
