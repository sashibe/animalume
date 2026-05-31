type Variant = 'fog' | 'mistWipe' | 'tracking' | 'letterFog' | 'wordRise';

type Props = {
  variant?: Variant;
  triggerKey?: number;
  as?: keyof JSX.IntrinsicElements;
  perCharDelay?: number;
  perWordDelay?: number;
  className?: string;
  style?: React.CSSProperties;
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

export function HeadingReveal({
  variant = 'fog',
  triggerKey = 0,
  as: As = 'span',
  perCharDelay = 32,
  perWordDelay = 80,
  className = '',
  style,
  children,
}: Props) {
  const text = extractText(children);
  const Tag = As as React.ElementType;

  if (variant === 'fog') {
    return <Tag key={triggerKey} className={`am-head-fog ${className}`} style={style}>{text}</Tag>;
  }
  if (variant === 'mistWipe') {
    return <Tag key={triggerKey} className={`am-head-mist ${className}`} style={style}>{text}</Tag>;
  }
  if (variant === 'tracking') {
    return <Tag key={triggerKey} className={`am-head-tracking ${className}`} style={style}>{text}</Tag>;
  }
  if (variant === 'letterFog') {
    return (
      <Tag key={triggerKey} className={className} style={style}>
        {Array.from(text).map((c, i) => (
          <span key={i} className="am-char-fog"
            style={{ animationDelay: `${i * perCharDelay}ms`, whiteSpace: 'pre' } as React.CSSProperties}
            aria-hidden={i > 0 ? true : undefined}>
            {c === ' ' ? ' ' : c}
          </span>
        ))}
      </Tag>
    );
  }
  if (variant === 'wordRise') {
    return (
      <Tag key={triggerKey} className={className} style={style}>
        {splitJpClauses(text).map((p, i) => (
          <span key={i} className="am-word-rise"
            style={{ animationDelay: `${i * perWordDelay}ms`, whiteSpace: 'pre' } as React.CSSProperties}>
            {p}
          </span>
        ))}
      </Tag>
    );
  }
  return <Tag key={triggerKey} className={className} style={style}>{text}</Tag>;
}
