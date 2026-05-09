import { cn } from '@/lib/utils';
import type { Locale } from '../shared/types';

const LABELS: Record<Locale, string> = {
  ja: '日本語',
  ko: '한국어',
};

type Props = {
  value: Locale;
  onChange: (lang: Locale) => void;
  missing?: Partial<Record<Locale, boolean>>;
};

export function LangTabs({ value, onChange, missing }: Props) {
  return (
    <div role="tablist" className="inline-flex rounded-lg border border-stone-200 bg-white p-1">
      {(['ja', 'ko'] as const).map(lang => {
        const selected = value === lang;
        return (
          <button
            key={lang}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(lang)}
            className={cn(
              'relative px-4 py-1.5 rounded-md text-sm transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
              selected
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100',
            )}
          >
            {LABELS[lang]}
            {missing?.[lang] && (
              <span
                className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500"
                aria-label="未入力あり"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
