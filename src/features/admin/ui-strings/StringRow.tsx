import { useState } from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocalizedField } from '../editor/LocalizedField';
import { inferLimitKind } from './string-helpers';
import type { Locale, Localized } from '../shared/types';

type Props = {
  path: string;
  value: Localized;
  onChange: (next: Localized) => void;
  lang: Locale;
  highlight?: string;
};

export function StringRow({ path, value, onChange, lang, highlight }: Props) {
  const [open, setOpen] = useState(!!highlight);
  const kind = inferLimitKind(path);
  const otherLang: Locale = lang === 'ja' ? 'ko' : 'ja';
  const missing = !value[lang]?.trim();
  const otherMissing = !value[otherLang]?.trim();

  const segments = path.split('.');
  const last = segments.pop()!;
  const prefix = segments.join('.');

  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 text-left',
          'hover:bg-stone-50 transition-colors',
          'focus-visible:outline-none focus-visible:bg-stone-50',
          open && 'bg-stone-50',
        )}
      >
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 text-stone-400 shrink-0 transition-transform',
            open && 'rotate-90',
          )}
        />

        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <code className="text-[11px] font-mono text-stone-400 shrink-0">
            {prefix && <>{prefix}.</>}
            <span className="text-stone-700">{last}</span>
          </code>
          <span
            className={cn(
              'text-sm truncate',
              missing ? 'text-stone-300 italic' : 'text-stone-700',
            )}
          >
            {missing ? '(未入力)' : value[lang]}
          </span>
        </div>

        {(missing || otherMissing) && (
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" aria-label="未入力あり" />
        )}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 bg-stone-50/50">
          <LocalizedField
            label={last}
            value={value}
            onChange={onChange}
            lang={lang}
            kind={kind}
          />
        </div>
      )}
    </div>
  );
}
