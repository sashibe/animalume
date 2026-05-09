import type { MbtiType } from '@/features/diagnosis/logic/types';

const TYPE_NUMBERS: Record<MbtiType, string> = {
  INTJ: '01', INTP: '02', ENTJ: '03', ENTP: '04',
  INFJ: '05', INFP: '06', ENFJ: '07', ENFP: '08',
  ISTJ: '09', ISFJ: '10', ESTJ: '11', ESFJ: '12',
  ISTP: '13', ISFP: '14', ESTP: '15', ESFP: '16',
};

export function getShareCardUrl(type: MbtiType, locale: 'ja' | 'ko'): string {
  const num = TYPE_NUMBERS[type];
  const code = type.toLowerCase();
  return `/share-cards/${num}${code}-${locale}.png`;
}
