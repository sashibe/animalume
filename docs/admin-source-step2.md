# Step 2: 既存スキーマ統合と .ts ファイル読み書き層 実装指示書

> 前提: `docs/admin-vite-plugin-step1.md` の実装が完了し、`/__admin/*` API が動作している。
> 目的: 既存の `src/data/questions/*.ts` と `src/data/types/meta-*.ts` を、エディタから読み書きできるように、変換層と書き出し層を実装する。
> このステップではエディタ UI は変更しない。Step 3 で UI に組み込む。

---

## 0. ゴール

ブラウザのエディタが既存スキーマと統合できるよう、以下を実装：

1. **既存 .ts ファイルのパース**（コメント保持 + データ抽出）
2. **エディタ用の Localized 統合形式への変換**（ja と ko を 1 つにまとめる）
3. **エディタからファイル書き戻し**（コメント温存 + 整形）
4. **既存スキーマに合わせた型の追加**

---

## 1. 設計方針（再確認）

### 1.1 ファイル単位の読み書き

| データ | ファイル分割 | エディタの編集単位 |
|---|---|---|
| TypeMeta | `meta-ja.ts` / `meta-ko.ts` 各 1 ファイル全体 | 1 タイプ単位 |
| Question | `{axis}-pool.{locale}.ts` 計 8 ファイル | 1 問単位 |

エディタで 1 項目を保存するたびに、**該当ファイル全体**を読み → 書き戻す。

### 1.2 多言語の扱い

- **ファイル**: 言語別に分離（`ei-pool.ja.ts` / `ei-pool.ko.ts`）
- **エディタ内部**: 統合形式 `Localized = { ja, ko }`
- **読み込み時**: 2 ファイルを id でマージ
- **保存時**: 2 ファイルに分離して書き戻す

### 1.3 ヘッダコメント保持

各ファイル先頭の連続するコメントブロック（`/** ... */` または `// ...` の連続）は保持する。データ部分のみ書き換える。

### 1.4 並び順

- **既存の id 順を尊重**。エディタ側で並び替え機能は提供しない
- 新規追加した問題は配列末尾に追加

---

## 2. 実装

### 2.1 `src/features/admin/shared/source-types.ts`（新規）

エディタで使う統合型。既存の Question / TypeMeta 互換だが、ja/ko を Localized でまとめた形。

```ts
import type { Localized } from './types';

// ───── Question 統合形式 ─────

export type QuestionFormat = 'situation' | 'binary' | 'likert';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type Axis = 'EI' | 'SN' | 'TF' | 'JP';

/**
 * 既存の Question 型に対応するエディタ統合形式。
 * locale フィールドはなく、content / optionA.text / optionB.text が Localized になる。
 */
export type SourceQuestion = {
  id: string;
  axis: Axis;
  format: QuestionFormat;
  content: Localized;
  optionA: { text: Localized; weight: number };
  optionB: { text: Localized; weight: number };
  active: boolean;
  difficulty: QuestionDifficulty;
  tags: string[];
};

// ───── TypeMeta 統合形式 ─────

export type MbtiType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type GroupCode = 'NT' | 'NF' | 'SJ' | 'SP';

/**
 * 既存の TypeMeta 型に対応するエディタ統合形式。
 * nameJa/nameKo, groupJa/groupKo, tagline, essence, strengths, relationshipNote
 * を Localized にまとめる。groupCode と folderName は言語によらず固定。
 */
export type SourceTypeMeta = {
  code: MbtiType;
  groupCode: GroupCode;
  folderName: string;
  name: Localized;
  group: Localized;
  tagline: Localized;
  essence: Localized;
  strengths: Localized[]; // 配列。要素ごとに Localized
  relationshipNote: Localized;
};
```

### 2.2 `src/features/admin/shared/header-comment.ts`（新規）

ファイル先頭の連続コメントブロックを抽出・温存するためのユーティリティ。

