/**
 * ファイル先頭の連続するコメントブロック（および空行）を抽出する。
 *
 * 抽出対象:
 *   - 行頭の // で始まる単一行コメント
 *   - 複数行 /* ... *\/ ブロックコメント
 *   - これらに挟まれた空行
 *
 * 終端:
 *   - 最初に「コメントでも空行でもない行」が現れた直前まで
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
