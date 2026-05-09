import type { Locale } from './types';
import { getLimit, type LimitKind } from './limits';

export type ValidationStatus = 'ok' | 'warn' | 'over';

export type ValidationResult = {
  count: number;
  limit: number;
  hard: boolean;
  status: ValidationStatus;
};

export function countChars(text: string): number {
  return [...text.replace(/\n/g, '')].length;
}

export function validateText(
  text: string,
  kind: LimitKind,
  lang: Locale,
): ValidationResult {
  const { max, hard } = getLimit(kind, lang);
  const count = countChars(text);
  const status: ValidationStatus =
    count > max ? 'over' :
    count > max * 0.9 ? 'warn' : 'ok';
  return { count, limit: max, hard, status };
}
