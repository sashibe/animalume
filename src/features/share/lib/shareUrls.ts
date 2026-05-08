import type { MbtiType } from '@/features/diagnosis/logic/types';

const SITE_URL = 'https://animalume.com';

export function buildXShareUrl(
  type: MbtiType,
  name: string,
  tagline: string,
  locale: 'ja' | 'ko',
): string {
  const text =
    locale === 'ja'
      ? `私のタイプは「${type}・${name}」でした\n${tagline}\n#Animalume #アニマリュム`
      : `나의 타입은「${type}・${name}」였습니다\n${tagline}\n#Animalume #애니말룸`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SITE_URL)}`;
}

export function buildLineShareUrl(): string {
  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(SITE_URL)}`;
}

export function buildShareText(
  type: MbtiType,
  name: string,
  tagline: string,
  locale: 'ja' | 'ko',
): string {
  return locale === 'ja'
    ? `私のタイプは「${type}・${name}」でした\n\n${tagline}\n\n#Animalume #アニマリュム`
    : `나의 타입은「${type}・${name}」였습니다\n\n${tagline}\n\n#Animalume #애니말룸`;
}

// NOTE: Kakao share is intentionally not implemented in Phase 2.
// The legacy URL scheme (story.kakao.com/share) was deprecated by Kakao.
// Proper implementation requires Kakao JavaScript SDK with appkey registration,
// which will be done together with Kakao Login in Phase 5.
// See ADR-0008 for the decision context.