```ts
/**
 * ファイル先頭の連続するコメントブロック（および空行）を抽出する。
 *
 * 抽出対象:
 *   - 行頭の // で始まる単一行コメント
 *   - 複数行 \/* ... *\/ ブロックコメント
 *   - これらに挟まれた空行
 *
 * 終端:
 *   - 最初に「コメントでも空行でもない行」が現れた直前まで
 *
 * 例:
 *   /** ヘッダ *\/
 *   // 補足
 *
 *   import ...   ← この行の直前で終了
 */
export function extractHeaderComment(source: string): {
  header: string;
  body: string;
} {
  const lines = source.split('\n');
  let endIndex = 0;
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (inBlockComment) {
      endIndex = i + 1;
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      continue;
    }

    if (trimmed === '') {
      endIndex = i + 1;
      continue;
    }

    if (trimmed.startsWith('//')) {
      endIndex = i + 1;
      continue;
    }

    if (trimmed.startsWith('/*')) {
      endIndex = i + 1;
      // 同じ行に */ がなければブロック開始
      if (!trimmed.includes('*/') || trimmed.lastIndexOf('*/') === 0) {
        inBlockComment = true;
      }
      continue;
    }

    // コメントでも空行でもない → ヘッダ終了
    break;
  }

  const header = lines.slice(0, endIndex).join('\n');
  const body = lines.slice(endIndex).join('\n');
  return { header, body };
}
```

### 2.3 `src/features/admin/shared/ts-codegen.ts`（新規）

JavaScript の値を TS リテラル文字列に整形するユーティリティ。`JSON.stringify` よりも読みやすく、シングルクォート優先・改行表現を活かす。

```ts
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
  // シングルクォート優先、内部のシングルクォートのみエスケープ
  // \n は文字列リテラル内では '\n' として保持（実改行ではない）
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
```

### 2.4 `src/features/admin/sources/question-source.ts`（新規）

8 つの `{axis}-pool.{locale}.ts` を読み込んで `SourceQuestion[]` に統合し、保存時には軸ファイル単位で書き戻す。

