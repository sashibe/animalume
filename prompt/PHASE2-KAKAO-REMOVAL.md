# Phase 2 クロージング・修正 — Kakao シェアボタン削除

直前のコミットで追加した Kakao シェアボタンを削除する。

---

## 厳守事項（ADR-0008 準拠）

1. **スコープ外の問題に遭遇したら、修正せず報告のみ**。
2. **曖昧な指示・矛盾を見つけたら、実装前に質問**。
3. **「これでいい」と判断した箇所は、根拠を一行コメントで残す**。

---

## 背景

`https://story.kakao.com/share?url=` のシェアURLスキームは Kakao 側で**完全に廃止されている**ことが、ユーザー側の動作確認で判明した。実機で Kakao ボタンをタップすると、Kakao の「OpenAPI を利用したカカオストーリーへの共有機能は終了しました」というエラーページに遷移する。

Kakao への正規のシェア手段は現在 **Kakao JavaScript SDK** （`Kakao.Share.sendDefault()`）のみ。SDK は appkey 登録（Kakao Developers Console）と初期化が必要で、本格対応は **Phase 5（友達相性 / Kakao Login）と一緒に実装する**ほうが効率的。

そのため Kakao ボタンを暫定的に削除する。「動かないボタンを本番に置かない」という Animalume の品質基準（CLAUDE.md §2.2）に従う。

---

## タスク: 直前の Kakao 関連変更を取り消す

### 削除対象 1: `src/features/share/lib/shareUrls.ts`

直前のコミットで追加した `buildKakaoShareUrl` 関数を削除する。

```typescript
// 削除する
export function buildKakaoShareUrl(): string {
  const url = `${SITE_URL}/`;
  return `https://story.kakao.com/share?url=${encodeURIComponent(url)}`;
}
```

### 削除対象 2: `src/features/share/components/ShareButtonGroup.tsx`

- `KAKAO_ICON` 定数を削除
- Kakao ボタン本体の `<a>` 要素を削除
- `buildKakaoShareUrl` の import を削除（X / LINE の import は残す）

ボタンの並びを「ネイティブシェア → X → LINE → 画像保存」に戻す（Kakao 追加前と同じ並び）。

### 削除対象 3: i18n 翻訳

- `src/locales/ja/common.json` から `share.kakao_share` を削除
- `src/locales/ko/common.json` から `share.kakao_share` を削除

### Phase 5 のためのコメント追加

将来 Kakao を再実装するときに、今回の経緯が分かるように **`shareUrls.ts` の最後にコメントを残す**：

```typescript
// NOTE: Kakao share is intentionally not implemented in Phase 2.
// The legacy URL scheme (story.kakao.com/share) was deprecated by Kakao.
// Proper implementation requires Kakao JavaScript SDK with appkey registration,
// which will be done together with Kakao Login in Phase 5.
// See ADR-0008 for the decision context.
```

---

## 動作確認とコミット

### typecheck と build

```bash
pnpm typecheck && pnpm build
```

### デプロイ

```bash
firebase deploy --only hosting
```

### Git コミット

1コミットで完結させる：

```
revert(share): remove Kakao share button (legacy URL scheme deprecated)

Kakao deprecated story.kakao.com/share URL scheme. Proper Kakao share
requires JavaScript SDK with appkey registration, deferred to Phase 5
together with Kakao Login implementation.
```

---

## 完了条件

- [ ] `shareUrls.ts` から `buildKakaoShareUrl` 削除、Phase 5 用 NOTE コメント追加
- [ ] `ShareButtonGroup.tsx` から Kakao アイコン定数とボタン削除、不要 import 削除
- [ ] i18n から `share.kakao_share` を ja / ko 両方から削除
- [ ] typecheck / build 成功
- [ ] デプロイ完了
- [ ] 1コミット作成

---

## スコープ外（やらないこと）

- Kakao SDK 導入の試行（Phase 5）
- ネイティブシェア経由での Kakao 対応（既存のネイティブシェアボタンで Kakao Talk 選択可能なので不要）
- OGP キャッシュクリア（X Card Validator はユーザー側で実施）
- カスタムドメイン `animalume.com` への切り替え（別タスク）

---

**作成日**: 2026-05-08
**前提**: ADR-0008（チャット版とCodeの役割分担）、CLAUDE.md §2.2（Tone & Manner: 業者っぽさNG）
