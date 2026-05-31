import { useState } from 'react';
import { useMotion } from './MotionContext';

type Accent = 'rose' | 'sage' | 'mist' | 'gold';

type Props = {
  accent?: Accent;
  styleVariant?: 'border' | 'wash' | 'axisBloom';
  onTrigger?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
};

const ACCENT_COLOR: Record<Accent, string> = {
  rose: 'var(--accent-rose)',
  sage: 'var(--accent-sage)',
  mist: 'var(--accent-mist)',
  gold: 'var(--accent-gold)',
};

const ACCENT_RGBA: Record<Accent, string> = {
  rose: 'rgba(217,165,160,.22)',
  sage: 'rgba(168,181,160,.22)',
  mist: 'rgba(166,180,194,.22)',
  gold: 'rgba(201,167,106,.22)',
};

export function OptionFlash({ accent = 'rose', styleVariant, onTrigger, children }: Props) {
  const m = useMotion();
  const active = !m.enabled || m.enabled.option !== false;
  const style = styleVariant || m.styles?.option || 'border';
  const [pulse, setPulse] = useState(0);

  const trigger = (e: React.MouseEvent) => {
    setPulse((n) => n + 1);
    onTrigger?.(e);
  };

  const color = ACCENT_COLOR[accent];
  const rgba = ACCENT_RGBA[accent];

  return (
    <div style={{ position: 'relative' }} onClickCapture={trigger}>
      {active && pulse > 0 && style === 'wash' && (
        <div key={'w' + pulse} className="am-opt-flash"
          style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', '--flash-color': rgba } as React.CSSProperties} />
      )}
      {active && pulse > 0 && style === 'border' && (
        <div key={'b' + pulse} aria-hidden
          style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            border: `1px solid ${color}`,
            animation: 'am-opt-flash 700ms var(--am-ease) both',
            opacity: 0.8,
          }} />
      )}
      {active && pulse > 0 && style === 'axisBloom' && (
        <div key={'a' + pulse} aria-hidden
          style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            background: `radial-gradient(circle at 50% 50%, ${rgba} 0%, transparent 60%)`,
            animation: 'am-opt-flash 900ms var(--am-ease) both',
          }} />
      )}
      {children}
    </div>
  );
}