```ts
import { readFile, writeFile } from '../shared/ts-store';
import { extractHeaderComment } from '../shared/header-comment';
import { formatTsLiteral } from '../shared/ts-codegen';
import type {
  SourceQuestion, Axis, QuestionFormat, QuestionDifficulty,
} from '../shared/source-types';
import type { Locale } from '../shared/types';

const AXES: Axis[] = ['EI', 'SN', 'TF', 'JP'];

function poolPath(axis: Axis, locale: Locale): string {
  return `src/data/questions/${axis.toLowerCase()}-pool.${locale}.ts`;
}

/**
 * 既存の Question 配列の 1 要素（言語別）の形。
 * パース時の中間表現。
 */
type RawQuestion = {
  id: string;
  axis: Axis;
  format: QuestionFormat;
  locale: Locale;
  content: string;
  optionA: { text: string; weight: number };
  optionB: { text: string; weight: number };
  active: boolean;
  difficulty: QuestionDifficulty;
  tags: string[];
};

// ───── Parser ─────

/**
 * pool ファイルから RawQuestion[] を抽出する。
 *
 * 戦略: TypeScript のソースを動的に評価する代わりに、
 * 配列リテラル部分を JSON 互換に変換して JSON.parse する。
 *
 * 入力例:
 *   export const eiPoolJa: Question[] = [
 *     { id: 'ei-001', axis: 'EI', ... },
 *     ...
 *   ];
 *
 * 既存のファイルが書き出しユーティリティ (formatTsLiteral) と同じ
 * 構文に従っていることを前提とする (シングルクォート文字列、bareword キー)。
 */
function parseQuestionPool(source: string): RawQuestion[] {
  // export const ... = [ ... ]; の中身を抽出
  const arrayMatch = source.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/);
  if (!arrayMatch) {
    throw new Error('Failed to find array literal in pool file');
  }
  const literal = arrayMatch[1];

  // bareword キーを "key": に変換、シングルクォート文字列をダブルクォートに変換
  const json = tsLiteralToJson(literal);
  return JSON.parse(json) as RawQuestion[];
}

/**
 * TS リテラルを JSON に変換する簡易コンバータ。
 *   - bareword キー → "key":
 *   - 'string'      → "string"
 *   - 末尾カンマ削除
 *   - コメント除去
 * formatTsLiteral が出力した形式 + 既存ファイルの素朴な書式に対応。
 */
function tsLiteralToJson(input: string): string {
  let s = input;
  // 行コメント削除（文字列内は対象外にしたいが既存ファイルにはないので素朴に）
  s = s.replace(/\/\/[^\n]*\n/g, '\n');
  // ブロックコメント削除
  s = s.replace(/\/\*[\s\S]*?\*\//g, '');

  // シングルクォート文字列をダブルクォートに変換
  // 内部の " はエスケープ、\' は ' に戻す
  s = s.replace(/'((?:\\'|[^'])*)'/g, (_, body) => {
    const unescaped = body.replace(/\\'/g, "'");
    const escapedDoubleQuotes = unescaped
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      // 既に \\\\ にしてしまった \n を戻す
      .replace(/\\\\n/g, '\\n')
      .replace(/\\\\r/g, '\\r')
      .replace(/\\\\t/g, '\\t')
      .replace(/\\\\'/g, "'");
    return `"${escapedDoubleQuotes}"`;
  });

  // bareword プロパティキーを "key": に変換
  // { key: ... } → { "key": ... }
  s = s.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

  // 末尾カンマ削除
  s = s.replace(/,(\s*[\]}])/g, '$1');

  return s;
}

// ───── 統合・分離 ─────

/**
 * ja/ko の RawQuestion[] を id でマージして SourceQuestion[] にする。
 * 片言語にしか存在しない問題は空文字で埋める。
 */
function mergeByLocale(
  jaList: RawQuestion[],
  koList: RawQuestion[],
): SourceQuestion[] {
  const koMap = new Map(koList.map((q) => [q.id, q]));
  const seenKoIds = new Set<string>();

  const merged: SourceQuestion[] = jaList.map((ja) => {
    const ko = koMap.get(ja.id);
    if (ko) seenKoIds.add(ja.id);
    return {
      id: ja.id,
      axis: ja.axis,
      format: ja.format,
      content: { ja: ja.content, ko: ko?.content ?? '' },
      optionA: {
        text: { ja: ja.optionA.text, ko: ko?.optionA.text ?? '' },
        weight: ja.optionA.weight,
      },
      optionB: {
        text: { ja: ja.optionB.text, ko: ko?.optionB.text ?? '' },
        weight: ja.optionB.weight,
      },
      active: ja.active,
      difficulty: ja.difficulty,
      tags: ja.tags,
    };
  });

  // ja には無いが ko にだけある問題を末尾に追加
  for (const ko of koList) {
    if (seenKoIds.has(ko.id)) continue;
    merged.push({
      id: ko.id,
      axis: ko.axis,
      format: ko.format,
      content: { ja: '', ko: ko.content },
      optionA: { text: { ja: '', ko: ko.optionA.text }, weight: ko.optionA.weight },
      optionB: { text: { ja: '', ko: ko.optionB.text }, weight: ko.optionB.weight },
      active: ko.active,
      difficulty: ko.difficulty,
      tags: ko.tags,
    });
  }

  return merged;
}

/** SourceQuestion[] を locale 別の RawQuestion[] に分離 */
function splitByLocale(
  questions: SourceQuestion[],
  locale: Locale,
): RawQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    axis: q.axis,
    format: q.format,
    locale,
    content: q.content[locale],
    optionA: { text: q.optionA.text[locale], weight: q.optionA.weight },
    optionB: { text: q.optionB.text[locale], weight: q.optionB.weight },
    active: q.active,
    difficulty: q.difficulty,
    tags: q.tags,
  }));
}

// ───── 公開 API ─────

/**
 * 指定軸の問題を全件読み込み、ja/ko 統合形式で返す。
 */
export async function loadQuestionsByAxis(axis: Axis): Promise<SourceQuestion[]> {
  const [jaSource, koSource] = await Promise.all([
    readFile(poolPath(axis, 'ja')),
    readFile(poolPath(axis, 'ko')),
  ]);
  const ja = parseQuestionPool(jaSource);
  const ko = parseQuestionPool(koSource);
  return mergeByLocale(ja, ko);
}

/**
 * 全軸の問題を読み込む。
 */
export async function loadAllQuestions(): Promise<SourceQuestion[]> {
  const all = await Promise.all(AXES.map(loadQuestionsByAxis));
  return all.flat();
}

/**
 * 指定軸の問題配列を ja/ko 両ファイルに書き戻す。
 * ヘッダコメントは保持する。
 */
export async function saveQuestionsByAxis(
  axis: Axis,
  questions: SourceQuestion[],
): Promise<void> {
  for (const locale of (['ja', 'ko'] as const)) {
    const filePath = poolPath(axis, locale);
    const existing = await readFile(filePath);
    const { header } = extractHeaderComment(existing);
    const raw = splitByLocale(questions, locale);
    const literal = formatTsLiteral(raw);

    const constName = `${axis.toLowerCase()}Pool${locale === 'ja' ? 'Ja' : 'Ko'}`;
    const importLine = `import type { Question } from './types';`;

    // header の末尾改行を整える
    const trimmedHeader = header.replace(/\n+$/, '');
    const out =
      (trimmedHeader ? `${trimmedHeader}\n\n` : '') +
      `${importLine}\n\n` +
      `export const ${constName}: Question[] = ${literal};\n`;

    await writeFile(filePath, out);
  }
}
```

