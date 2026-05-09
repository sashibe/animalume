import { cn } from '@/lib/utils';
import { AXIS_POLES } from './question-helpers';
import type { Axis } from '../shared/types';

const AXES: Axis[] = ['EI', 'SN', 'TF', 'JP'];

type Props = {
  value: Axis;
  onChange: (next: Axis) => void;
};

export function AxisSelector({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="軸" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {AXES.map((axis) => {
        const selected = value === axis;
        return (
          <button
            key={axis}
            role="radio"
            type="button"
            aria-checked={selected}
            onClick={() => onChange(axis)}
            className={cn(
              'rounded-lg border px-3 py-2.5 text-left transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
              selected
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300',
            )}
          >
            <div className="font-mono text-sm font-medium">{axis}</div>
            <div className={cn('text-[11px] mt-0.5', selected ? 'text-stone-300' : 'text-stone-500')}>
              {AXIS_POLES[axis].label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
