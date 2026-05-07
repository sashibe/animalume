/**
 * Animalume - 16タイプ メタデータ 統合エクスポート
 */

import type { MbtiType } from '@/features/diagnosis/logic/types';
import type { QuestionLocale } from '@/data/questions/types';
import { TYPE_META_JA, type TypeMeta, type GroupCode } from './meta-ja';
import { TYPE_META_KO } from './meta-ko';

export type { TypeMeta, GroupCode };
export { TYPE_META_JA, TYPE_META_KO };

/** ロケールに対応するタイプメタを取得 */
export function getTypeMeta(type: MbtiType, locale: QuestionLocale): TypeMeta {
  return locale === 'ja' ? TYPE_META_JA[type] : TYPE_META_KO[type];
}

/** 全16タイプのメタデータをロケールで取得 */
export function getAllTypeMetas(locale: QuestionLocale): Record<MbtiType, TypeMeta> {
  return locale === 'ja' ? TYPE_META_JA : TYPE_META_KO;
}
