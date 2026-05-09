import JSON5 from 'json5';
import { readFile, writeFile } from '../shared/ts-store';
import { extractHeaderComment } from '../shared/header-comment';
import { formatTsLiteral } from '../shared/ts-codegen';
import type {
  SourceTypeMeta, MbtiType, GroupCode,
} from '../shared/source-types';
import type { Locale } from '../shared/types';

const META_JA_PATH = 'src/data/types/meta-ja.ts';
const META_KO_PATH = 'src/data/types/meta-ko.ts';

const ALL_TYPES: MbtiType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

/** 言語別の TypeMeta 1 件分の中間表現 */
type RawTypeMeta = {
  code: MbtiType;
  groupCode: GroupCode;
  folderName: string;
  name: string;
  group: string;
  tagline: string;
  essence: string;
  strengths: string[];
  relationshipNote: string;
};

// ───── Parser ─────

/**
 * meta-{locale}.ts をパースして RawTypeMeta の Record を返す。
 *
 * 重要: meta-ko.ts は TypeMeta 型（meta-ja.ts から import）を使うため、
 * フィールド名は両言語とも nameJa / groupJa になっている。
 *
 * export const TYPE_META_JA を明示的にアンカーして、
 * ファイル内の型定義 (export type TypeMeta = {...}) と区別する。
 */
function parseTypeMeta(source: string, locale: Locale): Record<MbtiType, RawTypeMeta> {
  const constName = `TYPE_META_${locale.toUpperCase()}`;
  const pattern = new RegExp(
    `export\\s+const\\s+${constName}\\s*:[^=]*=\\s*(\\{[\\s\\S]*?\\})\\s*;`,
  );
  const objMatch = source.match(pattern);
  if (!objMatch) {
    throw new Error(`Failed to find ${constName} object literal in meta file`);
  }
  const parsed = JSON5.parse(objMatch[1]) as Record<string, Record<string, unknown>>;

  const result: Partial<Record<MbtiType, RawTypeMeta>> = {};
  for (const code of ALL_TYPES) {
    const entry = parsed[code];
    if (!entry) {
      throw new Error(`Missing type ${code} in meta file`);
    }
    result[code] = {
      code,
      groupCode: entry.groupCode as GroupCode,
      folderName: entry.folderName as string,
      // meta-ko.ts も TypeMeta 型を共有するため nameJa / groupJa キーを使う
      name: (entry.nameJa as string) ?? '',
      group: (entry.groupJa as string) ?? '',
      tagline: (entry.tagline as string) ?? '',
      essence: (entry.essence as string) ?? '',
      strengths: (entry.strengths as string[]) ?? [],
      relationshipNote: (entry.relationshipNote as string) ?? '',
    };
  }
  return result as Record<MbtiType, RawTypeMeta>;
}

// ───── 統合・分離 ─────

function mergeMetas(
  ja: Record<MbtiType, RawTypeMeta>,
  ko: Record<MbtiType, RawTypeMeta>,
): SourceTypeMeta[] {
  return ALL_TYPES.map((code) => {
    const j = ja[code];
    const k = ko[code];
    return {
      code,
      groupCode: j.groupCode,
      folderName: j.folderName,
      name: { ja: j.name, ko: k.name },
      group: { ja: j.group, ko: k.group },
      tagline: { ja: j.tagline, ko: k.tagline },
      essence: { ja: j.essence, ko: k.essence },
      strengths: alignStrengths(j.strengths, k.strengths),
      relationshipNote: { ja: j.relationshipNote, ko: k.relationshipNote },
    };
  });
}

/** strengths は配列なので、長さを揃えて Localized[] に変換 */
function alignStrengths(jaList: string[], koList: string[]) {
  const len = Math.max(jaList.length, koList.length);
  const out: { ja: string; ko: string }[] = [];
  for (let i = 0; i < len; i++) {
    out.push({ ja: jaList[i] ?? '', ko: koList[i] ?? '' });
  }
  return out;
}

/**
 * locale 別の書き出し用レコードに分離する。
 * meta-ko.ts も TypeMeta 型を共有するため nameJa / groupJa キーを使う。
 */
function splitMetas(
  metas: SourceTypeMeta[],
  locale: Locale,
): Record<MbtiType, Record<string, unknown>> {
  const result: Partial<Record<MbtiType, Record<string, unknown>>> = {};

  for (const meta of metas) {
    result[meta.code] = {
      code: meta.code,
      nameJa: meta.name[locale],
      groupJa: meta.group[locale],
      groupCode: meta.groupCode,
      tagline: meta.tagline[locale],
      essence: meta.essence[locale],
      folderName: meta.folderName,
      strengths: meta.strengths.map((s) => s[locale]),
      relationshipNote: meta.relationshipNote[locale],
    };
  }
  return result as Record<MbtiType, Record<string, unknown>>;
}

// ───── 公開 API ─────

export async function loadAllTypeMetas(): Promise<SourceTypeMeta[]> {
  const [jaSource, koSource] = await Promise.all([
    readFile(META_JA_PATH),
    readFile(META_KO_PATH),
  ]);
  const ja = parseTypeMeta(jaSource, 'ja');
  const ko = parseTypeMeta(koSource, 'ko');
  return mergeMetas(ja, ko);
}

/** 全 16 タイプを ja/ko 両ファイルに書き戻す */
export async function saveAllTypeMetas(metas: SourceTypeMeta[]): Promise<void> {
  if (metas.length !== 16) {
    throw new Error(`Expected 16 type metas, got ${metas.length}`);
  }

  // ja ファイル
  const jaPath = META_JA_PATH;
  const jaExisting = await readFile(jaPath);
  const { header: jaHeader } = extractHeaderComment(jaExisting);
  const jaData = splitMetas(metas, 'ja');
  const jaLiteral = formatTsLiteral(jaData);
  const jaOut =
    jaHeader.replace(/\n+$/, '') + '\n\n' +
    `import type { MbtiType } from '@/features/diagnosis/logic/types';\n` +
    `\n` +
    `export type GroupCode = 'NT' | 'NF' | 'SJ' | 'SP';\n` +
    `\n` +
    `export type TypeMeta = {\n` +
    `  code: MbtiType;\n` +
    `  nameJa: string;\n` +
    `  groupJa: string;\n` +
    `  groupCode: GroupCode;\n` +
    `  tagline: string;\n` +
    `  essence: string;\n` +
    `  folderName: string;\n` +
    `  strengths: string[];\n` +
    `  relationshipNote: string;\n` +
    `};\n` +
    `\n` +
    `export const TYPE_META_JA: Record<MbtiType, TypeMeta> = ${jaLiteral};\n`;
  await writeFile(jaPath, jaOut);

  // ko ファイル
  const koPath = META_KO_PATH;
  const koExisting = await readFile(koPath);
  const { header: koHeader } = extractHeaderComment(koExisting);
  const koData = splitMetas(metas, 'ko');
  const koLiteral = formatTsLiteral(koData);
  const koOut =
    koHeader.replace(/\n+$/, '') + '\n\n' +
    `import type { MbtiType } from '@/features/diagnosis/logic/types';\n` +
    `import type { TypeMeta } from './meta-ja';\n` +
    `\n` +
    `export const TYPE_META_KO: Record<MbtiType, TypeMeta> = ${koLiteral};\n`;
  await writeFile(koPath, koOut);
}
