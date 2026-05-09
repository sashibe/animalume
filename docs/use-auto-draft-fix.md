# useAutoDraft 自動保存バグ修正指示書

> 症状: 大量データを setState で更新すると「保存中…」表示が消えず、IndexedDB への永続化が完了しないままリロードでデータが失われる。特に UiStringsEditor の JSON インポート（87キー × 2言語）で顕在化。

## 0. 原因

`src/features/admin/editor/useAutoDraft.ts` の useEffect 依存配列に `onSaved` コールバックが含まれている。呼び出し側で `onSaved` を毎レンダリングで新しい関数として渡しているため：

1. data が変わって useEffect 実行 → debounce タイマー設定
2. レンダリング発生 → `onSaved` が新しい関数に → 依存配列が変わる
3. useEffect の cleanup が走って timer がクリアされる
4. 1〜3 が繰り返されて、setTimeout のコールバックが**永遠に発火しない**
5. `saveDraft()` が呼ばれない → IndexedDB に保存されない → リロードで消える

## 1. 修正

### 1.1 `src/features/admin/editor/useAutoDraft.ts` を以下に置き換え

```ts
import { useEffect, useRef } from 'react';
import { saveDraft, getDraft } from '../shared/draft-store';
import type { ContentType } from '../shared/types';

type Options = {
  debounceMs?: number;
  enabled?: boolean;
  onSaved?: () => void;
};

/**
 * data の変更を検知して IndexedDB に自動保存する。
 *
 * 重要: onSaved は ref に格納して依存配列から除外する。
 * 呼び出し側で毎レンダリング新しい関数を渡しても debounce タイマーが
 * リセットされ続ける問題を回避するため。
 */
export function useAutoDraft<T>(
  contentType: ContentType,
  contentId: string,
  data: T,
  options: Options = {},
) {
  const { debounceMs = 1000, enabled = true, onSaved } = options;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string>('');

  // onSaved は ref で保持して依存配列から外す
  const onSavedRef = useRef(onSaved);
  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  useEffect(() => {
    if (!enabled) return;
    const serialized = JSON.stringify(data);
    if (serialized === lastSaved.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await saveDraft({ contentType, contentId, data, updatedAt: Date.now() });
        lastSaved.current = serialized;
        onSavedRef.current?.();
      } catch (error) {
        // 保存失敗は console に残すだけ（呼び出し側に伝えない）
        // eslint-disable-next-line no-console
        console.error('[useAutoDraft] saveDraft failed:', error);
      }
    }, debounceMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // 意図的に onSaved を依存配列から除外（onSavedRef 経由で参照）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, contentId, data, debounceMs, enabled]);
}

export async function loadDraftOrFallback<T>(
  contentType: ContentType,
  contentId: string,
  fallback: T,
): Promise<T> {
  const record = await getDraft<T>(contentType, contentId);
  return record?.data ?? fallback;
}
```

### 主な変更点

1. **`onSavedRef` 導入**: `onSaved` を ref に格納し、毎レンダリングで最新値に更新
2. **依存配列から `onSaved` 除外**: `eslint-disable` コメント付きで明示
3. **try/catch 追加**: `saveDraft` の失敗時にエラーをログ出力（無音で固まらないように）

## 2. 検証

修正後、以下を順に実行：

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

すべて 0 errors で通ること。

## 3. 動作確認手順（人間側）

修正完了後、以下をユーザーに伝える：

### 3.1 ブラウザで確認

1. `pnpm dev` で起動（既に起動中なら自動リロード）
2. F12 → Application → IndexedDB → `animalume-admin` → `drafts` を開く
3. `/admin/ui-strings/edit` で再度 JSON インポートを実行
   - ja.json と ko.json を貼り付けてインポート
4. 数秒後、IndexedDB の `drafts` テーブルに `['ui-strings', 'main']` のレコードが現れることを確認
5. ヘッダーの「保存済み」表示に切り替わること
6. ページをリロード → ツリー表示が復元されることを確認

### 3.2 もし古い下書き残骸が悪さする場合

`/admin/ui-strings/edit` を開いた直後に「読み込み中…」のままなど挙動が変なら、IndexedDB を一度クリア：

1. F12 → Application → IndexedDB
2. `animalume-admin` を右クリック → Delete database
3. ページをリロード → クリーンな状態から再インポート

## 4. 補足: なぜ TypeEditor / QuestionEditor では症状が出ていなかったか

これらのエディタでは 1〜数フィールドの小さな state 更新しか行わないため、debounce のリセット数も限られていた。87 キー × 2 言語の大量データを一度に setState する UiStringsEditor のインポートで初めて顕在化した。今回の修正で全エディタが安定する。

## 5. 報告事項

- [ ] `useAutoDraft.ts` を修正
- [ ] `pnpm typecheck` 成功
- [ ] `pnpm lint` 成功（0 problems）
- [ ] `pnpm build` 成功
- [ ] ユーザーに動作確認手順（§3）を伝える

---

**End of Document**
