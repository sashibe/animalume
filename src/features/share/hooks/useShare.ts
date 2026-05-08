import type { MbtiType } from '@/features/diagnosis/logic/types';
import { getShareCardUrl } from '../lib/typeNumberMap';
import { buildShareText } from '../lib/shareUrls';

export function useShare() {
  function canNativeShare(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.share;
  }

  async function nativeShare(
    type: MbtiType,
    name: string,
    tagline: string,
    locale: 'ja' | 'ko',
  ): Promise<boolean> {
    if (!navigator.share) return false;

    const imageUrl = getShareCardUrl(type, locale);
    const text = buildShareText(type, name, tagline, locale);

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `animalume-${type.toLowerCase()}.png`, {
        type: 'image/png',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Animalume — ${type}`,
          text,
          url: 'https://animalume.com',
        });
      } else {
        await navigator.share({
          title: `Animalume — ${type}`,
          text,
          url: 'https://animalume.com',
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  async function saveImage(type: MbtiType, locale: 'ja' | 'ko'): Promise<void> {
    const imageUrl = getShareCardUrl(type, locale);
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `animalume-${type.toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  }

  return { canNativeShare, nativeShare, saveImage };
}
