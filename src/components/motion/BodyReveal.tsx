import { useEffect, useState } from 'react';
import { useMotion } from './MotionContext';

type Variant = 'typewriter' | 'clause' | 'line' | 'bleed';

type Props = {
  variant?: Variant;
  triggerKey?: number;
  speed?: number;
  showCaret?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onDone?: () => void;
  children: React.ReactNode;
};

function extractText(node: React.ReactNode): string {
  if (node == null || node === false || node === true) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in (node as object)) {
    return extractText((node as React.ReactElement).props.children);
  }
  return '';
}

function splitJpClauses(text: string): string[] {
  const out: string[] = [];
  let buf = '';
  for (const c of text) {
    buf += c;
    if (c === '、' || c === '。' || c === '・' || c === ' ' || c === '\n') {
      out.push(buf);
      buf = '';
    }
  }
  if (buf) out.push(buf);
  return out;
}

export function BodyReveal({
  variant,
  triggerKey = 0,
  speed,
  showCaret = true,
  className = '',
  style,
  onDone,
  children,
}: Props) {
  const m = useMotion();
  const resolvedVariant = variant || m.styles?.body || 'bleed';
  const resolvedSpeed = speed ?? m.textSpeed ?? 1;

  const text = extractText(children);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (resolvedVariant !== 'typewriter') return;
    setN(0);
    if (!text.length) return;
    const dur = Math.max(8, 32 / resolvedSpeed);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setN(i);
      if (i >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, dur);
    return () => clearInterval(id);
  }, [text, triggerKey, resolvedSpeed, resolvedVariant]); // eslint-disable-line react-hooks/exhaustive-deps

  if (resolvedVariant === 'typewriter') {
    return (
      <span className={className} style={style}>
        {text.slice(0, n)}
        {showCaret && n < text.length && <span className="am-caret" aria-hidden="true" />}
      </span>
    );
  }

  if (resolvedVariant === 'clause') {
    const parts = splitJpClauses(text);
    const step = Math.max(20, 80 / resolvedSpeed);
    return (
      <span key={triggerKey} className={className} style={style}>
        {parts.map((p, i) => (
          <span key={i} className="am-word-soft"
            style={{ animationDelay: `${i * step}ms`, whiteSpace: 'pre' } as React.CSSProperties}>
            {p}
          </span>
        ))}
      </span>
    );
  }

  if (resolvedVariant === 'line') {
    const lines = text.split(/\n/).filter((l) => l.length > 0);
    const step = Math.max(80, 220 / resolvedSpeed);
    return (
      <div key={triggerKey} className={className} style={style}>
        {lines.map((line, i) => (
          <div key={i} className="am-line-rise"
            style={{ animationDelay: `${i * step}ms`, opacity: 0 } as React.CSSProperties}>
            {line}
          </div>
        ))}
      </div>
    );
  }

  return (
    <span key={triggerKey} className={`am-bleed ${className}`} style={style}>
      {text}
    </span>
  );
}
