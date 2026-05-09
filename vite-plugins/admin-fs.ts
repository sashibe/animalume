import type { Plugin, ViteDevServer } from 'vite';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.json'];
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

/**
 * 管理画面がローカル .ts/.json ファイルを編集するための開発サーバー API。
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          console.error('[admin-fs] error:', err);
          return sendJson(res, 500, {
            error: err instanceof Error ? err.message : 'Internal error',
          });
        }
      });

      console.log('[admin-fs] enabled (development only)');
    },
  };
}
