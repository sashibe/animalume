# Animalume - docs/ フォルダ構成の更新

CLAUDE.md §14, §15 の追加に伴い、`docs/` ディレクトリの構成を整理してください。

---

## 現状確認

### 既に存在するファイル（と思われる）

CLAUDE.md §6 Directory Structure に記載されているファイル：

- `docs/data-model.md`
- `docs/question-design.md`
- `docs/character-design.md`
- `docs/monetization.md`

→ **これらが実在するか、Claude Code 側で `view` ツールで確認してから作業すること。**
存在しない場合はその旨報告し、新規作成の判断を Sori に求めてください。

### 既に作業済み

- ✅ `docs/decisions/0001-mbti-axis-scoring.md` から `0007-line-kakao-login-priority.md` まで配置済み
- ✅ CLAUDE.md §14, §15 追加済み

### 今回の作業対象

未作成のファイルを以下の構成で整える：

```
docs/
├── README.md                         ← 新規（任意、後でも可）
├── decisions/                        ← 既存
│   ├── README.md                     ← 新規（ADR 一覧）
│   ├── 0001-mbti-axis-scoring.md
│   ├── 0002-types-can-change-philosophy.md
│   ├── 0003-firebase-stack.md
│   ├── 0004-no-individual-monetization.md
│   ├── 0005-character-3-variant-pregeneration.md
│   ├── 0006-cocomi-asset-reuse.md
│   └── 0007-line-kakao-login-priority.md
├── design/                           ← 新規ディレクトリ
│   ├── design-tokens.md              ← 新規
│   └── character-design.md           ← 既存があれば移動、なければ新規
├── data-model.md                     ← 既存（あれば維持）
├── question-design.md                ← 既存（あれば維持）
├── monetization.md                   ← 既存（あれば維持）
└── qa-scenarios.md                   ← 新規
```

---

## Task 1: docs/decisions/README.md を作成

ADR 一覧を管理するインデックスファイル。

### 配置先
`docs/decisions/README.md`

### 内容

```markdown
# Architecture Decision Records (ADR)

Animalume プロジェクトの技術的・戦略的な重要決定を記録するドキュメント群です。

CLAUDE.md §15 ADR の運用ルールに従い、新規 ADR を追加・更新する際はこのインデックスも併せて更新してください。

---

## 一覧

| # | タイトル | 状態 | 重要度 | 作成日 |
|---|---|---|---|---|
| [0001](./0001-mbti-axis-scoring.md) | MBTI 軸スコアリング採用（Big Five / HEXACO 比較） | Accepted | 高 | 2026-05-08 |
| [0002](./0002-types-can-change-philosophy.md) | 「MBTIタイプは変化する」前提の根拠 | Accepted | 最高 | 2026-05-08 |
| [0003](./0003-firebase-stack.md) | Firebase / Firestore 選定（Supabase / AWS 比較） | Accepted | 中 | 2026-05-08 |
| [0004](./0004-no-individual-monetization.md) | 個人課金なし、データライセンス事業モデル | Accepted | 高 | 2026-05-08 |
| [0005](./0005-character-3-variant-pregeneration.md) | キャラクター3バージョン事前生成方式 | Accepted | 中 | 2026-05-08 |
| [0006](./0006-cocomi-asset-reuse.md) | Cocomi 資産（swipe-deck 等）流用判断 | Accepted | 中 | 2026-05-08 |
| [0007](./0007-line-kakao-login-priority.md) | LINE / Kakao Login 優先（Instagram 後回し） | Accepted | 中 | 2026-05-08 |

## 状態の凡例

- **Draft**: 起草中、合意形成前
- **Proposed**: レビュー待ち
- **Accepted**: 採用、実装に反映済み（または反映予定）
- **Superseded**: 別の ADR により置き換えられた（リンクを記載）
- **Deprecated**: 採用を取り下げた

## 新規 ADR 作成の手順

1. CLAUDE.md §15.2 の作成基準を満たすか確認
2. 連番（次は 0008）でファイル作成：`NNNN-kebab-case-title.md`
3. CLAUDE.md §15.4 のフォーマットに従って執筆
4. 本 README の一覧に追記

## 関連

- [CLAUDE.md §15 - Architecture Decision Records 運用ルール](../../CLAUDE.md)
- [CLAUDE.md §13.3 - To Be Decided](../../CLAUDE.md)（未決事項リスト、ADR 化の入口）
```

**注意**: 各 ADR の作成日は実際のファイルの作成日に合わせること。
今回 7本まとめて作成された場合は全て `2026-05-08`。

---

## Task 2: docs/design/ ディレクトリを作成

