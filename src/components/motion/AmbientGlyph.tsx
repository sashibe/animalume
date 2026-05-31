import type { Axis } from '@/features/diagnosis/logic/types';

const AXIS_COLOR: Record<Axis, string> = {
  EI: '#D9A5A0',
  SN: '#A8B5A0',
  TF: '#A6B4C2',
  JP: '#C9A76A',
};

type Props = {
  axis: Axis;
  position: 'top' | 'bottom';
};

export function AmbientGlyph({ axis, position }: Props) {
  const color = AXIS_COLOR[axis];
  const isTop = position === 'top';
  const path = isTop
    ? 'M 6 26 C 32 8, 60 8, 80 22 S 128 36, 154 20'
    : 'M 6 22 Q 26 38, 50 24 T 92 24 T 134 22 L 154 26';
  const length = 220;

  return (
    <div aria-hidden style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: 56, position: 'relative', zIndex: 1,
      transition: 'opacity 600ms var(--am-ease)',
    }}>
      <svg width="160" height="48" viewBox="0 0 160 48" fill="none" style={{ overflow: 'visible' }}>
        <path
          d={path}
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          className="am-stroke-loop"
          style={{
            '--sl': length,
            '--sd': isTop ? '7s' : '8s',
            '--sdl': isTop ? '0s' : '-2.4s',
            '--so': 0.5,
          } as React.CSSProperties}
        />
        <g style={{ transformOrigin: '80px 24px' }}>
          <circle
            cx="80" cy={isTop ? 22 : 26} r="2"
            fill={color} opacity={0.6}
            className="am-ring-breath"
            style={{ animationDelay: isTop ? '0s' : '-2s' }}
          />
          <circle cx="80" cy={isTop ? 22 : 26} r="1.4" fill={color} opacity={0.75} />
        </g>
      </svg>
    </div>
  );
}
