import { useMemo } from 'react';
import { loadDefaultJapaneseParser } from 'budoux';
import type { Locale } from './types';

const jaParser = loadDefaultJapaneseParser();

// Korean uses CSS word-break: keep-all for natural line breaking;
// BudouX doesn't have a Korean model so we return each word as a chunk.
const koParser = {
  parse: (text: string) => text.split(/(\s+)/).filter(Boolean),
};

const parsers: Record<Locale, { parse: (text: string) => string[] }> = {
  ja: jaParser,
  ko: koParser,
};

type Props = {
  text: string;
  lang: Locale;
  className?: string;
};

export function SmartText({ text, lang, className }: Props) {
  const lines = useMemo(() => {
    return text.split('\n').map(line => parsers[lang].parse(line));
  }, [text, lang]);

  return (
    <span
      className={className}
      style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
    >
      {lines.map((chunks, lineIdx) => (
        <span key={lineIdx}>
          {lineIdx > 0 && <br />}
          {chunks.map((chunk, i) => (
            <span key={i} style={{ display: 'inline-block' }}>{chunk}</span>
          ))}
        </span>
      ))}
    </span>
  );
}