### 2-1. ディレクトリ作成

`docs/design/` ディレクトリを新規作成。

### 2-2. design-tokens.md を作成

`docs/design/design-tokens.md` を以下の内容で新規作成：

```markdown
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
```

### 2-3. character-design.md の取り扱い

`docs/character-design.md` が**既存で存在する場合**：
- `docs/design/character-design.md` に**移動**してください
- 移動後、CLAUDE.md §6 の Directory Structure 記述を更新（必要なら）

`docs/character-design.md` が**存在しない場合**：
- 新規作成は**今回はしない**
- TODO として Sori に報告

---

## Task 3: docs/qa-scenarios.md を新規作成

CLAUDE.md §14.8 で言及されている QA シナリオ管理ファイル。

### 配置先
`docs/qa-scenarios.md`

### 内容

```markdown
# QA Scenarios / Animalume

> CLAUDE.md §14.8 の QA シナリオ管理。
> 機能追加・変更時にシナリオを追加・更新する。

---

## 現フェーズ（MVP-speed-first）の主要シナリオ

### S1. 診断完走から結果表示まで

**手順**:
1. ホーム画面 → 「診断をはじめる」
2. 40問のスワイプ・タップ回答
3. 結果画面が表示される

**確認ポイント**:
- [ ] 進捗バーが正しく進む
- [ ] 「ひとつ戻る」が 2問目以降で機能
- [ ] 1問目でスワイプヒントが表示される
- [ ] 軸スコアリングが計算される
- [ ] 16タイプのいずれかに判定される
- [ ] 結果画面でタイプ名・キャラ画像・キャッチコピー・本質説明が表示される
- [ ] 確信度に応じてキャラ画像のバリエーション（standard / shimmer / quiet）が切り替わる
- [ ] アコーディオン（各軸の傾向・あなたの強み・関係性での傾向）が動作する

### S2. 結果保存と履歴

**手順**:
1. S1 を完了
2. 結果が Firestore に保存されることを確認
3. （Phase 3 実装後）履歴一覧画面で過去の結果を表示
4. 比較ビューで過去結果と現在結果を並べて表示

**確認ポイント**:
- [ ] `results/{resultId}` に正しい型で保存される
- [ ] 保存される項目: type, scores, confidence, answers, locale, takenAt 等
- [ ] 匿名認証ユーザーでも保存される

### S3. シェア体験（Phase 2 実装後）

**手順**:
1. 結果画面の「シェアする」ボタン
2. シェア画像（1080×1080 / 1080×1920）が表示される
3. SNS に投稿、または画像保存

**確認ポイント**:
- [ ] 1:1 シェアカードが正しく表示される
- [ ] 9:16 ストーリーズ用が正しく表示される
- [ ] Web Share API が動作する（モバイル）
- [ ] 各 SNS のシェア URL が正しい
- [ ] 画像保存ができる

### S4. 認証アップグレード

**手順**:
1. 匿名認証で診断 → 結果保存
2. ソーシャルログイン（Google / Twitter / LINE / Kakao）でアップグレード
3. アップグレード後も過去の結果が表示される

**確認ポイント**:
- [ ] 匿名 UID と新 UID の結果が紐付く
- [ ] 履歴の引き継ぎが行われる

### S5. 言語切替

**手順**:
1. ホーム画面の言語切替トグルで「ja → ko」または「ko → ja」
2. UI 全体が切り替わる
3. 診断・結果ともに対応言語で表示される

**確認ポイント**:
- [ ] 全 UI 文字列が切り替わる
- [ ] 問題プールが切り替わる（ja-pool / ko-pool）
- [ ] 結果画面のタイプ名・キャッチコピー・各軸ラベル・強み・関係性すべて切り替わる
- [ ] 切替設定が `localStorage.animalume.lang` に保存される

### S6. 確信度別キャラクターバリエーション

**手順**:
1. 全軸を一方向に偏らせて回答 → 確信度 75% 以上 → shimmer 表示
2. 全軸をバランスよく回答 → 確信度 40-75% → standard 表示
3. 全軸を矛盾する回答 → 確信度 40% 未満 → quiet 表示

**確認ポイント**:
- [ ] `pickVariantFromConfidence()` が正しく分岐
- [ ] 該当する PNG 画像が表示される
- [ ] 縁取り色（CharacterFrame）がグループに応じて変わる

### S7. 適当回答フラグ判定（Phase 後期）

**手順**:
1. 最短時間で全 40問を一方向にスワイプ
2. 結果が `quality.flagged: true` でマークされる
3. データ販売時の集計から除外される

**確認ポイント**:
- [ ] 回答時間が閾値以下なら flagged
- [ ] 全問同方向ならパターン検出される
- [ ] フラグ理由が `quality.reason` に記録される

---

## 機能追加時のチェックリスト

新機能を実装した際は、以下を確認：

1. このシナリオ一覧に新規シナリオを追加すべきか
2. 既存シナリオに影響がないか（特に S1, S5, S6 はコア機能）
3. データ品質に影響しないか（適当回答検出、属性収集等）

---

## 関連

- [CLAUDE.md §14.8 QA シナリオ管理](../CLAUDE.md)
- [CLAUDE.md §3.2 Data Quality KPIs](../CLAUDE.md)
```

