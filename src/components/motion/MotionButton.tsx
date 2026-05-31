import { useRef, useState } from 'react';
import { useMotion } from './MotionContext';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'md' | 'sm';

type Effect = { id: number; x: number; y: number; style: string };

const PARTICLE_COLORS = ['#C9A76A', '#D9A5A0', '#A8B5A0', '#A6B4C2'];

type Props = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  className?: string;
};

export function MotionButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled,
  children,
  onClick,
  style: userStyle,
  className,
}: Props) {
  const m = useMotion();
  const active = !m.enabled || m.enabled.button !== false;
  const motionStyle = (m.styles && m.styles.button) || 'subtle';

  const [effects, setEffects] = useState<Effect[]>([]);
  const idRef = useRef(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (btnRef.current) btnRef.current.style.transform = '';

    if (active && motionStyle !== 'subtle') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++idRef.current;
      setEffects((prev) => [...prev, { id, x, y, style: motionStyle }]);
      setTimeout(() => setEffects((prev) => prev.filter((p) => p.id !== id)), 1200);
    }
    onClick?.(e);
  };

  const base: React.CSSProperties = {
    position: 'relative',
    border: 0,
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    transition: 'opacity .2s, background-color .2s, transform .12s var(--am-ease)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'visible',
    opacity: disabled ? 0.4 : 1,
  };

  const variants: Record<Variant, React.CSSProperties> = {
    primary: { background: 'var(--ink)', color: 'var(--bg)', borderRadius: 9999 },
    outline: { background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: 9999 },
    ghost: { background: 'transparent', color: 'var(--ink-soft)', borderRadius: 8 },
  };

  const sizes: Record<Size, React.CSSProperties> = {
    md: { padding: '13px 30px', fontSize: 14 },
    sm: { padding: '8px 16px', fontSize: 12 },
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      onPointerDown={() => { if (btnRef.current) btnRef.current.style.transform = 'scale(.98)'; }}
      onPointerUp={() => { if (btnRef.current) btnRef.current.style.transform = ''; }}
      onPointerLeave={() => { if (btnRef.current) btnRef.current.style.transform = ''; }}
      disabled={disabled}
      className={className}
      style={{ ...base, ...variants[variant], ...sizes[size], ...(fullWidth ? { width: '100%' } : {}), ...userStyle }}
    >
      {/* ink bloom (clipped) */}
      <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', pointerEvents: 'none' }}>
        {effects.filter((e) => e.style === 'ink').map((e) => (
          <span key={e.id} className="am-ink-bloom" style={{ left: e.x, top: e.y } as React.CSSProperties} />
        ))}
      </span>

      {/* ripple (outside) */}
      {effects.filter((e) => e.style === 'ripple').map((e) => (
        <span key={e.id} className="am-ripple"
          style={{ left: e.x, top: e.y, background: 'radial-gradient(circle, rgba(217,165,160,.55) 0%, rgba(217,165,160,0) 65%)' } as React.CSSProperties} />
      ))}

      {/* particles */}
      {effects.filter((e) => e.style === 'particles').flatMap((e) =>
        [0, 1, 2, 3, 4].map((i) => {
          const ang = (-Math.PI / 2) + (i - 2) * 0.4;
          const dist = 22 + Math.random() * 12;
          return (
            <span key={`${e.id}-${i}`} className="am-pdot"
              style={{
                left: e.x,
                top: e.y,
                background: PARTICLE_COLORS[i % 4],
                '--tx': Math.cos(ang) * dist + 'px',
                '--ty': Math.sin(ang) * dist + 'px',
              } as React.CSSProperties} />
          );
        })
      )}

      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {children}
      </span>
    </button>
  );
}
