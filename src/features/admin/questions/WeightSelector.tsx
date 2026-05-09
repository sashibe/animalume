import { cn } from '@/lib/utils';

const WEIGHTS = [1, 2, 3] as const;

type Props = {
  value: number;
  onChange: (next: number) => void;
  poleLabel: string;
};

export function WeightSelector({ value, onChange, poleLabel }: Props) {
  const abs = Math.abs(value);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-500 w-24 shrink-0">{poleLabel} 寄与度</span>
      <div className="flex gap-1">
        {WEIGHTS.map((w) => {
          const selected = abs === w;
          return (
            <button
              key={w}
              type="button"
              onClick={() => onChange(value < 0 ? -w : w)}
              className={cn(
                'h-7 w-9 rounded text-xs font-mono transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
                selected
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
              )}
              aria-pressed={selected}
            >
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}
