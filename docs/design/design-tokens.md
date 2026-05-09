# Design Tokens / Animalume

> Animalume のデザインで使うすべての視覚的トークン
> （色・タイポグラフィ・スペーシング等）の仕様書。
> 実装は `tailwind.config.ts` および `src/styles/globals.css` に反映されている。

---

## カラーパレット

### 基調色

| トークン名 | HEX | 用途 |
|---|---|---|
| `bg` | `#FAF9F6` | メイン背景（オフホワイト） |
| `bg-subtle` | `#F4F2EE` | カード背景、セクション背景 |
| `bg-muted` | `#EBE8E0` | 控えめな区切り背景 |
| `bg-rose` | `#FAF5F3` | 進捗フェーズ1（11-20問）の背景 |
| `bg-sage` | `#F7FAF6` | 進捗フェーズ2（21-30問）の背景 |
| `bg-gold` | `#FAF7F1` | 進捗フェーズ3（31-40問）の背景 |
| `border` | `#E5E1D8` | ボーダー全般 |
| `border-strong` | `#D4CFC2` | 強調ボーダー |

### テキスト色

| トークン名 | HEX | 用途 |
|---|---|---|
| `ink` | `#2A2925` | 見出し、強調テキスト（チャコール） |
| `ink-soft` | `#5A574F` | 本文 |
| `ink-mute` | `#8A8478` | キャプション、補足 |

### アクセント色（4軸対応）

| トークン名 | HEX | 用途 |
|---|---|---|
| `accent-rose` | `#D9A5A0` | くすみピンク（EI 軸用、NF グループ） |
| `accent-sage` | `#A8B5A0` | セージグリーン（SN 軸用、SP グループ） |
| `accent-mist` | `#B0BEC5` | くすみブルー（TF 軸用、NT グループ） |
| `accent-gold` | `#C9B48A` | ミューテッドゴールド（JP 軸用、SJ グループ） |

### グループカラー（16タイプを4グループに分類）

| グループコード | グループ名 | アクセント色 |
|---|---|---|
| NT | 光の探究者たち | `accent-mist` |
| NF | 光を編む人たち | `accent-rose` |
| SJ | 光の番人たち | `accent-gold` |
| SP | 光の踊り手たち | `accent-sage` |

### 状態色

| 用途 | 色 |
|---|---|
| 成功・完了 | `accent-sage` |
| エラー・警告 | `accent-rose` を濃くした版 |
| 情報 | `accent-mist` |

**重要**: 赤・緑・黄のような強い信号色は使わない。
すべての状態表現を、上記のくすみカラー内で完結させる。

---

## タイポグラフィ

### フォントファミリー

| フォント | 用途 |
|---|---|
| **Noto Sans JP** | 本文・UI（日本語優先） |
| **Pretendard** | 韓国語フォールバック |
| **Noto Serif JP** | 見出し、タイプ名表示 |

Phase 1.6 で Pretendard 単独運用から Noto Sans JP 優先に変更。
理由は ADR-0001 / Phase 1.6 リリースノートを参照。

### フォントサイズスケール

| トークン | サイズ | 用途 |
|---|---|---|
| `text-xs` | 12px | キャプション、補足説明 |
| `text-sm` | 14px | 本文小、メタ情報 |
| `text-base` | 16px | 本文標準 |
| `text-lg` | 18px | 強調本文、選択肢 |
| `text-xl` | 20px | サブ見出し |
| `text-2xl` | 24px | セクション見出し |
| `text-3xl` | 30px | カードタイトル |
| `text-4xl` | 36px | タイプコード（INTJ等の4文字） |
| `text-5xl` | 48px | ヒーローテキスト |

### フォントウェイト

| トークン | 値 | 用途 |
|---|---|---|
| `font-light` | 300 | 控えめな表現、引用 |
| `font-normal` | 400 | 本文標準 |
| `font-medium` | 500 | UI 要素、ボタン |
| `font-semibold` | 600 | 強調 |
| `font-bold` | 700 | 見出し |

### 行間（line-height）

| トークン | 値 | 用途 |
|---|---|---|
| `leading-tight` | 1.25 | 見出し |
| `leading-snug` | 1.4 | サブ見出し |
| `leading-normal` | 1.5 | UI 要素 |
| `leading-relaxed` | 1.625 | 本文（読み物として読ませる場合） |

### 日本語の禁則処理

