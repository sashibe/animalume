# CLAUDE.md — Animalume

> **Animalume**（アニマリュム） / Anima + lume（光） / 株式会社AXP JAPAN
> リポジトリ: https://github.com/sashibe/animalume
> ドメイン: animalume.com / animalume.jp / animalume.net

---

## 1. Project Overview

### 1.1 What is Animalume

スワイプ式の性格診断アプリ。MBTIの理論枠組みをベースに、状況提示型の問題でユーザーの性格タイプを判定し、16タイプの独自キャラクターと共に結果を提示する。

**コアコンセプト：「変化を可視化するMBTI」**

公式MBTIや16personalitiesが「タイプは生得的で不変」を建前にしているのに対し、Animalumeは**MBTIタイプが時間と共に変化することを正面から認め、その変化を記録・可視化することを中核体験**に据える。

### 1.2 Target User

- **メインターゲット**: 20代後半〜30代前半の日本の女性（森香澄世代）
- **属性イメージ**: キャリア志向、SNSリテラシー高、自己分析・内省コンテンツ好き、コスメ・ライフスタイル感度高、占いより心理学を信じる層
- **拡張ターゲット**: K-popファンダム、韓国の同世代女性（韓国語対応で取り込み）

### 1.3 Differentiation

| 観点 | 既存サービス | Animalume |
|---|---|---|
| 価格 | 無料診断＋有料詳細レポート（1万字数千円） | **完全無料、詳細レポートも無料** |
| タイプ変化 | 「変わらない」が建前 | **「変わる」を正面から認める** |
| 結果体験 | テキスト主体 | キャラクター容姿変化 + シェア画像生成 |
| 相性診断 | 16タイプ間の一般論 | **LINE/Kakao友達との実名相性** |
| 言語 | 日本語のみ or 直訳 | 日本語・韓国語ネイティブ品質 |

---

## 2. Product Philosophy

> **Animalumeは「無料で本気のクオリティ」を貫く。**
> 個人ユーザーから課金せず、匿名集計データの法人ライセンスとブランドコラボで運営する。

### 2.1 判断に迷ったときの指針

- ユーザーから金を取りたくなったら、その機能は無料化できる方法を探す
- 「業者っぽい」と感じる施策はNG
- 学術的根拠と誠実な留保を、エンタメ性と両立させる
- 既存の有料分析業者を一掃するクオリティを目指す

### 2.2 Tone & Manner

- **OK**: 知的、穏やか、誠実、洗練、ミニマル
- **NG**: 媚びる、占い的、決めつける、煽る、断言しすぎる
- **NG表現例**: 「あなたって〇〇な人！」「絶対に〇〇です」「あなたの運命は…」
- **OK表現例**: 「〇〇の傾向が強く出ています」「あなたの中に〇〇な側面があります」

### 2.3 学術的誠実さ

- MBTI理論への留保を明示する：「これは絶対の真理ではなく自己理解のツール」
- 「タイプは変化する」を正面から認める
- 信頼できる心理学研究を引用する（Big Five との相関、ユング理論との関係）

---

## 3. Data Strategy

> **Animalumeの真の商品はデータ。**
> ユーザー体験は「最高品質の無料診断」、バックエンドは「世界最高品質の心理統計データベース」を構築する。

### 3.1 「売れるデータ」の5条件

1. **大量性（N数）**: 最低10万、理想100万件以上
2. **多様性（カバレッジ）**: 年代・性別・地域・職業のバランス
3. **正確性（精度）**: 適当回答の検出と除外
4. **解像度（深さ）**: タイプ＋行動・選好・属性まで紐付け
5. **時系列性（縦断データ）**: 同一ユーザーの変化追跡

→ **3,4,5 が他社の追随を許さない競争優位**

### 3.2 Data Quality KPIs

| KPI | 目標 |
|---|---|
| 診断完走率 | ≥ 80% |
| 7日以内再受験での一致率 | ≥ 75% |
| 属性付与率（年代・性別等） | ≥ 40% |
| 月次再訪率（履歴比較目的） | ≥ 25% |
| 問題ごとの弁別力 | 全問で D係数 ≥ 0.3 |

### 3.3 Data Collection Principles

1. ユーザーから取るデータは全て任意、強制しない
2. 「なぜ取るか」を全質問で開示
3. 個人特定情報と統計データは分離保管
4. 適当回答は検出してフラグ管理、データ販売時除外
5. 段階的取得（一度に大量入力させない）

