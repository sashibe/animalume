import type { MbtiType } from '@/features/diagnosis/logic/types';
import { getShareCardUrl } from '../lib/typeNumberMap';

interface Props {
  type: MbtiType;
  locale: 'ja' | 'ko';
}

export function ShareCardPreview({ type, locale }: Props) {
  const src = getShareCardUrl(type, locale);
  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-editorial">
      <img
        src={src}
        alt={`Animalume ${type}`}
        className="w-full h-full object-cover"
        loading="eager"
      />
    </div>
  );
}
