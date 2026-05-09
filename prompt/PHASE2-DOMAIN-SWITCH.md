# Phase 2 完全クロージング — animalume.com への切り替え

カスタムドメイン `animalume.com` の SSL 証明書発行が完了。コードベースを `animalume.web.app` ハードコードから `animalume.com` に切り替える。

---

## 厳守事項（ADR-0008 準拠）

1. **スコープ外の問題に遭遇したら、修正せず報告のみ**。
2. **曖昧な指示・矛盾を見つけたら、実装前に質問**。
3. **「これでいい」と判断した箇所は、根拠を一行コメントで残す**。

---

## 背景

Phase 2 の途中、`animalume.com` の SSL 証明書発行待ちだったため、暫定的に `animalume.web.app` をハードコードしていた。SSL 発行が完了したので、本番ドメインに切り替える。

`animalume.web.app` は Firebase Hosting のデフォルトドメインとして引き続き有効だが、SEO 上の重複コンテンツを避けるため、最終的には `animalume.com` を canonical URL とする。

---

## タスク 1: 事前確認

実装前に以下を確認する。確認不能な場合や予期しない結果が出た場合は、作業を停止して報告する。

### `animalume.com` の稼働確認

```bash
curl -I https://animalume.com/
```

期待される結果：
- `HTTP/2 200` または `HTTP/2 301`/`HTTP/2 302`（リダイレクトの場合）
- `server` ヘッダーが Firebase Hosting を示している

接続失敗・SSL エラー・タイムアウトの場合は実装を停止して報告。

### `animalume.com` で OGP 画像が配信されているか確認

```bash
curl -I https://animalume.com/share-cards/default-ogp-ja.png
```

期待：`HTTP/2 200`、`content-type: image/png`

これが失敗するなら Firebase の Hosting 設定でカスタムドメインの紐付けに問題がある。実装を停止して報告。

---

## タスク 2: ハードコード `animalume.web.app` の置換

以下の4ファイルすべてで `https://animalume.web.app` を `https://animalume.com` に置換する。

### 2-1. `src/features/share/lib/shareUrls.ts`

```typescript
// 変更前
const SITE_URL = 'https://animalume.web.app';

// 変更後
const SITE_URL = 'https://animalume.com';
```

### 2-2. `src/features/share/hooks/useShare.ts`

`navigator.share` の `url` プロパティに渡している `'https://animalume.web.app'` を `'https://animalume.com'` に置換。2箇所あるはず（`files` あり / なしの分岐）。

### 2-3. `src/features/result/components/ResultScreen.tsx`

```typescript
// 変更前
const BASE_URL = 'https://animalume.web.app';

// 変更後
const BASE_URL = 'https://animalume.com';
```

### 2-4. `index.html`

OGP / Twitter Card の URL を一斉置換：

```html
<!-- 変更前 -->
<meta property="og:url" content="https://animalume.web.app" />
<meta property="og:image" content="https://animalume.web.app/share-cards/default-ogp-ja.png" />
<meta name="twitter:image" content="https://animalume.web.app/share-cards/default-ogp-ja.png" />

<!-- 変更後 -->
<meta property="og:url" content="https://animalume.com" />
<meta property="og:image" content="https://animalume.com/share-cards/default-ogp-ja.png" />
<meta name="twitter:image" content="https://animalume.com/share-cards/default-ogp-ja.png" />
```

### 確認: 他に `animalume.web.app` の参照が残っていないか

```bash
grep -r "animalume.web.app" src/ index.html
```

上記4ファイル以外でヒットしたら、その箇所も追加で報告して指示を仰ぐ（勝手に置換しない）。なお、`animalume.web.app` がコメントや NOTE として意図的に残されている可能性もあるので、ヒットした場合は機械的に置換せず**まず内容を確認**する。

---

## タスク 3: canonical link の追加

SEO 上の重複コンテンツ対策として、`index.html` の `<head>` 内に canonical タグを追加する。

```html
<link rel="canonical" href="https://animalume.com/" />
```

配置場所：既存の OGP メタタグ群の直前または直後（`<title>` の後あたりが妥当）。

---

## タスク 4: 301 リダイレクト設定

`animalume.web.app` から `animalume.com` への 301 リダイレクトを設定する。