**段階的データ収集フロー**
```
診断直後：   結果のみ表示、属性質問なし
2回目訪問：  年代・職業を任意入力（精度向上の名目）
3回目訪問：  興味関心アンケート
1ヶ月後：    ライフイベント取得（変化分析の名目）
```

### 3.4 Data Products（将来の販売形態）

- 集計レポート販売（業界別・年代別の分布データ）
- API提供（リアルタイム集計データへのアクセス）
- カスタムリサーチ（特定セグメントの深掘り調査）
- 縦断パネルデータ（学術機関向け）
- ブランドコラボ（タイプ別おすすめ商品キュレーション）

---

## 4. Project Phase

### 4.1 Current Phase

**`MVP-speed-first`**

- 機能の網羅性 > コードの完璧性
- 動くものを早く出す、リファクタは後
- テストはクリティカルパスのみ
- 設計の小さな歪みは許容、運用に乗ってから直す

### 4.2 Phase Switch Criteria

以下のいずれかを満たした時点で `production-safety-first` に切り替え：

- 月間アクティブユーザー 1万人を超えた
- 課金機能（万一導入する場合）リリース時点
- BtoBデータ販売契約が締結された時点
- 個人情報を扱う機能（実名相性診断等）の本格運用開始時

切替時はこのCLAUDE.mdの本セクションを更新する。

### 4.3 Production-safety-first 移行時の追加ルール

- 全ての破壊的変更にレビュー必須
- ユニットテスト網羅率 ≥ 70%
- E2Eテストで主要フロー全カバー
- データベーススキーマ変更は migration ファイル必須
- リリース前に `sakura-reviewer` 相当の安全レビュー実施

---

## 5. Tech Stack

### 5.1 Frontend

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** + **shadcn/ui**（jp-ui-contracts 準拠）
- **i18next + react-i18next**（日本語/韓国語）
- **Pretendard**（日韓両対応の主フォント）
- **Noto Serif JP**（見出し・タイプ名表示用）
- **html-to-image** or **html2canvas**（シェア画像のクライアント生成）

### 5.2 Backend / Infra

- **Firebase Authentication**（匿名 + Google/Twitter/LINE/Kakao）
- **Cloud Firestore**（メインDB）
- **Firebase Hosting**（CDN配信）
- **Cloud Functions**（必要最小限。集計バッチ・通知送信）
- **Firebase Analytics** + **GA4**

### 5.3 Reused from Cocomi

- `swipe-deck` コンポーネント一式（カードスワイプUI、アニメーション、状態管理）
- Firestore 接続ラッパー
- 匿名認証フロー
- カテゴリタブ・ボトムナビゲーション基盤

### 5.4 External APIs

- **LINE Login API**（友だちリスト連携）
- **Kakao Login SDK**（韓国向け、友だちリスト連携）
- 将来的に Claude API（タイプ別追加分析の生成、フェーズ後期）

### 5.5 Dev Environment

- Node.js 20 LTS
- pnpm（推奨）
- Windows 11 + PowerShell（Sori の主環境）
- Claude Code 主体での開発、副次的に Claude Code on the web

---

## 6. Directory Structure

```
animalume/
├── CLAUDE.md                       # このファイル
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
│
├── public/
│   ├── characters/                 # 16タイプのベースキャラ画像
│   │   ├── architect.webp
│   │   ├── advocate.webp
│   │   └── ...
│   ├── og/                         # OGP画像
│   └── fonts/                      # Pretendard等のセルフホストフォント
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/                     # ルーティング
│   │
│   ├── features/
│   │   ├── diagnosis/              # 診断コア
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── logic/              # 軸スコアリング、タイプ判定
│   │   │   └── types.ts
│   │   ├── swipe-deck/             # Cocomi から移植
│   │   ├── result/                 # 結果表示・キャラ表示
│   │   ├── share/                  # シェア画像生成
│   │   ├── history/                # 履歴・比較機能
│   │   ├── compatibility/          # 相性診断
│   │   ├── friends/                # LINE/Kakao 友達連携
│   │   └── auth/                   # 認証・匿名→本登録
│   │
│   ├── data/
│   │   ├── questions/
│   │   │   ├── ja.ts               # 日本語問題マスタ
│   │   │   └── ko.ts               # 韓国語問題マスタ
│   │   ├── types/
│   │   │   ├── descriptions-ja.ts  # 16タイプ説明文
│   │   │   └── descriptions-ko.ts
│   │   └── characters/
│   │       └── meta.ts             # キャラクターメタ情報（パーツ構成等）
│   │
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── analytics.ts
│   │   └── i18n.ts
│   │
│   ├── components/
│   │   └── ui/                     # shadcn/ui の基底コンポーネント
│   │
│   ├── locales/
│   │   ├── ja/
│   │   │   └── common.json
│   │   └── ko/
│   │       └── common.json
│   │
│   └── styles/
│       └── globals.css
│
├── functions/                       # Cloud Functions（必要時のみ）
│
└── docs/
    ├── data-model.md
    ├── question-design.md          # 問題設計の指針
    ├── character-design.md         # キャラクター世界観
    └── monetization.md             # 将来の収益化案メモ
```

