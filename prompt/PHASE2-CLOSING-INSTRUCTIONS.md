# Phase 2 クロージング — Kakao シェア追加 + OGP 差し替え（最終版）

Phase 2.0 を完全に閉じるための最終タスク。チャット版での議論結果に基づく仕様確定済み。

---

## 厳守事項（ADR-0008 準拠）

1. **スコープ外の問題に遭遇したら、修正せず報告のみ**。本指示書に書かれていないことは触らない。
2. **曖昧な指示・矛盾を見つけたら、実装前に質問**。事実確認なしの「次の手」は打たない。
3. **「これでいい」と判断した箇所は、根拠を一行コメントで残す**。判断を流さない。

---

## タスク 1: 静的 OGP 画像の差し替え

### 現状

`index.html` の `og:image` が `https://animalume.web.app/share-cards/07enfj-ja.png` を指している。これは ENFJ シェアカードの流用で、未診断ユーザーが URL を踏んだ時に「Animalume = 主人公タイプ」と誤解させる構造になっている。

### 配置済み画像

ユーザーは既に以下の2枚を配置済み：

```
public/share-cards/default-ogp-ja.png  (1200×630, 日本語版ブランドOGP)
public/share-cards/default-ogp-ko.png  (1200×630, 韓国語版ブランドOGP)
```

両方とも汎用ブランドカード（特定タイプを想起させない構成）。実装着手前に両ファイルの存在を確認すること。なければ「画像未配置」として作業を一時停止し、ユーザーに報告。

### 変更内容

`index.html` の OGP / Twitter Card を日本語版に差し替える：

```html
<!-- 変更前 -->
<meta property="og:image" content="https://animalume.web.app/share-cards/07enfj-ja.png" />
<meta name="twitter:image" content="https://animalume.web.app/share-cards/07enfj-ja.png" />

<!-- 変更後 -->
<meta property="og:image" content="https://animalume.web.app/share-cards/default-ogp-ja.png" />
<meta name="twitter:image" content="https://animalume.web.app/share-cards/default-ogp-ja.png" />
```

### 韓国語版の扱い

`default-ogp-ko.png` は配置するが、`index.html` の静的 OGP は HTML が1枚しか持てないため、**現時点では使用しない**。Phase 4（韓国語UI対応）または OGP 動的生成（Phase 2.1）の段階で、`?lang=ko` クエリや User-Agent 判定での切り替えに使用する。

ファイルを配置しておくことの意義：
- Phase 4 着手時に画像生成からやり直さなくて済む
- ResultScreen の `react-helmet-async` で動的に切り替える実装が後で行える
- 静的ファイルとして CDN にキャッシュされるため、将来切り替え時の体験が高速

**今回のタスクではコード変更不要**。ファイルが置かれていることだけ確認する。

---

## タスク 2: Kakao シェアボタン追加

### 背景

Phase 2 で X / LINE のシェア動線は完成済み。Phase 2 完了に向けて Kakao シェアを追加する。

韓国語UIは Phase 4 で対応予定だが、シェア動線は前倒しで実装する。理由：
- 韓国向けシェアカード16枚（`{番号}{コード}-ko.png`）が既に存在する
- Kakao Login SDK は重いが、シェアURL動線は軽い
- 韓国の MZ 세대にリーチする経路を Phase 2 のうちに作る

### 実装方針

**Kakao SDK は使わない**。`https://story.kakao.com/share?url=` のシェアURLスキームを使う方式とする。理由：
- Login SDK との混乱を避ける（Login SDK は Phase 5 で本格導入予定）
- 単純な URL 動線で X / LINE と実装パターンを揃える
- Kakao SDK の `Kakao.Share.sendDefault()` はクライアント側で SDK 初期化が必要で重い

### 実装ファイル

#### `src/features/share/lib/shareUrls.ts` に追加

```typescript
export function buildKakaoShareUrl(): string {
  const url = `${SITE_URL}/`;
  return `https://story.kakao.com/share?url=${encodeURIComponent(url)}`;
}
```

X / LINE と同様、URL のみを共有する形（タイプ別画像はネイティブシェア経由で届く設計を踏襲）。

#### `src/features/share/components/ShareButtonGroup.tsx` に Kakao ボタン追加

X ボタンと LINE ボタンの間に配置。アイコンは Kakao の公式ブランドカラー `#FEE500` の吹き出し型 SVG を使用：

