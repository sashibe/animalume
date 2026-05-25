import { cn } from '@/lib/utils';

const PRESET_VALUES = [-1.0, -0.5, 0, 0.5, 1.0] as const;

type Props = {
  value: number;
  onChange: (next: number) => void;
  poleLabel?: string;
};

export function WeightSelector({ value, onChange, poleLabel }: Props) {
  return (
    <div className="space-y-1.5">
      {poleLabel && (
        <p className="text-[11px] text-stone-500">{poleLabel}</p>
      )}
      <div className="flex items-center gap-1">
        {PRESET_VALUES.map((preset) => {
          const selected = Math.abs(value - preset) < 0.01;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={cn(
                'flex-1 rounded-md border px-2 py-1 text-[11px] font-mono tabular-nums transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
                selected
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300',
              )}
            >
              {preset > 0 ? `+${preset.toFixed(1)}` : preset.toFixed(1)}
            </button>
          );
        })}
        <input
          type="number"
          step="0.1"
          min="-1"
          max="1"
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(v);
          }}
          className={cn(
            'w-16 rounded-md border border-stone-200 px-2 py-1 text-[11px] font-mono tabular-nums',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
          )}
          aria-label="寄与度（カスタム値）"
        />
      </div>
    </div>
  );
}
