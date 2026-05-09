# 管理画面エディタ lint エラー修正指示書

> 前提: `docs/admin-editor-implementation.md` の実装が完了し、`pnpm typecheck` と `pnpm build` は通る状態。`pnpm lint` のみ失敗している。

## 0. 修正対象のエラー

```
src/components/ui/button.tsx
  48:18  warning  Fast refresh only works when a file only exports components.
                  react-refresh/only-export-components

src/features/admin/publish/PublishDialog.tsx
  22:22  error    '_contentType' is defined but never used
                  @typescript-eslint/no-unused-vars
```

エラー 1 件・警告 1 件。`--max-warnings 0` 設定のため警告も修正対象。

---

## 1. 修正 1: PublishDialog の未使用 prop を削除

**原因**: `contentType` を Props に定義したが、`PublishDialog` 内部では使っていない（呼び出し元の識別子として渡しているだけで、ダイアログ自体は contentLabel しか表示しない）。

### 1.1 `src/features/admin/publish/PublishDialog.tsx`

#### Props 型から削除

```tsx
// 修正前
type Props<T> = {
  open: boolean;
  contentType: ContentType;
  contentLabel: string;
  draft: T;
  fetchPublished: () => Promise<T | null>;
  onPublish: (changeNote: string) => Promise<void>;
  onClose: () => void;
};

// 修正後（contentType の行を削除）
type Props<T> = {
  open: boolean;
  contentLabel: string;
  draft: T;
  fetchPublished: () => Promise<T | null>;
  onPublish: (changeNote: string) => Promise<void>;
  onClose: () => void;
};
```

#### 関数引数からも削除

```tsx
// 修正前
export function PublishDialog<T>({
  open, contentType, contentLabel,
  draft, fetchPublished, onPublish, onClose,
}: Props<T>) {

// 修正後
export function PublishDialog<T>({
  open, contentLabel,
  draft, fetchPublished, onPublish, onClose,
}: Props<T>) {
```

#### 不要になる import の削除

ファイル先頭の import から `ContentType` を削除（他で使っていない場合）：

```tsx
// 修正前
import type { ContentType } from '../shared/types';

// 修正後（行ごと削除。他の型と一緒の import になっている場合は ContentType だけ除外）
```

`grep` で `ContentType` がファイル内の他の場所で使われていないことを確認してから削除すること。

### 1.2 呼び出し元 3 箇所からも `contentType` prop を削除

以下の 3 ファイルで `<PublishDialog ... contentType="..." ... />` の `contentType` 行を削除する。

#### `src/features/admin/types/TypeEditor.tsx`

```tsx
// 修正前
<PublishDialog
  open={pub.dialogOpen}
  contentType="type"
  contentLabel={`${typeCode} - タイプ説明`}
  ...
/>

// 修正後
<PublishDialog
  open={pub.dialogOpen}
  contentLabel={`${typeCode} - タイプ説明`}
  ...
/>
```

#### `src/features/admin/questions/QuestionEditor.tsx`

```tsx
// 修正前
<PublishDialog
  open={pub.dialogOpen}
  contentType="question"
  contentLabel={...}
  ...
/>

// 修正後（contentType 行を削除）
```

#### `src/features/admin/ui-strings/UiStringsEditor.tsx`

```tsx
// 修正前
<PublishDialog
  open={pub.dialogOpen}
  contentType="ui-strings"
  contentLabel="UI文言"
  ...
/>

// 修正後（contentType 行を削除）
```

---

## 2. 修正 2: button.tsx の Fast Refresh 警告

**原因**: shadcn/ui 標準の `button.tsx` は `Button` コンポーネントに加えて `buttonVariants`（cva の戻り値関数）も export している。Fast Refresh は「ファイルからコンポーネントのみが export されている」ことを期待するため警告が出る。**shadcn/ui プロジェクト全体で起きる既知の警告**であり、機能上の問題はない。

### 2.1 ESLint 設定で shadcn/ui ディレクトリを除外（推奨）

プロジェクトの ESLint 設定ファイルを編集する。設定ファイルの場所は以下のいずれか：

- `.eslintrc.cjs`
- `.eslintrc.js`
- `.eslintrc.json`
- `eslint.config.js`（Flat Config）

ファイル形式によって書き方が異なるので、**まず以下のコマンドで設定ファイルを特定**してから編集すること：

```bash
ls -la .eslintrc* eslint.config.*
```

#### ケース A: `.eslintrc.cjs` または `.eslintrc.js` の場合

ファイル末尾の `module.exports = { ... }` 内に `overrides` を追加する。既に `overrides` がある場合は配列に追記。

```js
module.exports = {
  // ... 既存の設定
  overrides: [
    {
      files: ['src/components/ui/**/*.tsx'],
      rules: {
        'react-refresh/only-export-components': 'off',
      },
    },
  ],
};
```

#### ケース B: `eslint.config.js`（Flat Config）の場合

`export default [...]` 配列に新しい設定オブジェクトを追加：

```js
export default [
  // ... 既存の設定
  {
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
];
```

#### ケース C: `.eslintrc.json` の場合

```json
{
  "overrides": [
    {
      "files": ["src/components/ui/**/*.tsx"],
      "rules": {
        "react-refresh/only-export-components": "off"
      }
    }
  ]
}
```

### 2.2 設定ファイルの編集が難しい場合のフォールバック

ESLint 設定の構造が複雑で編集が困難な場合のみ、`button.tsx` のファイル先頭に直接ディレクティブを追加：

```tsx
/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
// ... 既存のコード
```

ただし将来 shadcn/ui の他のコンポーネント（`input.tsx` など）を追加するたびに同じディレクティブを書くことになるので、**2.1 の設定ファイル編集を優先**すること。

---

## 3. 検証

修正後、以下のコマンドを順に実行して全て成功することを確認：

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

PowerShell 環境では `&&` が使えないため、セミコロン区切りでも可：

```powershell
pnpm typecheck; pnpm lint; pnpm build
```

### 期待される出力

```
typecheck: 0 errors
lint:      ✖ 0 problems  (または出力なしで終了)
build:     ✓ built in N.NNs
```

`Some chunks are larger than 500 kB` の警告は **無視してよい**（バンドルサイズ警告であり、機能上の問題ではない。MVP フェーズでは対応不要）。

---

## 4. 修正完了後の報告

以下を報告してください：

- [ ] `PublishDialog.tsx` の Props 型と関数引数から `contentType` を削除
- [ ] `TypeEditor.tsx` / `QuestionEditor.tsx` / `UiStringsEditor.tsx` の 3 箇所から `contentType="..."` 属性を削除
- [ ] `PublishDialog.tsx` の `ContentType` import を削除（他で使われていない場合）
- [ ] ESLint 設定で `src/components/ui/**/*.tsx` の `react-refresh/only-export-components` ルールを無効化
- [ ] `pnpm typecheck` 成功
- [ ] `pnpm lint` 成功（0 problems）
- [ ] `pnpm build` 成功

---

**End of Document**
