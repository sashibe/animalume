import { useState } from 'react';
import {
  getCharacterImageUrl,
  pickVariantFromConfidence,
  type CharacterVariant,
} from '@/lib/character';
import { getTypeMeta } from '@/data/types';
import type { MbtiType } from '@/features/diagnosis/logic/types';
import type { QuestionLocale } from '@/data/questions/types';
import { cn } from '@/lib/cn';

type CharacterImageProps = {
  type: MbtiType;
  confidence?: number;
  variant?: CharacterVariant;
  locale?: QuestionLocale;
  className?: string;
  themed?: boolean;
};

const GROUP_COLOR_CLASSES: Record<string, string> = {
  NT: 'bg-bg-subtle border-accent-mist',
  NF: 'bg-bg-subtle border-accent-rose',
  SJ: 'bg-bg-subtle border-accent-gold',
  SP: 'bg-bg-subtle border-accent-sage',
};

export function CharacterImage({
  type,
  confidence,
  variant: variantProp,
  locale = 'ja',
  className,
  themed = true,
}: CharacterImageProps) {
  const [hasError, setHasError] = useState(false);

  const variant: CharacterVariant =
    variantProp ?? (confidence !== undefined ? pickVariantFromConfidence(confidence) : 'standard');

  const meta = getTypeMeta(type, locale);
  const imageUrl = getCharacterImageUrl(type, variant);

  if (hasError) {
    return (
      <div
        className={cn(
          'aspect-square rounded-2xl border flex flex-col items-center justify-center p-6 transition-all',
          themed ? GROUP_COLOR_CLASSES[meta.groupCode] : 'bg-bg-subtle border-border',
          className,
        )}
        role="img"
        aria-label={`${meta.code} - ${meta.nameJa}`}
      >
        <div className="font-serif text-3xl text-ink mb-2">{meta.code}</div>
        <div className="font-serif text-xl text-ink-soft mb-3">{meta.nameJa}</div>
        <div className="text-xs text-ink-mute text-center max-w-[16rem] leading-relaxed">
          {meta.tagline}
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`${meta.code} - ${meta.nameJa}`}
      className={cn('aspect-square rounded-2xl object-cover', className)}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
