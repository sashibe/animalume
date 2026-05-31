import { useMemo } from 'react';
import type { Axis } from '@/features/diagnosis/logic/types';

const AXIS_COLOR: Record<Axis, string> = {
  EI: '#D9A5A0',
  SN: '#A8B5A0',
  TF: '#A6B4C2',
  JP: '#C9A76A',
};

type Props = { axis: Axis };

function seededRng(seed: number) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

export function AmbientField({ axis }: Props) {
  const color = AXIS_COLOR[axis];

  const motes = useMemo(() => {
    const r = seededRng(11);
    return Array.from({ length: 9 }, () => ({
      left: 6 + r() * 88,
      top: 55 + r() * 40,
      size: 3 + r() * 3,
      mx: (r() - 0.5) * 40,
      my: -110 - r() * 80,
      md: 8 + r() * 6,
      mdl: -r() * 12,
      mo: 0.35 + r() * 0.35,
    }));
  }, [axis]);

  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      zIndex: 0,
    }}>
      <div className="am-blob-drift-a" style={{
        position: 'absolute', top: '-12%', left: '-18%',
        width: 280, height: 280, borderRadius: 9999,
        background: color, opacity: 0.09, filter: 'blur(48px)',
        transition: 'background 800ms var(--am-ease)',
      }} />
      <div className="am-blob-drift-b" style={{
        position: 'absolute', bottom: '-14%', right: '-20%',
        width: 240, height: 240, borderRadius: 9999,
        background: color, opacity: 0.07, filter: 'blur(56px)',
        transition: 'background 800ms var(--am-ease)',
      }} />
      <div className="am-blob-drift-c" style={{
        position: 'absolute', top: '38%', right: '-6%',
        width: 120, height: 120, borderRadius: 9999,
        background: color, opacity: 0.05, filter: 'blur(28px)',
        transition: 'background 800ms var(--am-ease)',
      }} />
      {motes.map((m, i) => (
        <span key={i} className="am-mote" style={{
          left: `${m.left}%`,
          top: `${m.top}%`,
          width: m.size,
          height: m.size,
          background: color,
          '--mx': `${m.mx}px`,
          '--my': `${m.my}px`,
          '--md': `${m.md}s`,
          '--mdl': `${m.mdl}s`,
          '--mo': m.mo,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}
