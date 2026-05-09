# Step 1: 管理画面用 Vite プラグイン (admin-fs) 実装指示書

> 前提:
> - `docs/admin-editor-implementation.md` 〜 `docs/lessons-learned.md` までが完了済み
> - 既存の `src/data/questions/*.ts` と `src/data/types/meta-*.ts` を編集対象とする
> - エディタは Firestore ではなく**ローカル `.ts` ファイルを直接書き換える**方針

## 0. ゴール

開発時のみ動作する Vite プラグイン `admin-fs` を実装する。ブラウザの管理画面から `POST /__admin/save` で `.ts` ファイルを書き換えられるようにし、Vite の HMR で即座に反映する。

このプラグインは **開発環境専用**。本番ビルドには絶対に含めない。

## 1. セキュリティ要件（最重要）

ファイルシステム書き込み API なので、以下を**絶対に守る**：

1. **本番ビルドには含めない** — Vite の `apply: 'serve'` で開発時のみ有効化
2. **パスバリデーション** — `src/data/` 配下のみ許可、`..` を含むパスは拒否
3. **拡張子チェック** — `.ts` `.tsx` `.json` のみ許可
4. **localhost 以外のリクエストを拒否** — `Host` ヘッダで判定
5. **CSRF 対策** — `Origin` ヘッダが localhost であることを確認
6. **書き込みサイズ上限** — 1MB 上限、超過は 413 を返す

これらに違反するとローカルマシンが任意のリクエストでファイル改ざん可能になる。

## 2. 実装

### 2.1 `vite-plugins/admin-fs.ts`（新規）

ファイルを新規作成し、以下を記述：

