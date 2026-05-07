# Animalume — Setup Guide

このセットアップパックを `sashibe/animalume` リポジトリのルートに展開してから、以下の手順で初期化する。

---

## 0. 前提

- Node.js 20 LTS（`node -v` で確認）
- pnpm 9+（無ければ `npm i -g pnpm`）
- Firebase CLI（`pnpm i -g firebase-tools`）
- Windows PowerShell でOK

---

## 1. ファイル展開

ローカルのリポジトリで実行：

```powershell
# リポジトリにcloneしていなければ
git clone https://github.com/sashibe/animalume.git
cd animalume

# このセットアップパックの中身をリポジトリ直下にコピー
# (setup-pack の中身を全部 animalume/ にマージする)
```

展開後のディレクトリ構造：

```
animalume/
├── CLAUDE.md                  # 既に作成済み
├── README.md
├── SETUP.md                   # この手順書
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── index.html
├── .gitignore
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── vite-env.d.ts
    ├── lib/
    │   ├── firebase.ts
    │   ├── i18n.ts
    │   └── cn.ts
    ├── locales/
    │   ├── ja/common.json
    │   └── ko/common.json
    └── styles/
        └── globals.css
```

---

## 2. 依存インストール

```powershell
pnpm install
```

---

## 3. Firebase プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) で新規プロジェクト作成
   - プロジェクトID: `animalume`（取れなければ `animalume-app` 等）
2. プロジェクトに **Webアプリ** を追加 → 設定値（apiKey等）を取得
3. **Authentication** で「匿名」を有効化
4. **Firestore Database** を作成（リージョン: `asia-northeast1` 東京）
5. 環境変数ファイルを作成：

```powershell
Copy-Item .env.example .env
notepad .env
```

`.env` に Firebase Console から取得した値を貼り付ける。

---

## 4. ローカルで Firebase に接続

```powershell
firebase login
firebase use --add
# プロジェクトを選択、エイリアス名は default
```

これで `.firebaserc` が生成される（gitignore済み）。

---

## 5. 開発サーバー起動

```powershell
pnpm dev
```

`http://localhost:5173` でアクセス。
- Animalumeのロゴと「診断をはじめる」ボタンが表示されればOK
- 画面下に `uid: xxxxxxxx…` が出れば匿名認証成功
- 「switch」ボタンで日本語/韓国語切り替えできる

---

## 6. Firestore ルール デプロイ

```powershell
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## 7. shadcn/ui 初期化（任意・後で）

shadcn/ui を本格導入するときに：

```powershell
pnpm dlx shadcn@latest init
```

対話プロンプトでの推奨回答：

| 項目 | 回答 |
|---|---|
| Style | New York |
| Base color | Stone |
| CSS variables | Yes |
| Tailwind config | `tailwind.config.ts` |
| Global CSS | `src/styles/globals.css` |
| Import alias | `@/components` `@/lib/utils` |

`@/lib/utils` の代わりに既に作成した `@/lib/cn.ts` があるので、`components.json` の `utils` を `@/lib/cn` に書き換えるのが楽。

---

## 8. 初回コミット

```powershell
git add .
git commit -m "chore: initial project setup (Vite + React + TS + Tailwind + Firebase + i18n)"
git push origin main
```

---

## Claude Code に丸投げする場合

リポジトリのルートで `claude` を起動して、以下を投げる：

```
このリポジトリの CLAUDE.md と SETUP.md を読んで、Animalume プロジェクトの初期化を完了させて。

具体的には：
1. pnpm install を実行
2. Firebase Console でプロジェクト作成済み（animalume）、Web アプリ追加済み、API キー等は私が後から .env に投入する。 .env.example に従って .env のテンプレートだけ用意して
3. 動作確認：pnpm dev で起動、ブラウザで localhost:5173 にアクセスし、エラーなくランディングが表示されるか確認
4. 型エラー、lintエラーがあれば修正
5. 最後に初回コミット用のメッセージを提案して
```

---

## 次のステップ（Phase 1着手）

セットアップ完了後、CLAUDE.md の `Implementation Order > Phase 1` に沿って：

1. Cocomi から `swipe-deck` コンポーネントを移植
2. 問題40問（日本語）の作成・JSON化
3. スワイプ → 軸スコアリング → 16タイプ判定ロジック
4. 結果画面（タイプ表示＋ベースキャラ画像）
5. Firestore に results 保存

これらは別タスクで Claude Code に渡す。