---

## 7. Data Model（Firestore）

### 7.1 Collections

```
users/{uid}
  - createdAt: Timestamp
  - lastActiveAt: Timestamp
  - locale: 'ja' | 'ko'
  - isAnonymous: boolean
  - linkedProviders: ('google'|'twitter'|'line'|'kakao')[]
  - profile:
      - ageRange?: '10s'|'20s'|'30s'|'40s'|'50s+'
      - gender?: 'female'|'male'|'other'|'no_answer'
      - region?: string
      - occupation?: string
  - consent:
      - dataLicensing: boolean      # 匿名集計データの利用同意
      - friendMatching: boolean     # 友達相性診断の利用同意
  - displayName?: string             # 友達相性で表示される名前
  - lineUserId?: string              # ハッシュ化保管
  - kakaoUserId?: string             # ハッシュ化保管

results/{resultId}
  - userId: string
  - takenAt: Timestamp
  - locale: 'ja' | 'ko'
  - type: 'INTJ' | 'INTP' | ... | 'ESFP'  # 16タイプ
  - scores:
      - EI: number   # -100 to +100（負がI、正がE）
      - SN: number
      - TF: number
      - JP: number
  - confidence: number                # 0-1、各軸の絶対値平均
  - duration: number                  # 回答所要時間（秒）
  - quality:
      - flagged: boolean              # 適当回答フラグ
      - reason?: string               # フラグ理由
  - answers: Answer[]                 # 全問の回答ログ
  - lifeEvents?: LifeEvent[]          # この時点の任意ライフイベント

questions/{questionId}              # 問題マスタ（運用後Firestoreへ移行）
  - axis: 'EI'|'SN'|'TF'|'JP'
  - format: 'binary'|'situation'|'likert'
  - locale: 'ja' | 'ko'
  - content: string                   # 問題文
  - optionA: { text: string, weight: number }
  - optionB: { text: string, weight: number }
  - active: boolean
  - stats:
      - shownCount: number
      - discriminationIndex: number   # D係数、運用中に算出更新

relationships/{relId}                 # 相性診断結果
  - userIdA: string
  - userIdB: string
  - viewedBy: string[]                # 表示同意したユーザーID
  - score: number                     # 0-100
  - createdAt: Timestamp

analytics_aggregates/{periodId}       # 集計データ（販売用）
  - period: '2026-05'
  - totalUsers: number
  - typeDistribution: { INTJ: 1234, ... }
  - segmentBreakdowns: {...}          # 年代別・性別・地域別
  - generatedAt: Timestamp
```

### 7.2 Security Rules 方針

- `users/{uid}` は本人のみ読み書き
- `results/{resultId}` は本人のみ読み書き、ただし匿名集計クエリは Cloud Functions 経由で許可
- `relationships/{relId}` は両者が consent している場合のみ閲覧可
- `questions/` は全員読み取り可、書き込みは管理者のみ
- `analytics_aggregates/` は管理者のみ

---

## 8. Implementation Order

### Phase 1: 診断コア（最優先・MVPの中核）

1. プロジェクト初期化（Vite + React + TS + Tailwind + shadcn/ui）
2. Cocomiから `swipe-deck` 移植
3. 問題40問（日本語）作成・JSON化
4. スワイプ→軸スコアリング→16タイプ判定ロジック
5. 結果画面（タイプ表示＋ベースキャラ画像）
6. Firebase Auth 匿名認証
7. Firestore に results 保存