### 方針の確認

Firebase Hosting で複数ドメインに対応する標準的な方法は2つ：

**方針 A**: `firebase.json` でドメインごとに異なる site を割り当て、`web.app` 側で `redirects` 設定
**方針 B**: アプリ起動時に JS でドメイン判定して `window.location.replace`

**方針 A が推奨**だが、Firebase プロジェクトの構成次第で実装方法が変わる。

### 実装着手前に確認

`firebase.json` を確認して、現在の hosting 設定を把握する：

```bash
cat firebase.json
```

以下のどちらかのケースに該当する：

**ケース 1**: `hosting` が単一の設定（`{"hosting": {...}}`）の場合
- 同じ設定が `animalume.com` と `animalume.web.app` の両方に適用される
- リダイレクト設定をすると両ドメインに適用されてしまうので、**Firebase Console 側で「Redirect」設定**が必要
- このケースでは `firebase.json` の変更ではなくConsole での設定変更となるため、**Code は変更を加えず、ユーザーに「Firebase Console から `animalume.web.app` に対して `animalume.com` へのリダイレクト設定が必要」と報告する**

**ケース 2**: `hosting` が site 配列の場合（`{"hosting": [{"site": "...", ...}, ...]}`）
- site ごとに別設定ができる
- `animalume.web.app` 用 site に `redirects` を追加する形で実装可能
- このケースでは Code が `firebase.json` を編集

### Code の判断

`firebase.json` を読んで、どちらのケースに該当するか報告し、**ユーザーの判断を仰ぐ**こと。勝手にケース 2 の構造に書き換えない。

実装としては Phase 2 のクロージングを最優先するため、リダイレクトが Console 設定になる場合（ケース 1）は、**「Console 側で設定が必要」と報告して Code の作業はそこで停止**でよい。Sori さんが Firebase Console から手動設定する。

---

## タスク 5: 動作確認とコミット

### typecheck と build

```bash
pnpm typecheck && pnpm build
```

### デプロイ

```bash
firebase deploy --only hosting
```

### 動作確認（人間側で実施）

Code はデプロイ完了報告のみ。以下は Sori さんが実機で確認：

- `https://animalume.com/` にアクセスして Animalume が開くか
- 診断完走 → 結果画面 → シェアモーダルで「シェア」した時、共有される URL が `animalume.com` になっているか
- X / LINE のシェアテキストに含まれる URL が `animalume.com` か
- `https://animalume.web.app/` にアクセスした時、`animalume.com` にリダイレクトされるか（リダイレクト設定後）

### Git コミット

2コミットに分ける：

```
1. feat(domain): switch hardcoded URLs from animalume.web.app to animalume.com
   - shareUrls.ts / useShare.ts / ResultScreen.tsx / index.html
   - add canonical link in index.html

2. (条件付き) chore(hosting): configure redirect from web.app to custom domain
   ※ firebase.json に変更が入った場合のみ。Console 設定の場合はコミット不要
```

---

## 完了条件

- [ ] `animalume.com` の HTTPS 接続確認
- [ ] OGP 画像が `animalume.com` 経由で 200 を返すか確認
- [ ] 4ファイルで `animalume.web.app` → `animalume.com` 置換
- [ ] `index.html` に canonical link 追加
- [ ] `grep` で意図しない `animalume.web.app` 参照が残っていないことを確認
- [ ] `firebase.json` の構造を確認、リダイレクト方針をユーザーに報告
- [ ] typecheck / build 成功
- [ ] デプロイ完了
- [ ] 該当する数のコミット作成

---

## スコープ外（やらないこと）

- Firebase Console での操作（リダイレクト設定はユーザーが行う）
- DNS 設定の変更（既に完了している前提）
- SSL 証明書の更新（自動更新）
- OGP キャッシュのクリア（X / LINE 側のキャッシュは時間経過で更新）
- robots.txt や sitemap.xml の整備（Phase 4 以降の SEO タスクとして別途）
- `animalume.jp` `animalume.net` の取り扱い（CLAUDE.md に記載あるが Phase 2 の範囲外）

---

**作成日**: 2026-05-08
**前提**: ADR-0008（チャット版とCodeの役割分担）、Phase 2 OGP・Kakao削除作業完了済み
