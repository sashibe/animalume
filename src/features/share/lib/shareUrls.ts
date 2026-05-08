import type { MbtiType } from '@/features/diagnosis/logic/types';

const SITE_URL = 'https://animalume.web.app';

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

// Kakao Story share URL scheme — SDK 不使用（Login SDK は Phase 5 で別途導入予定）
export function buildKakaoShareUrl(): string {
  return `https://story.kakao.com/share?url=${encodeURIComponent(`${SITE_URL}/`)}`;
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