---

## Task 4: docs/README.md を作成（任意、優先度低）

`docs/` 全体の目次ファイル。書く場合は以下：

```markdown
# Animalume Documentation

このディレクトリには Animalume プロジェクトのドキュメントが集約されています。

## ディレクトリ構成

- [`decisions/`](./decisions/README.md) - Architecture Decision Records (ADR)
- [`design/`](./design/) - デザインシステム関連
  - [design-tokens.md](./design/design-tokens.md) - カラー・タイポ・スペーシング等のトークン仕様
  - [character-design.md](./design/character-design.md) - キャラクター世界観
- [data-model.md](./data-model.md) - Firestore データモデル
- [question-design.md](./question-design.md) - 問題設計の指針
- [monetization.md](./monetization.md) - 将来の収益化案メモ
- [qa-scenarios.md](./qa-scenarios.md) - QA シナリオ一覧

## 関連

- ルート: [CLAUDE.md](../CLAUDE.md) - プロジェクト全体仕様
- ルート: [README.md](../README.md) - リポジトリ概要
```

これは余裕があれば。MVP 段階では必須ではない。

---

## Task 5: CLAUDE.md §6 Directory Structure の更新

CLAUDE.md §6 のディレクトリ構造の記述を、新しい構成に合わせて更新：

```
docs/
├── README.md                       # docs全体の目次（任意）
├── decisions/                      # Architecture Decision Records
│   ├── README.md                   # ADR 一覧
│   ├── 0001-mbti-axis-scoring.md
│   ├── 0002-types-can-change-philosophy.md
│   ├── 0003-firebase-stack.md
│   ├── 0004-no-individual-monetization.md
│   ├── 0005-character-3-variant-pregeneration.md
│   ├── 0006-cocomi-asset-reuse.md
│   └── 0007-line-kakao-login-priority.md
├── design/                         # デザイン関連
│   ├── design-tokens.md            # カラー・タイポ・スペーシング等
│   └── character-design.md         # キャラクター世界観
├── data-model.md                   # Firestore データモデル詳細
├── question-design.md              # 問題設計の指針
├── monetization.md                 # 収益化案メモ
└── qa-scenarios.md                 # QA シナリオ一覧
```

---

## 実装順序の推奨

1. **Task 1**: `docs/decisions/README.md` 作成（軽い、すぐ完了）
2. **Task 2**: `docs/design/` ディレクトリ作成 + `design-tokens.md` 作成（メイン作業）
   - 既存の `character-design.md` があれば移動
3. **Task 3**: `docs/qa-scenarios.md` 作成
4. **Task 5**: CLAUDE.md §6 Directory Structure を更新
5. **Task 4**: `docs/README.md` 作成（時間あれば）

---

## 完成条件

- [ ] `docs/decisions/README.md` が作成され、7本の ADR が一覧化されている
- [ ] `docs/design/` ディレクトリが存在
- [ ] `docs/design/design-tokens.md` が完備
- [ ] 既存の `character-design.md` がある場合、`docs/design/character-design.md` に移動済み
- [ ] `docs/qa-scenarios.md` が作成
- [ ] CLAUDE.md §6 の Directory Structure が新構成を反映
- [ ] `docs/README.md`（任意）

---

## コミット粒度

```
docs(adr): docs/decisions/README.md でADR 7本を一覧化
docs(design): docs/design/ ディレクトリ新設、design-tokens.md を整備
docs(design): character-design.md を docs/design/ に移動  ← 該当する場合
docs(qa): qa-scenarios.md を新規作成
docs(claude): §6 Directory Structure を新フォルダ構成に更新
docs: docs/README.md を追加  ← 任意
```

---

## 完了報告

すべて完了したら、以下を報告してください：

1. 作成・更新したファイル一覧
2. `docs/character-design.md` の有無と取り扱い
3. CLAUDE.md §6 の更新内容（差分）
4. 何か気付いた点（既存ファイル間の整合性ズレ等）

---

開始してください。
