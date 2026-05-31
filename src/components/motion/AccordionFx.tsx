import { useState } from 'react';
import { useMotion } from './MotionContext';

type Props = {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  styleVariant?: 'subtle' | 'bloom' | 'fold';
};

export function AccordionFx({ icon, title, children, defaultOpen = false, styleVariant }: Props) {
  const m = useMotion();
  const active = !m.enabled || m.enabled.accordion !== false;
  const style = styleVariant || m.styles?.accordion || 'subtle';

  const [open, setOpen] = useState(defaultOpen);
  const [bloom, setBloom] = useState(0);

  const onToggle = () => {
    setOpen((v) => !v);
    if (active && style === 'bloom') setBloom((n) => n + 1);
  };

  const transition = active
    ? 'max-height 380ms var(--am-ease), opacity 380ms var(--am-ease), transform 380ms var(--am-ease)'
    : 'none';

  const transform =
    active && style === 'fold' && !open ? 'translateY(-6px)' : 'none';

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: 'relative',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', background: 'transparent', border: 0,
          padding: '18px 4px', color: 'var(--ink)',
          fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          {icon && <span style={{ color: 'var(--ink-mute)', display: 'inline-flex' }}>{icon}</span>}
          {title}
        </span>
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          {active && style === 'bloom' && bloom > 0 && (
            <span key={'cb' + bloom} className="am-chev-bloom" style={{ left: -6, top: -6 } as React.CSSProperties} />
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-mute)" strokeWidth="1.5"
            style={{
              transform: open ? 'rotate(180deg)' : 'none',
              transition: active ? 'transform 300ms var(--am-ease)' : 'none',
            }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      <div style={{
        maxHeight: open ? 600 : 0,
        opacity: open ? 1 : 0,
        transform,
        overflow: 'hidden',
        transition,
      }}>
        <div style={{ padding: '0 4px 20px', color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.85 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
