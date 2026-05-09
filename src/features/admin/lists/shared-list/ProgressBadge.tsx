import { cn } from '@/lib/utils';
import type { Locale } from '../../shared/types';

type Props = {
  lang: Locale;
  progress: number;
  className?: string;
};

const LABELS: Record<Locale, string> = { ja: '日', ko: '韓' };

export function ProgressBadge({ lang, progress, className }: Props) {
  const percent = Math.round(progress * 100);
  const tone =
    percent === 100 ? 'complete' :
    percent === 0 ? 'empty' : 'partial';

  const cls = {
    complete: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    partial:  'bg-amber-50 text-amber-700 border-amber-200',
    empty:    'bg-stone-50 text-stone-400 border-stone-200',
  }[tone];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono tabular-nums',
        cls,
        className,
      )}
      aria-label={`${lang === 'ja' ? '日本語' : '韓国語'} ${percent}%`}
    >
      <span className="font-medium">{LABELS[lang]}</span>
      <span>{percent}%</span>
    </span>
  );
}