### 2.5 `src/features/admin/sources/type-source.ts`（新規）

`meta-ja.ts` / `meta-ko.ts` の読み書き。

```ts
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
  // 言語固有
  name: string;
  group: string;
  tagline: string;
  essence: string;
  strengths: string[];
  relationshipNote: string;
};

// ───── Parser ─────

/**
 * meta-{locale}.ts は以下の構造:
 *   export const TYPE_META_JA: Record<MbtiType, TypeMeta> = {
 *     INTJ: { code: 'INTJ', nameJa: '建築家', ... },
 *     INTP: { ... },
 *     ...
 *   };
 *
 * 既存ファイルでは nameJa / groupJa のように言語サフィックスが付く。
 * パース時に locale 引数で正規化する。
 */
function parseTypeMeta(source: string, locale: Locale): Record<MbtiType, RawTypeMeta> {
  const objMatch = source.match(/=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!objMatch) {
    throw new Error('Failed to find object literal in meta file');
  }
  const literal = objMatch[1];
  const json = tsLiteralToJson(literal);
  const parsed = JSON.parse(json) as Record<string, Record<string, unknown>>;

  const nameKey = locale === 'ja' ? 'nameJa' : 'nameKo';
  const groupKey = locale === 'ja' ? 'groupJa' : 'groupKo';

  const result: Partial<Record<MbtiType, RawTypeMeta>> = {};
  for (const code of ALL_TYPES) {
    const entry = parsed[code];
    if (!entry) {
      throw new Error(`Missing type ${code} in meta-${locale}.ts`);
    }
    result[code] = {
      code,
      groupCode: entry.groupCode as GroupCode,
      folderName: entry.folderName as string,
      name: (entry[nameKey] as string) ?? '',
      group: (entry[groupKey] as string) ?? '',
      tagline: (entry.tagline as string) ?? '',
      essence: (entry.essence as string) ?? '',
      strengths: (entry.strengths as string[]) ?? [],
      relationshipNote: (entry.relationshipNote as string) ?? '',
    };
  }
  return result as Record<MbtiType, RawTypeMeta>;
}

/** question-source.ts と同じ TS リテラル→JSON 変換 */
function tsLiteralToJson(input: string): string {
  let s = input;
  s = s.replace(/\/\/[^\n]*\n/g, '\n');
  s = s.replace(/\/\*[\s\S]*?\*\//g, '');
  s = s.replace(/'((?:\\'|[^'])*)'/g, (_, body) => {
    const unescaped = body.replace(/\\'/g, "'");
    const escapedDoubleQuotes = unescaped
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\\\\n/g, '\\n')
      .replace(/\\\\r/g, '\\r')
      .replace(/\\\\t/g, '\\t')
      .replace(/\\\\'/g, "'");
    return `"${escapedDoubleQuotes}"`;
  });
  s = s.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
  s = s.replace(/,(\s*[\]}])/g, '$1');
  return s;
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

/** locale 別の RawTypeMeta レコードに分離して書き出し用に整形 */
function splitMetas(
  metas: SourceTypeMeta[],
  locale: Locale,
): Record<MbtiType, Record<string, unknown>> {
  const result: Partial<Record<MbtiType, Record<string, unknown>>> = {};
  const nameKey = locale === 'ja' ? 'nameJa' : 'nameKo';
  const groupKey = locale === 'ja' ? 'groupJa' : 'groupKo';

  for (const meta of metas) {
    result[meta.code] = {
      code: meta.code,
      [nameKey]: meta.name[locale],
      [groupKey]: meta.group[locale],
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
  for (const locale of (['ja', 'ko'] as const)) {
    const filePath = locale === 'ja' ? META_JA_PATH : META_KO_PATH;
    const existing = await readFile(filePath);
    const { header } = extractHeaderComment(existing);
    const splitData = splitMetas(metas, locale);
    const literal = formatTsLiteral(splitData);

    const constName = `TYPE_META_${locale.toUpperCase()}`;
    const importLine =
      `import type { MbtiType } from '@/features/diagnosis/logic/types';`;

    // GroupCode と TypeMeta の型定義は ja 側にしかない（ko は import）
    const typeDefBlock =
      locale === 'ja'
        ? `\nexport type GroupCode = 'NT' | 'NF' | 'SJ' | 'SP';\n\nexport type TypeMeta = {
  code: MbtiType;
  nameJa: string;
  groupJa: string;
  groupCode: GroupCode;
  tagline: string;
  essence: string;
  folderName: string;
  strengths: string[];
  relationshipNote: string;
};\n`
        : `\nimport type { TypeMeta } from './meta-ja';\n`;

    // 注: ko 側の型定義は元ファイルに合わせて調整。
    // 既存 meta-ko.ts のヘッダ + import を確認のうえ整形する。

    const trimmedHeader = header.replace(/\n+$/, '');
    const out =
      (trimmedHeader ? `${trimmedHeader}\n\n` : '') +
      `${importLine}\n` +
      `${typeDefBlock}\n` +
      `export const ${constName}: Record<MbtiType, TypeMeta> = ${literal};\n`;

    await writeFile(filePath, out);
  }
}
```