```tsx
const KAKAO_ICON = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" style={{ color: '#FEE500' }} aria-hidden>
    <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.79 1.86 5.24 4.66 6.6l-1.18 4.32c-.1.36.3.65.62.45L11.4 18.5c.2.01.4.02.6.02 5.52 0 10-3.48 10-7.72S17.52 3 12 3z" />
  </svg>
);
```

LINE と同じ階層（アウトライン、ホバー時 `bg-bg-subtle`）。X / LINE / Kakao の3つは並列の選択肢。

実装は **URL動線のシンプル版**でよい（モバイルで「ネイティブシェア」ボタンが既にあるため、Kakao ボタンは URL シェアに専念させる）：

```tsx
<a
  href={buildKakaoShareUrl()}
  target="_blank"
  rel="noopener noreferrer"
  className={`${btnBase} border border-border text-ink hover:bg-bg-subtle`}
>
  {KAKAO_ICON}
  {t('share.kakao_share')}
</a>
```

#### `src/locales/ja/common.json` と `src/locales/ko/common.json` に翻訳追加

```json
// ja
"share.kakao_share": "Kakao でシェア"

// ko
"share.kakao_share": "카카오로 공유"
```

### 配置順

ネイティブシェアボタン（最上部・主役）→ X → LINE → **Kakao（新規追加）** → 画像保存

理由：日本語UIメイン環境では X / LINE がメイン動線、Kakao はサブ。視覚階層もそれに従う。

---

## タスク 3: 動作確認とコミット

### typecheck と build

```bash
pnpm typecheck && pnpm build
```

両方通ることを確認してからデプロイに進む。失敗したら原因を報告して指示を仰ぐ。

### デプロイ

```bash
firebase deploy --only hosting
```

### 動作確認（人間側で実施するため、Code はデプロイ完了報告のみ）

- OGP 画像が `default-ogp-ja.png` に切り替わっているか（X Card Validator または LINE で確認）
- Kakao シェアボタンが表示されるか
- Kakao ボタンをタップして `story.kakao.com` の共有画面が開くか
- `default-ogp-ko.png` ファイルが `https://animalume.web.app/share-cards/default-ogp-ko.png` で 200 を返すか（cURL or ブラウザで確認）

### Git コミット

3つのコミットに分ける（粒度を細かく保つ）：

```
1. feat(ogp): add bilingual brand OGP images (ja/ko)
   - public/share-cards/default-ogp-ja.png
   - public/share-cards/default-ogp-ko.png

2. fix(ogp): replace type-specific OGP with generic brand card
   - index.html の og:image / twitter:image を default-ogp-ja.png に変更

3. feat(share): add Kakao share button
   - shareUrls.ts に buildKakaoShareUrl 追加
   - ShareButtonGroup.tsx に Kakao ボタン追加
   - locales に翻訳追加
```

`default-ogp-ko.png` は配置のみで `index.html` での参照は無いが、Phase 4 で使うために含めておく。

---

## 完了条件

- [ ] `public/share-cards/default-ogp-ja.png` と `default-ogp-ko.png` の存在確認
- [ ] `index.html` の OGP / Twitter Card 画像が `default-ogp-ja.png` を指す
- [ ] `shareUrls.ts` に `buildKakaoShareUrl` を追加
- [ ] `ShareButtonGroup.tsx` に Kakao ボタンを追加（X と LINE の間）
- [ ] i18n 翻訳追加（ja / ko）
- [ ] typecheck / build 成功
- [ ] デプロイ完了
- [ ] `default-ogp-ko.png` が CDN で配信されているか確認
- [ ] 3コミット作成

---

## スコープ外（やらないこと）

以下は今回の指示書の範囲外。気付いても実装しない。気になる点があれば作業完了後に報告のみ：

- Kakao Login SDK の導入（Phase 5）
- 韓国語UIの本格対応（Phase 4）
- OGP の動的生成 / 言語別切り替え（Phase 2.1 または Phase 4）
- カスタムドメイン `animalume.com` への切り替え（SSL 発行待ち、別タスク）
- シェアテキストの韓国語ニュアンス調整（Phase 4 のネイティブレビュー時）
- `default-ogp-ko.png` の static OGP への動的反映（Phase 4）

---

**作成日**: 2026-05-08
**更新**: 配置パスを `public/share-cards/` に統一、bilingual OGP 対応に変更
**前提**: ADR-0008（チャット版とCodeの役割分担）