すべての日本語テキスト要素には以下の CSS が適用されている（Phase 1.7 で追加）：

```css
word-break: keep-all;
overflow-wrap: anywhere;
line-break: strict;
```

ユーザーが意図的に改行したい場合は、i18n テキストや TypeScript ファイル中で `\n` を使う。
表示側のコンポーネントは `whitespace-pre-line` クラスを付けて `\n` を改行として扱う。

---

## スペーシング

Tailwind のデフォルトを使用。
**「余白を多めに使うこと」が Animalume の美学**。

| 用途 | 推奨値 |
|---|---|
| 要素間の最小スペース | `space-y-2` (8px) |
| カード内padding | `p-6` (24px) |
| セクション間 | `space-y-8` (32px) - `space-y-12` (48px) |
| 画面端の margin | `px-6` (24px) - `px-8` (32px) |
| ヒーロー要素の余白 | `py-16` (64px) - `py-24` (96px) |

---

## ボーダー半径

| トークン | 値 | 用途 |
|---|---|---|
| `rounded-md` | 6px | 小さなボタン、タグ |
| `rounded-lg` | 8px | 標準ボタン、入力 |
| `rounded-xl` | 12px | カード（小） |
| `rounded-2xl` | 16px | カード（標準）、画像 |
| `rounded-3xl` | 24px | 大型カード、結果カード |
| `rounded-full` | 9999px | アバター、ピル型ボタン |

---

## シャドウ

派手な影は使わない。

| トークン | 用途 |
|---|---|
| `shadow-sm` | カードのほのかな浮き |
| `shadow-soft` | デフォルトの軽い影 |
| `shadow-editorial` | 雑誌写真のような上品な影（透明度 4-6%） |
| `shadow-editorial-md` | QuestionCard 用、やや強め（透明度 6-8%） |
| `shadow-editorial-lg` | 大型要素用 |

**強い影 (`shadow-lg`, `shadow-xl`, `shadow-2xl`) は禁止**。

---

## アニメーション原則

### Duration

| トークン | 値 | 用途 |
|---|---|---|
| `duration-200` | 200ms | マイクロインタラクション |
| `duration-300` | 300ms | 状態変化（アコーディオン開閉等） |
| `duration-500` | 500ms | カード遷移、フェード |
| `duration-700` | 700ms | ページ遷移、大きな変化 |
| `duration-1000` | 1000ms | 進捗フェーズ背景遷移 |

### Easing

| トークン | 用途 |
|---|---|
| `ease-out` | 標準（要素登場時） |
| `ease-in-out` | 連続的な動き |
| `ease-linear` | 進捗バー |

**bounce、spring 系の弾むアニメーションは使わない**。
落ち着いた、上品な動きのみ。

### prefers-reduced-motion 対応

すべてのアニメーションは `prefers-reduced-motion: reduce` を尊重する。
`useReducedMotion` フックまたは `motion-safe:` プレフィックスを使う。

---

## アイコン

### ライブラリ

**Lucide Icons**（`lucide-react`）。

### スタイル

- **線画ベース**（fill されてないアウトラインスタイル）
- **stroke-width**: 1.5
- **サイズ**:
  - 小: 16px (`w-4 h-4`)
  - 標準: 20px (`w-5 h-5`)
  - 大: 24px (`w-6 h-6`)
- **色**: `ink-soft` または `ink-mute` を基調

### 結果画面のアコーディオンアイコン

| セクション | アイコン |
|---|---|
| 各軸の傾向 | `Compass` |
| あなたの強み | `Sparkles` |
| 関係性での傾向 | `Users` |

---

## レイアウト

### コンテナ幅

| 名前 | 幅 | 用途 |
|---|---|---|
| `max-w-md` | 448px | モバイルメインレイアウト |
| `max-w-2xl` | 672px | 読み物画面（結果画面の本文部分） |
| `max-w-4xl` | 896px | デスクトップでの全体レイアウト |

`mx-auto` で中央揃え。

### セーフエリア対応

iOS Safari のノッチ・ホームバーに対応するため、画面最外コンテナに以下を適用：

- `safe-top`（既存ユーティリティクラス）
- `safe-bottom`（既存ユーティリティクラス）

---

## 関連

- [CLAUDE.md §10 Brand Guidelines](../../CLAUDE.md)
- [character-design.md](./character-design.md)
- [tailwind.config.ts](../../tailwind.config.ts)
- [src/styles/globals.css](../../src/styles/globals.css)
