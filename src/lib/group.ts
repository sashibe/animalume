import type { MbtiType } from '@/features/diagnosis/logic/types';

export const GROUP_OF: Record<MbtiType, 'NT' | 'NF' | 'SJ' | 'SP'> = {
  INTJ: 'NT', INTP: 'NT', ENTJ: 'NT', ENTP: 'NT',
  INFJ: 'NF', INFP: 'NF', ENFJ: 'NF', ENFP: 'NF',
  ISTJ: 'SJ', ISFJ: 'SJ', ESTJ: 'SJ', ESFJ: 'SJ',
  ISTP: 'SP', ISFP: 'SP', ESTP: 'SP', ESFP: 'SP',
};

export const GROUP_ACCENT = {
  NT: {
    hex: '#A6B4C2',
    tw: 'accent-mist',
    borderFaint: 'border-accent-mist/20',
    borderMid: 'border-accent-mist/30',
  },
  NF: {
    hex: '#D9A5A0',
    tw: 'accent-rose',
    borderFaint: 'border-accent-rose/20',
    borderMid: 'border-accent-rose/30',
  },
  SJ: {
    hex: '#C9A76A',
    tw: 'accent-gold',
    borderFaint: 'border-accent-gold/20',
    borderMid: 'border-accent-gold/30',
  },
  SP: {
    hex: '#A8B5A0',
    tw: 'accent-sage',
    borderFaint: 'border-accent-sage/20',
    borderMid: 'border-accent-sage/30',
  },
} as const;
