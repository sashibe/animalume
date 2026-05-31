import { useMemo } from 'react';

type Props = { count?: number };

function seededRng(seed: number) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

export function AmbientPetals({ count = 12 }: Props) {
  const petals = useMemo(() => {
    const r = seededRng(42);
    return Array.from({ length: count }, () => ({
      left: r() * 100,
      top: r() * 30,
      tx: (r() - 0.5) * 120,
      ty: 220 + r() * 120,
      tr: 120 + r() * 240,
      pd: 6 + r() * 5,
      pdl: -(r() * 8),
      po: 0.4 + r() * 0.35,
    }));
  }, [count]);

  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
    }}>
      {petals.map((p, i) => (
        <span key={i} className="am-petal" style={{
          left: `${p.left}%`,
          top: `${p.top}%`,
          '--tx': `${p.tx}px`,
          '--ty': `${p.ty}px`,
          '--tr': `${p.tr}deg`,
          '--pd': `${p.pd}s`,
          '--pdl': `${p.pdl}s`,
          '--po': p.po,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}
