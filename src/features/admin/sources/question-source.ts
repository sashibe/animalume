import JSON5 from 'json5';
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

/** パース時の中間表現（言語別） */
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
 * export const {constName} を明示的にアンカーして、
 * ファイル内の型定義 (export type Question = {...}) と区別する。
 */
function parseQuestionPool(source: string, constName: string): RawQuestion[] {
  const pattern = new RegExp(
    `export\\s+const\\s+${constName}\\s*:[^=]*=\\s*(\\[[\\s\\S]*?\\])\\s*;`,
  );
  const arrayMatch = source.match(pattern);
  if (!arrayMatch) {
    throw new Error(`Failed to find ${constName} array literal in pool file`);
  }
  return JSON5.parse(arrayMatch[1]) as RawQuestion[];
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

/** 指定軸の問題を全件読み込み、ja/ko 統合形式で返す。 */
export async function loadQuestionsByAxis(axis: Axis): Promise<SourceQuestion[]> {
  const [jaSource, koSource] = await Promise.all([
    readFile(poolPath(axis, 'ja')),
    readFile(poolPath(axis, 'ko')),
  ]);
  const constNameJa = `${axis.toLowerCase()}Pool${'Ja'}`;
  const constNameKo = `${axis.toLowerCase()}Pool${'Ko'}`;
  const ja = parseQuestionPool(jaSource, constNameJa);
  const ko = parseQuestionPool(koSource, constNameKo);
  return mergeByLocale(ja, ko);
}

/** 全軸の問題を読み込む。 */
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

    const trimmedHeader = header.replace(/\n+$/, '');
    const out =
      (trimmedHeader ? `${trimmedHeader}\n\n` : '') +
      `${importLine}\n\n` +
      `export const ${constName}: Question[] = ${literal};\n`;

    await writeFile(filePath, out);
  }
}