### Phase 2: シェア体験（バズ導線）

1. シェア画像生成（1:1ベース、9:16/16:9拡張）
2. 各タイプの説明文整備
3. スコア強度別アクセント表示
4. SNSシェアボタン（X / Instagram / LINE）
5. OGP画像の動的生成

### Phase 3: 履歴と比較（リテンション・コア体験）

1. 匿名→ソーシャル連携アップグレード
2. 結果履歴一覧
3. 過去結果との比較ビュー
4. 「タイプ変化グラフ」（時系列）
5. 月次振り返りリマインド（Push通知）

### Phase 4: 多言語化（韓国語対応）

1. i18next 導入
2. 全UI文言の翻訳ファイル化
3. 韓国語ネイティブによる問題文・結果文レビュー
4. Pretendard フォント適用、文字長対応のレイアウト調整
5. 韓国向けOGP・シェア画像対応

### Phase 5: 友達相性（バイラル拡大）

1. LINE Login 連携
2. Kakao Login 連携
3. 友達リスト取得＋アプリ登録済み友達の判別
4. 相互consent前提の相性表示
5. 「あなたと相性ええ友達Top3」表示
6. 友達招待機能

### Phase 6 以降（候補・優先度未確定）

- BtoB向けタイプ診断SaaS（Animalume Business）
- ブランドコラボ機能
- 集計データAPI（外部研究機関向け）
- BLACKBRIAR™ 連携（タイプ別キュレーションコマース）
- AI個別分析（Claude API、フェーズ4以降のフルバリエーション化判定後）

---

## 9. Character Design

### 9.1 実装方式：3バージョン事前生成方式

各タイプ × 3強度バリエーション（standard / shimmer / quiet）の合計48枚を事前生成し、
ユーザーの確信度に応じて適切なバリエーションを表示する。

| バリエーション | 確信度 | 内容 |
|---|---|---|
| standard | 0.40〜0.75 | 基本イラスト |
| shimmer | 0.75以上 | 表情豊か、モチーフ密度高、彩度高め |
| quiet | 0.40未満 | 控えめな表情、モノトーン寄り、余白多め |

判定ロジックは `src/lib/character.ts` の `pickVariantFromConfidence()` で実装。

### 9.2 世界観

- ユング由来の元型モチーフを基礎に、独自命名で展開
- 「光（lume）」を全タイプ共通のメタファーとして使用
- 韓国ウェブトゥーン × ファッション誌のソフトなエディトリアル・イラスト
- 配色：オフホワイト基調、くすみカラー、低彩度
- アニメ調・CG調・サイバーパンク調・ダークファンタジー調は使用しない

### 9.3 4グループ構成

| グループコード | 日本語 | 韓国語 | 含まれるタイプ |
|---|---|---|---|
| NT（Analysts） | 光の探究者たち | 빛의 탐구자들 | INTJ, INTP, ENTJ, ENTP |
| NF（Diplomats） | 光を編む人たち | 빛을 엮는 사람들 | INFJ, INFP, ENFJ, ENFP |
| SJ（Sentinels） | 光の番人たち | 빛의 수호자들 | ISTJ, ISFJ, ESTJ, ESFJ |
| SP（Explorers） | 光の踊り手たち | 빛의 춤추는 자들 | ISTP, ISFP, ESTP, ESFP |

### 9.4 タイプ呼称

日韓で事実上共通言語化している呼称を採用。
Animalume独自の差別化は「世界観・キャラクタービジュアル・キャッチコピー・説明文」で行う。

各タイプの詳細メタデータは `src/data/types/meta-ja.ts`（日本語）および `meta-ko.ts`（韓国語）に集約。

### 9.5 画像保存先・命名規約

```
public/characters/
├── 01intj/
│   ├── standard.png
│   ├── shimmer.png
│   └── quiet.png
├── 02intp/
├── ...
└── 16esfp/
```

- フォルダ名：`{2桁番号}{MBTIコード小文字}` 例：`07enfj`
- ファイル形式：PNG（1024×1024 推奨）
- 番号は `src/data/types/meta-ja.ts` の `folderName` フィールドで定義

### 9.6 画像生成プロンプト

ChatGPT（DALL·E 3）で生成。
プロンプト集は別途 `docs/character-prompts/` に配置。

### 9.7 進捗管理

