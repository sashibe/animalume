import { useEffect } from 'react';
import { useMotion } from './MotionContext';

const RITUAL_COLORS = ['#C9A76A', '#D9A5A0', '#A8B5A0', '#A6B4C2'];

type Props = {
  styleVariant?: 'subtle' | 'mask' | 'ritual';
  triggerKey?: number;
  decor?: boolean;
  children: React.ReactNode;
};

export function FogReveal({ styleVariant, triggerKey = 0, decor = true, children }: Props) {
  const m = useMotion();
  const active = !m.enabled || m.enabled.reveal !== false;
  const style = styleVariant || m.styles?.reveal || 'subtle';

  useEffect(() => {
    // placeholder for future sfx hook
  }, [triggerKey]);

  if (!active) return <div style={{ position: 'relative' }}>{children}</div>;

  const cls =
    style === 'mask' ? 'am-fog-mask' :
    style === 'ritual' ? 'am-fog-ritual' :
    'am-fog-subtle';

  const showRitual = decor && style === 'ritual';

  return (
    <div key={triggerKey} style={{ position: 'relative' }}>
      <div className={cls}>{children}</div>

      {style === 'mask' && (
        <div aria-hidden className="am-veil" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(115deg, rgba(244,242,236,.85) 32%, rgba(244,242,236,0) 64%)',
          borderRadius: 'inherit',
        }} />
      )}

      {showRitual && (
        <>
          <div aria-hidden className="am-veil" style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 40%, rgba(250,249,246,.7) 0%, rgba(250,249,246,.4) 50%, transparent 80%)',
            borderRadius: 'inherit',
          }} />
          <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="am-particle"
                style={{
                  left: `${12 + (i * 11) % 76}%`,
                  bottom: 0,
                  background: RITUAL_COLORS[i % 4],
                  '--pd': `${1800 + (i % 3) * 400}ms`,
                  '--pdl': `${i * 180}ms`,
                  '--po': 0.7,
                  '--px': `${(i % 2 ? 1 : -1) * (4 + (i % 3) * 3)}px`,
                } as React.CSSProperties} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