```ts
import type { Plugin, ViteDevServer } from 'vite';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.json'];
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

/**
 * 管理画面が ローカル .ts/.json ファイルを編集するための開発サーバー API。
 * 開発時のみ有効。本番ビルドには含まれない（apply: 'serve' で保証）。
 *
 * エンドポイント:
 *   GET  /__admin/read?path=src/data/questions/ei-pool.ja.ts
 *   POST /__admin/save  body: { path: string, content: string }
 *   GET  /__admin/list?dir=src/data/questions
 *
 * セキュリティ:
 *   - src/data/ 配下のみアクセス可能
 *   - .ts/.tsx/.json のみ
 *   - localhost からのリクエストのみ
 */
export function adminFs(): Plugin {
  return {
    name: 'animalume-admin-fs',
    apply: 'serve', // 開発時のみ有効。build には含まれない
    configureServer(server: ViteDevServer) {
      const projectRoot = server.config.root;
      const allowedRoot = path.resolve(projectRoot, 'src', 'data');

      // パスを安全に解決する。allowedRoot の外を指す場合は null を返す
      function resolveSafePath(rawPath: string): string | null {
        if (typeof rawPath !== 'string' || rawPath.length === 0) return null;
        if (rawPath.includes('\0')) return null;

        // 拡張子チェック
        const ext = path.extname(rawPath).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) return null;

        const absolute = path.resolve(projectRoot, rawPath);
        const normalized = path.normalize(absolute);

        // allowedRoot の配下であることを確認
        const relativeToAllowed = path.relative(allowedRoot, normalized);
        if (
          relativeToAllowed.startsWith('..') ||
          path.isAbsolute(relativeToAllowed)
        ) {
          return null;
        }

        return normalized;
      }

      // localhost からのリクエストかチェック
      function isLocalRequest(req: { headers: Record<string, string | string[] | undefined> }): boolean {
        const host = req.headers.host;
        const origin = req.headers.origin;

        const hostStr = Array.isArray(host) ? host[0] : host;
        const originStr = Array.isArray(origin) ? origin[0] : origin;

        if (!hostStr) return false;
        const hostName = hostStr.split(':')[0];
        if (!['localhost', '127.0.0.1', '[::1]'].includes(hostName)) return false;

        // Origin が指定されている場合（CORS 経由）はそれも localhost であることを要求
        if (originStr) {
          try {
            const originUrl = new URL(originStr);
            if (
              !['localhost', '127.0.0.1', '[::1]'].includes(originUrl.hostname)
            ) {
              return false;
            }
          } catch {
            return false;
          }
        }

        return true;
      }

      // JSON レスポンスを返すヘルパ
      function sendJson(res: any, status: number, body: unknown) {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(body));
      }

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';

        if (!url.startsWith('/__admin/')) {
          return next();
        }

        // localhost チェック
        if (!isLocalRequest(req as any)) {
          return sendJson(res, 403, { error: 'Forbidden: non-local request' });
        }

        try {
          // GET /__admin/read?path=...
          if (req.method === 'GET' && url.startsWith('/__admin/read')) {
            const queryString = url.split('?')[1] ?? '';
            const params = new URLSearchParams(queryString);
            const requestedPath = params.get('path') ?? '';
            const safePath = resolveSafePath(requestedPath);

            if (!safePath) {
              return sendJson(res, 400, { error: 'Invalid or disallowed path' });
            }
            try {
              const content = await fs.readFile(safePath, 'utf-8');
              return sendJson(res, 200, { path: requestedPath, content });
            } catch (err) {
              if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
                return sendJson(res, 404, { error: 'File not found' });
              }
              throw err;
            }
          }

          // GET /__admin/list?dir=...
          if (req.method === 'GET' && url.startsWith('/__admin/list')) {
            const queryString = url.split('?')[1] ?? '';
            const params = new URLSearchParams(queryString);
            const requestedDir = params.get('dir') ?? '';

            // ディレクトリ用のパス検証（拡張子チェックなし）
            if (typeof requestedDir !== 'string' || requestedDir.includes('\0')) {
              return sendJson(res, 400, { error: 'Invalid dir' });
            }
            const absoluteDir = path.normalize(
              path.resolve(projectRoot, requestedDir),
            );
            const relativeToAllowed = path.relative(allowedRoot, absoluteDir);
            if (
              relativeToAllowed.startsWith('..') ||
              path.isAbsolute(relativeToAllowed)
            ) {
              return sendJson(res, 400, { error: 'Disallowed directory' });
            }

            try {
              const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
              const files = entries
                .filter((e) => e.isFile())
                .filter((e) =>
                  ALLOWED_EXTENSIONS.includes(path.extname(e.name).toLowerCase()),
                )
                .map((e) => e.name);
              return sendJson(res, 200, { dir: requestedDir, files });
            } catch (err) {
              if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
                return sendJson(res, 404, { error: 'Directory not found' });
              }
              throw err;
            }
          }

          // POST /__admin/save
          if (req.method === 'POST' && url.startsWith('/__admin/save')) {
            const chunks: Buffer[] = [];
            let totalSize = 0;
            let aborted = false;

            await new Promise<void>((resolve, reject) => {
              req.on('data', (chunk: Buffer) => {
                if (aborted) return;
                totalSize += chunk.length;
                if (totalSize > MAX_BODY_SIZE) {
                  aborted = true;
                  sendJson(res, 413, { error: 'Body too large (max 1MB)' });
                  req.destroy();
                  return;
                }
                chunks.push(chunk);
              });
              req.on('end', () => resolve());
              req.on('error', (err) => reject(err));
            });

            if (aborted) return;

            const raw = Buffer.concat(chunks).toString('utf-8');
            let parsed: { path?: string; content?: string };
            try {
              parsed = JSON.parse(raw);
            } catch {
              return sendJson(res, 400, { error: 'Invalid JSON body' });
            }

            const safePath = resolveSafePath(parsed.path ?? '');
            if (!safePath) {
              return sendJson(res, 400, { error: 'Invalid or disallowed path' });
            }
            if (typeof parsed.content !== 'string') {
              return sendJson(res, 400, { error: 'content must be a string' });
            }

            await fs.mkdir(path.dirname(safePath), { recursive: true });
            await fs.writeFile(safePath, parsed.content, 'utf-8');

            // eslint-disable-next-line no-console
            console.log(`[admin-fs] saved: ${parsed.path}`);

            return sendJson(res, 200, {
              path: parsed.path,
              size: parsed.content.length,
              savedAt: Date.now(),
            });
          }

          // 未対応のエンドポイント
          return sendJson(res, 404, { error: 'Unknown endpoint' });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[admin-fs] error:', err);
          return sendJson(res, 500, {
            error: err instanceof Error ? err.message : 'Internal error',
          });
        }
      });

      // eslint-disable-next-line no-console
      console.log('[admin-fs] enabled (development only)');
    },
  };
}
```

### 2.2 `vite.config.ts` の修正

既存の `vite.config.ts` に `adminFs` プラグインを追加。**plugins 配列の先頭付近**に置く。

修正前後の例：

```ts
// 修正前（例）
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ...
});

// 修正後
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { adminFs } from './vite-plugins/admin-fs';

export default defineConfig({
  plugins: [
    adminFs(),
    react(),
  ],
  // ...
});
```

