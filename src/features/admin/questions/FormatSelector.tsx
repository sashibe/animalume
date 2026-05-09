import { cn } from '@/lib/utils';
import type { QuestionFormat } from '../shared/source-types';

const FORMATS: { value: QuestionFormat; label: string; description: string }[] = [
  { value: 'situation', label: 'situation', description: '状況提示型' },
  { value: 'binary',    label: 'binary',    description: '二択型' },
  { value: 'likert',    label: 'likert',    description: 'Likert 尺度' },
];

type Props = {
  value: QuestionFormat;
  onChange: (next: QuestionFormat) => void;
};

export function FormatSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {FORMATS.map((f) => {
        const selected = value === f.value;
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            className={cn(
              'rounded-lg border px-3 py-2 text-left text-xs transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
              selected
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300',
            )}
          >
            <div className="font-mono">{f.label}</div>
            <div className={cn('mt-0.5', selected ? 'text-stone-300' : 'text-stone-500')}>
              {f.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