> 注: 上記の `typeDefBlock` は既存ファイルの型定義位置に合わせた**暫定実装**。Step 2 動作確認時に実ファイルと比較して調整が必要な可能性がある。**まず Step 2.6（読み込みテスト）を完了してから、書き込みテストで実ファイルとのフォーマット差分を確認すること**。

### 2.6 動作確認用の最小デバッグページ（任意）

エディタ UI 改造 (Step 3) は別ステップだが、Step 2 の動作確認のために**一時的な確認画面**を 1 つ用意する。

`src/features/admin/debug/SourceTest.tsx`（新規・後で削除予定）：

```tsx
import { useEffect, useState } from 'react';
import { loadAllQuestions, loadQuestionsByAxis } from '../sources/question-source';
import { loadAllTypeMetas } from '../sources/type-source';
import type { SourceQuestion, SourceTypeMeta } from '../shared/source-types';

/**
 * Step 2 の読み込み動作確認用デバッグページ。
 * 本番には残さない。Step 3 完了後に削除する。
 */
export function SourceTest() {
  const [questions, setQuestions] = useState<SourceQuestion[] | null>(null);
  const [metas, setMetas] = useState<SourceTypeMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadAllQuestions(), loadAllTypeMetas()])
      .then(([qs, ms]) => {
        setQuestions(qs);
        setMetas(ms);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        // eslint-disable-next-line no-console
        console.error('[SourceTest] load failed', e);
      });
  }, []);

  if (error) {
    return (
      <pre style={{ padding: 24, background: '#fee', color: '#900' }}>
        Error: {error}
      </pre>
    );
  }

  if (!questions || !metas) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 12 }}>
      <h1>Source Test</h1>
      <h2>Questions ({questions.length} total)</h2>
      <p>Axes count:
        EI={questions.filter((q) => q.axis === 'EI').length} /
        SN={questions.filter((q) => q.axis === 'SN').length} /
        TF={questions.filter((q) => q.axis === 'TF').length} /
        JP={questions.filter((q) => q.axis === 'JP').length}
      </p>
      <p>First question:</p>
      <pre>{JSON.stringify(questions[0], null, 2)}</pre>

      <h2>Type Metas ({metas.length} total)</h2>
      <p>First meta:</p>
      <pre>{JSON.stringify(metas[0], null, 2)}</pre>
    </div>
  );
}
```

ルーティング `src/features/admin/routes.tsx` に**一時ルート**を追加：

```tsx
import { SourceTest } from './debug/SourceTest';

// GuardedRoutes の Routes 内に追加
<Route path="debug/sources" element={<SourceTest />} />
```

ブラウザで `/admin/debug/sources` を開いて、80 問と 16 メタが正しく読めることを目視確認する。

---

## 3. 動作確認手順

### 3.1 ビルド確認

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

すべて 0 errors で通ること。

### 3.2 読み込み動作確認

`pnpm dev` で起動 → ブラウザで `/admin/debug/sources` を開く。

