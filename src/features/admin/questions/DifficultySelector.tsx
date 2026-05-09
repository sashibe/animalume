import { cn } from '@/lib/utils';
import type { QuestionDifficulty } from '../shared/source-types';

const DIFFICULTIES: { value: QuestionDifficulty; label: string }[] = [
  { value: 'easy',   label: '簡単 (easy)' },
  { value: 'medium', label: '中間 (medium)' },
  { value: 'hard',   label: '難しい (hard)' },
];

type Props = {
  value: QuestionDifficulty;
  onChange: (next: QuestionDifficulty) => void;
};

export function DifficultySelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {DIFFICULTIES.map((d) => {
        const selected = value === d.value;
        return (
          <button
            key={d.value}
            type="button"
            onClick={() => onChange(d.value)}
            className={cn(
              'rounded-lg border px-3 py-2 text-center text-xs transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
              selected
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300',
            )}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}