既存の `vite.config.ts` に他のプラグインがあれば、そのまま残して `adminFs()` を先頭に追加する。

### 2.3 ブラウザ側のクライアント `src/features/admin/shared/ts-store.ts`（新規）

ファイルを新規作成し、以下を記述：

```ts
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
export async function readFile(path: string): Promise<string> {
  ensureDev();
  const url = `${BASE}/read?path=${encodeURIComponent(path)}`;
  const data = await jsonFetch<ReadResponse>(url);
  return data.content;
}

/** ファイルに書き込む */
export async function writeFile(
  path: string,
  content: string,
): Promise<SaveResponse> {
  ensureDev();
  return jsonFetch<SaveResponse>(`${BASE}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
}
```

## 3. 動作確認手順

### 3.1 ビルド確認

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

すべて 0 errors で通ること。**特に `pnpm build` で adminFs が含まれていないことを確認するため、ビルド出力を見て `__admin` という文字列が dist に含まれないか目視確認すること**：

```powershell
Select-String -Path dist\assets\*.js -Pattern '__admin' -SimpleMatch
```

→ 何もマッチしないこと（プラグインは serve のみで build に含まれない）

### 3.2 開発サーバー起動確認

```powershell
pnpm dev
```

起動時、コンソールに以下が表示されること：

```
[admin-fs] enabled (development only)
```

### 3.3 エンドポイント疎通確認

ブラウザで `http://localhost:5173/__admin/list?dir=src/data/questions` にアクセス。

期待される JSON レスポンス：

```json
{
  "dir": "src/data/questions",
  "files": [
    "ei-pool.ja.ts",
    "ei-pool.ko.ts",
    "index.ts",
    "jp-pool.ja.ts",
    "jp-pool.ko.ts",
    "sn-pool.ja.ts",
    "sn-pool.ko.ts",
    "tf-pool.ja.ts",
    "tf-pool.ko.ts",
    "types.ts"
  ]
}
```

### 3.4 read 疎通確認

ブラウザで `http://localhost:5173/__admin/read?path=src/data/questions/types.ts` にアクセス。
JSON レスポンスの `content` フィールドにファイルの中身が文字列として入っていること。

### 3.5 セキュリティ確認

以下のリクエストはすべて **400 または 403** を返すことを確認：

```
GET /__admin/read?path=../../../etc/passwd          → 400 (allowed_root の外)
GET /__admin/read?path=src/main.tsx                  → 400 (src/data 配下でない)
GET /__admin/read?path=src/data/questions/foo.exe    → 400 (拡張子不許可)
GET /__admin/read?path=                              → 400 (空)
GET /__admin/list?dir=src                            → 400 (allowed_root の外)
```

ブラウザのアドレスバーに直接貼り付けて確認できる。

## 4. 注意事項

### 4.1 本番ビルドへの混入を絶対に防ぐ

- `apply: 'serve'` が設定されていることを確認
- ビルド成果物の dist/assets/*.js に `__admin` という文字列が出現しないこと（§3.1 の検証で確認）
- 本番デプロイ前に再度 §3.1 を実施する運用とする

### 4.2 既存ファイルへの影響なし

このステップでは既存の `src/data/` のファイルは一切編集しない。Vite プラグインを追加し、ブラウザクライアントを追加するだけ。エディタ画面の改造は Step 2/3 で行う。

### 4.3 PowerShell でのテスト

curl ではなく **ブラウザのアドレスバーに直接 URL を貼り付ける**のが最も簡単。GET リクエストはこれで確認可能。POST は Step 2 の実装後に試す。

## 5. 報告事項

- [ ] `vite-plugins/admin-fs.ts` を新規作成
- [ ] `vite.config.ts` に `adminFs()` を追加
- [ ] `src/features/admin/shared/ts-store.ts` を新規作成
- [ ] `pnpm typecheck` 成功（0 errors）
- [ ] `pnpm lint` 成功（0 problems）
- [ ] `pnpm build` 成功
- [ ] `dist` に `__admin` 文字列が含まれないことを確認
- [ ] `pnpm dev` 起動時に `[admin-fs] enabled` ログが出ることを確認
- [ ] §3.3 / §3.4 / §3.5 をユーザーが確認できる状態であることを伝える

完了後、ユーザーがブラウザで疎通確認を行います。Step 2（スキーマ拡張とエディタ改造）は別の指示書で扱います。

---

**End of Document**
