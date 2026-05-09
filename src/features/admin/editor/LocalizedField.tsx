import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { validateText, countChars } from '../shared/validate';
import { getLimit } from '../shared/limits';
import type { Locale, Localized } from '../shared/types';
import type { LimitKind } from '../shared/limits';

type Props = {
  label: string;
  value: Localized;
  onChange: (next: Localized) => void;
  lang: Locale;
  kind: LimitKind;
  multiline?: boolean;
  rows?: number;
  placeholder?: Partial<Record<Locale, string>>;
  hint?: string;
};

export function LocalizedField({
  label, value, onChange, lang, kind,
  multiline = false, rows = 6, placeholder, hint,
}: Props) {
  const id = useId();
  const current = value[lang] ?? '';
  const v = validateText(current, kind, lang);

  const otherLang: Locale = lang === 'ja' ? 'ko' : 'ja';
  const otherEmpty = !(value[otherLang] ?? '').trim();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const next = e.target.value;
    const { max, hard } = getLimit(kind, lang);

    if (hard && countChars(next) > max) {
      const trimmed = [...next].slice(0, max).join('');
      onChange({ ...value, [lang]: trimmed });
      return;
    }
    onChange({ ...value, [lang]: next });
  };

  const inputCls = cn(
    'font-mono text-sm',
    v.status === 'over' && 'border-red-400 focus-visible:ring-red-400',
    v.status === 'warn' && 'border-amber-300',
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-stone-700">
          {label}
        </label>
        <span
          className={cn(
            'text-xs tabular-nums',
            v.status === 'over' && 'text-red-600 font-medium',
            v.status === 'warn' && 'text-amber-600',
            v.status === 'ok' && 'text-stone-400',
          )}
          aria-live="polite"
        >
          {v.count}/{v.limit}
          {v.hard && v.status !== 'ok' && ' ⚠'}
        </span>
      </div>

      {multiline ? (
        <Textarea
          id={id}
          value={current}
          onChange={handleChange}
          rows={rows}
          placeholder={placeholder?.[lang]}
          className={inputCls}
        />
      ) : (
        <Input
          id={id}
          value={current}
          onChange={handleChange}
          placeholder={placeholder?.[lang]}
          className={inputCls}
        />
      )}

      <div className="flex items-center justify-between text-xs">
        {hint && <p className="text-stone-500">{hint}</p>}
        {otherEmpty && (
          <p className="text-amber-600 ml-auto">
            ⚠ {otherLang === 'ko' ? '韓国語' : '日本語'}が未入力
          </p>
        )}
      </div>
    </div>
  );
}