期待される表示：
- `Questions (80 total)`
- `EI=20 / SN=20 / TF=20 / JP=20`
- 最初の質問が `id: 'ei-001'`、`content: { ja: '仕事で大きな成果...', ko: '업무에서 큰 성과...' }` のように **両言語が統合**されていること
- `Type Metas (16 total)`
- 最初のメタが `code: 'INTJ'`、`name: { ja: '建築家', ko: '...' }` のように両言語統合

エラーが出る場合：

- パース失敗（`Failed to find array literal`）→ tsLiteralToJson の変換漏れ。実ファイルの構文を確認
- メタファイルのフィールド欠損 → meta-ko.ts のキー名が `nameKo` か確認（`nameJa` のままの可能性）

### 3.3 書き込み動作確認（要注意）

**まず Git で現状をコミットしてから実施すること**。書き戻しでフォーマットが壊れる可能性があるため、いつでも元に戻せる状態を作る。

```powershell
git add -A
git commit -m "checkpoint before admin file write test"
```

ブラウザの DevTools Console で書き戻しテスト：

```javascript
// EI 軸を読んで、何も変えずにそのまま書き戻す
import('/src/features/admin/sources/question-source.ts').then(async (m) => {
  const qs = await m.loadQuestionsByAxis('EI');
  console.log('Loaded:', qs.length);
  await m.saveQuestionsByAxis('EI', qs);
  console.log('Saved successfully');
});
```

実行後の確認：

```powershell
git diff src/data/questions/ei-pool.ja.ts src/data/questions/ei-pool.ko.ts
```

期待される差分：
- ヘッダコメントは保持されている
- データ部分の整形（インデント、改行位置など）が変わっている可能性あり
- **意味的なデータは同一**（id、weight、content、tags がすべて一致）

差分が大きすぎる場合：
1. 元に戻す: `git checkout src/data/questions/ei-pool.ja.ts src/data/questions/ei-pool.ko.ts`
2. `formatTsLiteral` の出力を確認、必要に応じて整形ロジックを調整
3. 元のファイル形式と一致するように修正

### 3.4 同様にメタもテスト

```javascript
import('/src/features/admin/sources/type-source.ts').then(async (m) => {
  const ms = await m.loadAllTypeMetas();
  console.log('Loaded:', ms.length);
  await m.saveAllTypeMetas(ms);
  console.log('Saved');
});
```

`git diff` で確認。**特に meta-ko.ts の import 文や型定義部分**が壊れていないかを目視確認。

差分が壊滅的な場合は `git checkout` で元に戻して、§2.5 の `typeDefBlock` を実ファイルのフォーマットに合わせて修正する。

---

## 4. 注意事項

### 4.1 既存ファイルが壊れた場合の復旧

```powershell
git checkout src/data/
```

書き込みテストの前に必ずコミットしておくこと。

### 4.2 パース対象の前提

このパーサは「**`formatTsLiteral` が出力した形式 + 既存ファイルの素朴な書式**」のみ対応。以下は対応しない：

- テンプレートリテラル（`` `...` ``）
- 三項演算子・関数呼び出しが値に含まれる
- import で外部から値を持ち込む

既存ファイルがこれらを含んでいたら、Step 2 着手前にユーザーに報告する。

### 4.3 動作確認後

`/admin/debug/sources` ルートは **Step 3 完了後に削除**する。`SourceTest.tsx` も削除。Step 2 単独では残しておく。

---

## 5. 報告事項

- [ ] `src/features/admin/shared/source-types.ts` 新規作成
- [ ] `src/features/admin/shared/header-comment.ts` 新規作成
- [ ] `src/features/admin/shared/ts-codegen.ts` 新規作成
- [ ] `src/features/admin/sources/question-source.ts` 新規作成
- [ ] `src/features/admin/sources/type-source.ts` 新規作成
- [ ] `src/features/admin/debug/SourceTest.tsx` 新規作成
- [ ] `src/features/admin/routes.tsx` に debug ルート追加
- [ ] `pnpm typecheck` 成功
- [ ] `pnpm lint` 成功
- [ ] `pnpm build` 成功
- [ ] `/admin/debug/sources` で 80 問 + 16 メタが読み込めることを確認できる状態にする

ユーザーが行う動作確認:
1. `/admin/debug/sources` で読み込み確認
2. Console での書き戻しテスト
3. `git diff` でフォーマット差分の許容性を確認

書き込みテストの結果（差分の度合い・壊滅的か許容範囲か）を Step 3 着手前に判断したい。

---

**End of Document**
