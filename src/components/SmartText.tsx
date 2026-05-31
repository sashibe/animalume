import { useMemo } from 'react';
import { loadDefaultJapaneseParser } from 'budoux';

const jaParser = loadDefaultJapaneseParser();

// Korean uses CSS word-break: keep-all; BudouX has no Korean model.
const koParser = {
  parse: (text: string) => text.split(/(\s+)/).filter(Boolean),
};

type Lang = 'ja' | 'ko';

const parsers: Record<Lang, { parse: (text: string) => string[] }> = {
  ja: jaParser,
  ko: koParser,
};

type Part =
  | { kind: 'paren'; text: string }
  | { kind: 'normal'; chunks: string[] };

function parseLineWithParens(line: string, lang: Lang): Part[] {
  const regex = /([（(][^）)]*[）)])/g;
  const parts: Part[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ kind: 'normal', chunks: parsers[lang].parse(line.slice(lastIndex, match.index)) });
    }
    parts.push({ kind: 'paren', text: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    parts.push({ kind: 'normal', chunks: parsers[lang].parse(line.slice(lastIndex)) });
  }
  if (parts.length === 0) {
    parts.push({ kind: 'normal', chunks: parsers[lang].parse(line) });
  }
  return parts;
}

type Props = {
  text: string;
  lang: Lang;
  className?: string;
};

export function SmartText({ text, lang, className }: Props) {
  const lines = useMemo(() => {
    return text.split('\n').map((line) => parseLineWithParens(line, lang));
  }, [text, lang]);

  return (
    <span
      className={className}
      style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
    >
      {lines.map((parts, lineIdx) => (
        <span key={lineIdx}>
          {lineIdx > 0 && <br />}
          {parts.map((part, partIdx) =>
            part.kind === 'paren' ? (
              <span key={partIdx} style={{ whiteSpace: 'nowrap' }}>
                {part.text}
              </span>
            ) : (
              part.chunks.map((chunk, chunkIdx) => (
                <span key={`${partIdx}-${chunkIdx}`} style={{ display: 'inline-block' }}>
                  {chunk}
                </span>
              ))
            ),
          )}
        </span>
      ))}
    </span>
  );
}
