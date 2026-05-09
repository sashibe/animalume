import { useMemo } from 'react';
import { StringRow } from './StringRow';
import { flatten, setAtPath } from './string-helpers';
import type { Locale, UiStrings } from '../shared/types';

type Props = {
  strings: UiStrings;
  onChange: (next: UiStrings) => void;
  lang: Locale;
  query: string;
  filter: 'all' | 'missing' | 'lang-missing';
};

export function StringTree({ strings, onChange, lang, query, filter }: Props) {
  const entries = useMemo(() => flatten(strings), [strings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (q) {
        const hay = `${e.path} ${e.value.ja} ${e.value.ko}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filter === 'missing') {
        return !e.value.ja.trim() || !e.value.ko.trim();
      }
      if (filter === 'lang-missing') {
        return !e.value[lang].trim();
      }
      return true;
    });
  }, [entries, query, filter, lang]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const head = e.segments[0];
      if (!map.has(head)) map.set(head, []);
      map.get(head)!.push(e);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-stone-400 border border-dashed border-stone-200 rounded-lg">
        {query ? `「${query}」に一致するキーがありません` : '表示できるキーがありません'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([groupKey, groupEntries]) => (
        <section key={groupKey} className="rounded-lg border border-stone-200 bg-white overflow-hidden">
          <header className="px-3 py-2 bg-stone-50 border-b border-stone-200">
            <code className="text-xs font-mono text-stone-600">
              {groupKey}
              <span className="text-stone-400 ml-1.5">({groupEntries.length})</span>
            </code>
          </header>
          <div>
            {groupEntries.map((e) => (
              <StringRow
                key={e.path}
                path={e.path}
                value={e.value}
                onChange={(next) => onChange(setAtPath(strings, e.segments, next))}
                lang={lang}
                highlight={query}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
