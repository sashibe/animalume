/**
 * JS の値を TS リテラル文字列に整形する。
 *
 * - 文字列はシングルクォート（内部のシングルクォートはエスケープ）
 * - 文字列内の \n は実際の改行ではなく \n エスケープのまま保持
 * - オブジェクトはプロパティ順を維持（Object.entries 順）
 * - 配列は要素ごとに改行
 * - インデントは 2 スペース
 */

export function formatTsLiteral(value: unknown, indent = 0): string {
  return formatValue(value, indent);
}

function formatValue(value: unknown, indent: number): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return formatString(value);
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    return formatArray(value, indent);
  }

  if (typeof value === 'object') {
    return formatObject(value as Record<string, unknown>, indent);
  }

  return 'null';
}

function formatString(str: string): string {
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return `'${escaped}'`;
}

function formatArray(arr: unknown[], indent: number): string {
  if (arr.length === 0) return '[]';
  const childIndent = indent + 2;
  const pad = ' '.repeat(childIndent);
  const closePad = ' '.repeat(indent);
  const items = arr.map((item) => `${pad}${formatValue(item, childIndent)}`);
  return `[\n${items.join(',\n')},\n${closePad}]`;
}

function formatObject(obj: Record<string, unknown>, indent: number): string {
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';
  const childIndent = indent + 2;
  const pad = ' '.repeat(childIndent);
  const closePad = ' '.repeat(indent);
  const lines = entries.map(([key, val]) => {
    const formattedKey = isValidIdentifier(key) ? key : formatString(key);
    return `${pad}${formattedKey}: ${formatValue(val, childIndent)}`;
  });
  return `{\n${lines.join(',\n')},\n${closePad}}`;
}

function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}
