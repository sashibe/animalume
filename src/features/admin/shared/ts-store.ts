/**
 * 開発サーバーの /__admin/* エンドポイント経由で
 * ローカル .ts/.json ファイルを読み書きするクライアント。
 *
 * 開発環境でのみ動作する（本番では Vite プラグインが存在しないため）。
 * import.meta.env.DEV をチェックすること。
 */

const BASE = '/__admin';

export type ListResponse = { dir: string; files: string[] };
export type ReadResponse = { path: string; content: string };
export type SaveResponse = { path: string; size: number; savedAt: number };

export class TsStoreError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'TsStoreError';
  }
}

async function jsonFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error ?? JSON.stringify(body);
    } catch {
      detail = res.statusText;
    }
    throw new TsStoreError(res.status, detail || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

/** 環境ガード。本番では throw して使えないことを明示 */
function ensureDev(): void {
  if (!import.meta.env.DEV) {
    throw new TsStoreError(
      0,
      'ts-store is only available in development mode',
    );
  }
}

/** ディレクトリの一覧を取得 */
export async function listFiles(dir: string): Promise<string[]> {
  ensureDev();
  const url = `${BASE}/list?dir=${encodeURIComponent(dir)}`;
  const data = await jsonFetch<ListResponse>(url);
  return data.files;
}

/** ファイルの内容を取得 */
export async function readFile(filePath: string): Promise<string> {
  ensureDev();
  const url = `${BASE}/read?path=${encodeURIComponent(filePath)}`;
  const data = await jsonFetch<ReadResponse>(url);
  return data.content;
}

/** ファイルに書き込む */
export async function writeFile(
  filePath: string,
  content: string,
): Promise<SaveResponse> {
  ensureDev();
  return jsonFetch<SaveResponse>(`${BASE}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: filePath, content }),
  });
}
