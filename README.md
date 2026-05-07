# Animalume

> あなたの内なる光に出会う。
> スワイプで答える性格診断、変化を可視化するMBTI。

[animalume.com](https://animalume.com) ・ [animalume.jp](https://animalume.jp)

---

## 概要

**Animalume**（アニマリュム）は、MBTIの理論枠組みをベースにしたスワイプ式の性格診断アプリです。

### 特徴

- 完全無料、有料壁なし
- 状況提示型 + 二択の40問
- 16タイプの独自キャラクターと結果ビジュアル
- スコア強度の可視化（"86% I" 形式）
- **タイプの変化を時系列で記録・比較**できる履歴機能
- LINE / Kakao連携で友達相性診断（Phase 5）
- 日本語 / 韓国語対応

詳細な設計思想は [`CLAUDE.md`](./CLAUDE.md) を参照してください。

## 開発

### Requirements

- Node.js 20 LTS
- pnpm 9+
- Firebase CLI

### Setup

```bash
# 依存インストール
pnpm install

# .env の作成（.env.example をコピーして Firebase の値を埋める）
cp .env.example .env

# 開発サーバー起動
pnpm dev
```

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm preview` | ビルド結果のローカルプレビュー |
| `pnpm typecheck` | 型チェック |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm deploy` | Firebase Hosting へデプロイ |

## ライセンス・運営

株式会社AXP JAPAN

