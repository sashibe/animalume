import type { MbtiType } from '@/features/diagnosis/logic/types';

export const GROUP_OF: Record<MbtiType, 'NT' | 'NF' | 'SJ' | 'SP'> = {
  INTJ: 'NT', INTP: 'NT', ENTJ: 'NT', ENTP: 'NT',
  INFJ: 'NF', INFP: 'NF', ENFJ: 'NF', ENFP: 'NF',
  ISTJ: 'SJ', ISFJ: 'SJ', ESTJ: 'SJ', ESFJ: 'SJ',
  ISTP: 'SP', ISFP: 'SP', ESTP: 'SP', ESFP: 'SP',
};

export const GROUP_ACCENT = {
  NT: { hex: '#A6B4C2', tw: 'accent-mist' },
  NF: { hex: '#D9A5A0', tw: 'accent-rose' },
  SJ: { hex: '#C9A76A', tw: 'accent-gold' },
  SP: { hex: '#A8B5A0', tw: 'accent-sage' },
} as const;
