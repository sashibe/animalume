import type { Localized } from '../shared/types';

export type DiffEntry =
  | { kind: 'added'; path: string; after: Localized }
  | { kind: 'removed'; path: string; before: Localized }
  | { kind: 'modified'; path: string; before: Localized; after: Localized };

export function diffLocalizedTree(
  before: unknown,
  after: unknown,
  path: string[] = [],
): DiffEntry[] {
  const out: DiffEntry[] = [];

  if (isLocalizedLike(before) && isLocalizedLike(after)) {
    if (before.ja !== after.ja || before.ko !== after.ko) {
      out.push({ kind: 'modified', path: path.join('.'), before, after });
    }
    return out;
  }

  if (isLocalizedLike(before) && !isLocalizedLike(after)) {
    out.push({ kind: 'removed', path: path.join('.'), before });
    return out;
  }
  if (!isLocalizedLike(before) && isLocalizedLike(after)) {
    out.push({ kind: 'added', path: path.join('.'), after });
    return out;
  }

  if (Array.isArray(before) || Array.isArray(after)) {
    const beforeArr = Array.isArray(before) ? before : [];
    const afterArr = Array.isArray(after) ? after : [];

    const beforeMap = new Map<string, { item: unknown; index: number }>();
    beforeArr.forEach((item, i) => {
      const key = (item as { id?: string })?.id ?? `__idx_${i}`;
      beforeMap.set(key, { item, index: i });
    });

    const seenKeys = new Set<string>();
    afterArr.forEach((item, i) => {
      const key = (item as { id?: string })?.id ?? `__idx_${i}`;
      seenKeys.add(key);
      const beforeEntry = beforeMap.get(key);
      out.push(...diffLocalizedTree(
        beforeEntry?.item,
        item,
        [...path, key],
      ));
    });
    beforeMap.forEach((entry, key) => {
      if (!seenKeys.has(key)) {
        out.push(...diffLocalizedTree(entry.item, undefined, [...path, key]));
      }
    });
    return out;
  }

  if (isPlainObject(before) || isPlainObject(after)) {
    const allKeys = new Set([
      ...Object.keys(before ?? {}),
      ...Object.keys(after ?? {}),
    ]);
    for (const key of allKeys) {
      out.push(...diffLocalizedTree(
        (before as Record<string, unknown>)?.[key],
        (after as Record<string, unknown>)?.[key],
        [...path, key],
      ));
    }
    return out;
  }

  return out;
}

function isLocalizedLike(v: unknown): v is Localized {
  return typeof v === 'object' && v !== null && 'ja' in v && 'ko' in v
    && typeof (v as { ja: unknown }).ja === 'string' && typeof (v as { ko: unknown }).ko === 'string';
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export type DiffSummary = {
  added: number;
  removed: number;
  modified: number;
  total: number;
};

export function summarize(diffs: DiffEntry[]): DiffSummary {
  const s = { added: 0, removed: 0, modified: 0, total: diffs.length };
  for (const d of diffs) s[d.kind]++;
  return s;
}
