import type { Localized, UiStrings, UiStringNode } from '../shared/types';

export function isLocalized(node: UiStringNode): node is Localized {
  return (
    typeof node === 'object' &&
    node !== null &&
    'ja' in node &&
    'ko' in node &&
    typeof (node as Localized).ja === 'string' &&
    typeof (node as Localized).ko === 'string'
  );
}

export type FlatEntry = {
  path: string;
  segments: string[];
  value: Localized;
};

export function flatten(strings: UiStrings, prefix: string[] = []): FlatEntry[] {
  const out: FlatEntry[] = [];
  for (const key of Object.keys(strings).sort()) {
    const node = strings[key];
    const segments = [...prefix, key];
    if (isLocalized(node)) {
      out.push({ path: segments.join('.'), segments, value: node });
    } else {
      out.push(...flatten(node as UiStrings, segments));
    }
  }
  return out;
}

export function getAtPath(strings: UiStrings, segments: string[]): Localized | undefined {
  let cur: UiStringNode = strings;
  for (const seg of segments) {
    if (typeof cur !== 'object' || cur === null || isLocalized(cur)) return undefined;
    cur = (cur as UiStrings)[seg];
    if (cur === undefined) return undefined;
  }
  return isLocalized(cur) ? cur : undefined;
}

export function setAtPath(
  strings: UiStrings,
  segments: string[],
  value: Localized,
): UiStrings {
  if (segments.length === 0) return strings;
  const [head, ...rest] = segments;
  const next = { ...strings };
  if (rest.length === 0) {
    next[head] = value;
  } else {
    const child = (strings[head] && !isLocalized(strings[head] as UiStringNode))
      ? (strings[head] as UiStrings)
      : {};
    next[head] = setAtPath(child, rest, value);
  }
  return next;
}

export function splitByLocale(strings: UiStrings): { ja: object; ko: object } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ja: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ko: any = {};
  for (const entry of flatten(strings)) {
    let cursorJa = ja;
    let cursorKo = ko;
    for (let i = 0; i < entry.segments.length - 1; i++) {
      const seg = entry.segments[i];
      cursorJa[seg] = cursorJa[seg] ?? {};
      cursorKo[seg] = cursorKo[seg] ?? {};
      cursorJa = cursorJa[seg];
      cursorKo = cursorKo[seg];
    }
    const last = entry.segments[entry.segments.length - 1];
    cursorJa[last] = entry.value.ja;
    cursorKo[last] = entry.value.ko;
  }
  return { ja, ko };
}

export function mergeFromLocale(jaJson: object, koJson: object): UiStrings {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function walk(jaNode: any, koNode: any): UiStrings | Localized {
    if (typeof jaNode === 'string' || typeof koNode === 'string') {
      return { ja: typeof jaNode === 'string' ? jaNode : '', ko: typeof koNode === 'string' ? koNode : '' };
    }
    const out: UiStrings = {};
    const keys = new Set([...Object.keys(jaNode ?? {}), ...Object.keys(koNode ?? {})]);
    for (const key of keys) {
      const childJa = jaNode?.[key];
      const childKo = koNode?.[key];
      const merged = walk(childJa, childKo);
      out[key] = merged as UiStringNode;
    }
    return out;
  }
  return walk(jaJson, koJson) as UiStrings;
}

export function inferLimitKind(path: string): 'uiLabel' | 'uiNotice' {
  const lower = path.toLowerCase();
  if (/(message|description|notice|hint|body|caption|tooltip)/.test(lower)) {
    return 'uiNotice';
  }
  return 'uiLabel';
}
