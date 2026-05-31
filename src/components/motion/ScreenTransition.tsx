import { useEffect, useState } from 'react';
import { useMotion } from './MotionContext';

type Props = {
  styleVariant?: 'fade' | 'fog' | 'page' | 'ornament';
  routeKey: string;
  children: React.ReactNode;
};

type SlotState = {
  key: string;
  content: React.ReactNode;
  phase: 'in' | 'out';
};

export function ScreenTransition({ styleVariant, routeKey, children }: Props) {
  const m = useMotion();
  const active = !m.enabled || m.enabled.transition !== false;
  const style = styleVariant || m.styles?.transition || 'fade';

  const [current, setCurrent] = useState<SlotState>({ key: routeKey, content: children, phase: 'in' });
  const [overlay, setOverlay] = useState(false);

  useEffect(() => {
    if (current.key === routeKey) {
      setCurrent((c) =>
        c.phase === 'in'
          ? { ...c, content: children }
          : { ...c, content: children, phase: 'in' }
      );
      return;
    }
    if (!active) {
      setCurrent({ key: routeKey, content: children, phase: 'in' });
      return;
    }
    setCurrent((c) => ({ ...c, phase: 'out' }));
    if (style === 'ornament') setOverlay(true);

    const delay =
      style === 'ornament' ? 380 :
      style === 'page' ? 320 :
      style === 'fog' ? 360 : 280;

    const t = setTimeout(() => {
      setCurrent({ key: routeKey, content: children, phase: 'in' });
      if (style === 'ornament') setTimeout(() => setOverlay(false), 600);
    }, delay);
    return () => clearTimeout(t);
  }, [routeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const cls = !active ? '' :
    style === 'fog' ? (current.phase === 'in' ? 'am-trans-fog-in' : 'am-trans-fog-out') :
    style === 'page' ? (current.phase === 'in' ? 'am-trans-page-in' : 'am-trans-page-out') :
    style === 'ornament' ? (current.phase === 'in' ? 'am-trans-orn-in' : 'am-trans-orn-out') :
    (current.phase === 'in' ? 'am-trans-fade-in' : 'am-trans-fade-out');

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div key={current.key} className={cls} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {current.content}
      </div>
      {overlay && style === 'ornament' && <OrnamentSweep />}
    </div>
  );
}

function OrnamentSweep() {
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10,
    }}>
      <div className="am-orn-sweep" style={{
        width: '120%', height: 1,
        background: 'linear-gradient(90deg, transparent 0%, var(--border-strong) 28%, var(--accent-gold) 50%, var(--border-strong) 72%, transparent 100%)',
      }} />
    </div>
  );
}
