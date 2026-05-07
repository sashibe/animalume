import type { MbtiType } from '@/features/diagnosis/logic/types';
import { TYPE_META_JA } from '@/data/types/meta-ja';

export type CharacterVariant = 'standard' | 'shimmer' | 'quiet';

export function getCharacterImageUrl(
  type: MbtiType,
  variant: CharacterVariant = 'standard',
): string {
  const folder = TYPE_META_JA[type].folderName;
  return `/characters/${folder}/${variant}.png`;
}

export function pickVariantFromConfidence(confidence: number): CharacterVariant {
  if (confidence >= 0.75) return 'shimmer';
  if (confidence < 0.4) return 'quiet';
  return 'standard';
}
