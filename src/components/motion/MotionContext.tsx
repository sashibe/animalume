import { createContext, useContext } from 'react';

export type MotionStyles = {
  button?: 'subtle' | 'ink' | 'ripple' | 'particles';
  reveal?: 'subtle' | 'mask' | 'ritual';
  transition?: 'fade' | 'fog' | 'page' | 'ornament';
  option?: 'border' | 'wash' | 'axisBloom';
  accordion?: 'subtle' | 'bloom' | 'fold';
  heading?: 'fog' | 'mistWipe' | 'tracking' | 'letterFog' | 'wordRise';
  body?: 'typewriter' | 'clause' | 'line' | 'bleed';
};

export type MotionValue = {
  styles?: MotionStyles;
  enabled?: Record<string, boolean>;
  textSpeed?: number;
  sfx?: boolean;
};

export const DEFAULT_MOTION: MotionValue = {
  styles: {
    button: 'particles',
    reveal: 'ritual',
    transition: 'fog',
    option: 'border',
    accordion: 'bloom',
    heading: 'tracking',
    body: 'clause',
  },
  textSpeed: 1.8,
};

const MotionCtx = createContext<MotionValue | null>(null);

export function useMotion(): MotionValue {
  return useContext(MotionCtx) ?? { styles: {}, enabled: {}, sfx: false };
}

export function MotionProvider({
  value,
  children,
}: {
  value: MotionValue;
  children: React.ReactNode;
}) {
  return <MotionCtx.Provider value={value}>{children}</MotionCtx.Provider>;
}