実装済みタイプは `src/lib/character.ts` の `IMPLEMENTED_TYPES` セットで管理。
未実装タイプは `CharacterImage` コンポーネントが自動的にプレースホルダー表示にフォールバック。

```typescript
// src/lib/character.ts
const IMPLEMENTED_TYPES: ReadonlySet<MbtiType> = new Set<MbtiType>([
  'ENFJ',
  'ESTP',
  // 残り14タイプは生成完了次第追加
]);
```

### 9.8 将来拡張

- フェーズ後期：軸別強度反映（4軸×2 = 8パターン）まで踏み込む可能性あり
- フルバリエーション化（数百〜数千枚）はコスト試算次第
- AI生成のリアルタイム化はOut of Scope（CLAUDE.md 11章）

---

## 10. Brand Guidelines

### 10.1 Visual

- **メインフォント**: Pretendard（日韓UI兼用）
- **見出しフォント**: Noto Serif JP（見出し・タイプ名）
- **配色基調**: オフホワイト `#FAF9F6` / くすみピンク / セージグリーン / チャコール
- **イラストトーン**: 線画＋淡彩、エディトリアル寄り
- **アイコン**: ミニマル、Lucide Icons ベース

### 10.2 Voice

- 一人称：基本なし、必要時は「Animalume」
- 二人称：「あなた」（「君」「お客様」は避ける）
- 終助詞：硬すぎず、フランクすぎず（「〜です」「〜でしょう」基調）

### 10.3 Logo & Naming

- 表記：**Animalume**（サービス名は常にこの綴り）
- 公式読み：**アニマリュム**
- ロゴ表記：「Animalume / アニマリュム」併記を推奨
- ハッシュタグ：`#Animalume` `#アニマリュム`

---

## 11. Out of Scope（やらないことリスト）

- 未知ユーザーとのマッチング機能（出会い系規制法回避）
- AI画像のリアルタイム生成（コスト・品質ブレ・離脱要因）
- 占い・スピリチュアル系コンテンツ追加（ブランド毀損）
- 個人ユーザー向けの直接課金（無料貫徹の哲学）
- アダルト・暴力的・差別的コンテンツ
- ユーザー同士のメッセージ機能（運用負荷・安全性問題）
- ガチャ・課金煽り・ダークパターン全般

---

## 12. Feature Spec Summary

### 12.1 確定事項一覧

| 項目 | 仕様 |
|---|---|
| 問題形式 | 状況提示型 + 二択ハイブリッド、計40問（各軸10問） |
| 判定ロジック | 4軸（E/I, S/N, T/F, J/P）スコアリング |
| 結果表示 | 16タイプ + スコア強度（"86% I" 形式） |
| キャラクター | A3ハイブリッド（ベースイラスト + SVGアクセント） |
| 認証 | Firebase Auth 匿名スタート、後からソーシャル連携 |
| 履歴 | 無制限保存、比較機能あり |
| 相性診断 | 16タイプ間 + LINE/Kakao友達（相互consent前提） |
| シェア | 1:1ベース、9:16/16:9拡張、Canvas生成 |
| 言語 | 日本語ファースト、韓国語フェーズ4で対応 |
| マネタイズ | 個人課金なし、データライセンス＋ブランドコラボ＋通販（フェーズ後期） |

---

## 13. Operational Notes

### 13.1 Claude Code との作業ルール

- Claude Codeへの指示は日本語で構わない
- 大きな実装は Phase 単位で分解、1セッション内で完結させる
- データモデル変更時は必ず本CLAUDE.mdの該当箇所も更新する
- 問題文・タイプ説明文の改変は、データ品質に直結するため慎重に

### 13.2 関連プロジェクト

- **Cocomi**: スワイプUIの源流、相互参照あり
- **KIREI**: jp-ui-contracts 準拠デザインの参考
- **BLACKBRIAR™ / AXP JAPAN**: 将来のEC連携先候補

### 13.3 To Be Decided（後決め）

- アプリのファビコン・OGデフォルト画像
- 利用規約・プライバシーポリシーの正式版
- 商標出願の判断（J-PlatPat事前調査後）
- 16タイプの正式名称（仮名運用→ネイティブレビュー後確定）
- BtoB販売の最初のターゲット顧客（Itochu系候補）

---

**Last Updated**: 2026-05-07
**Version**: 1.0.0（初版）
