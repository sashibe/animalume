今回はチャット版を経由せず、現状確認・設計判断・実装まですべてあなた（Claude Code）が完結させてください。詰まったら作業を止めて報告だけ上げてくれれば、その時点で人間がチャット版に持ち込みます

# Animalume Phase 2 着手 - 引き継ぎ資料

> 新セッションでこの内容を貼り付け or 投げて、Phase 2（シェア体験）の実装に着手するための資料。
>
> Phase 1 系列はすべて完了済み。MVP のコア機能 + 全画像素材 + 文書体系が整備された状態。

---

## プロジェクト基本情報

- **プロジェクト名**: Animalume（アニマリュム）
- **運営**: 株式会社 AXP JAPAN
- **GitHub**: https://github.com/sashibe/animalume
- **ローカル**: Windows 11、`C:\dev\animalume`
- **言語**: 日本語（メイン）+ 韓国語
- **ターゲット**: 20-30代女性（森香澄世代）+ 韓国MZ세대
- **コアコンセプト**: 「変化を可視化するMBTI」
- **ビジネスモデル**: 個人課金なし、データライセンス事業
- **ドメイン**: animalume.com / animalume.jp / animalume.net
- **本番URL**: https://animalume.web.app（稼働中）+ https://www.animalume.com（SSL発行待ち中）

---

## 完了済みフェーズ（Phase 1 系列）

### Phase 1（診断コア）✅

- スワイプUI（Cocomi swipe-deck から移植）
- 80問プール × 2言語（160問）
- 4軸スコアリング → 16タイプ判定
- Firebase Auth 匿名認証
- Firestore に `results` 保存
- Zustand 状態管理
- React Router

### Phase 1.5（言葉ベース化）✅

- 数値表示を完全削除（業者っぽさ排除）
- 確信度別動的メインメッセージ4段階（very_high / high / moderate / low）
- 境界線軸の言及
- 「詳しく見る」アコーディオン（軸傾向 / 強み / 関係性）
- 16タイプ × strengths(3点) + relationshipNote 整備（ja/ko）

### デザインシステム適用 ✅

Claude Design で作成、Claude Code で実装（5 PR）：

- design tokens 拡張（rounded-3xl, shadow-soft, watercolor utilities）
- QuestionCard 磨き（Q.## 章番号、軸別アクセント）
- DiagnosisScreen（細い進捗バー）
- CharacterFrame（dual-layer watercolor bleed → 後に縁取りに変更）
- ResultScreen エディトリアル化（YOUR TYPE / type code / hairline / group / Reading / More）

### Phase 1.6（フォント・装飾基礎）✅

- Noto Sans JP を本文に（Pretendard は韓国語フォールバック）
- 日本語禁則処理（word-break: keep-all）
- CharacterFrame：水彩のにじみ → 1px 縁取り（グループカラー）
- Q.## の左右ヘアライン
- 軸別 SVG アイコン（半円・三角・菱形・円、25%透明度）
- 「— Portrait —」章立て
- — 01 — Reading / — 02 — More 章扉
- アコーディオンアイコン（Compass / Sparkles / Users）
- Reading 引用ブロック（border-l-2、グループ色30%）
- 「— Animalume —」フッター署名

### Phase 1.7（改行・装飾仕上げ）✅

- whitespace-pre-line 全箇所追加（i18n の `\n` で改行制御可能に）
- 質問文を「」鉤括弧で囲む（CSS 擬似要素）
- カード上下に Sparkle アイコン
- editorial シャドウ（4-8% 透明度）
- 進捗フェーズ背景色（bg-rose / bg-sage / bg-gold、10問ごとに微変化）

### 文字寄せ調整 ✅

- 質問文：text-center
- 選択肢A：text-left
- 選択肢B：text-right

### カスタムドメイン接続 🔄 SSL発行待ち

- DNS設定完了（CNAME + dnsv.jp ネームサーバー）
- Firebase 所有権検証 OK
- SSL 証明書「作成中」状態（Let's Encrypt 自動発行待ち）

---

## 完了済み画像素材（80枚）

### キャラクター画像 48枚

```
public/characters/
├── 01intj/
│   ├── standard.png    # 確信度 40-75%
│   ├── shimmer.png     # 75% 以上、煌めき版
│   └── quiet.png       # 40% 未満、静寂版
├── 02intp/...
└── 16esfp/...
```

各タイプ × 3バージョン = 48枚すべて配置済み。

### シェアカード画像 32枚 ✨ 新規追加

```
public/share-cards/
├── 01intj-ja.png       # 1080×1080、テキスト焼き込み済み
├── 01intj-ko.png
├── 02intp-ja.png
├── 02intp-ko.png
├── ...
└── 16esfp-ko.png
```

各タイプ × 2言語 = 32枚すべて配置済み。

**焼き込まれているテキスト**（画像ごと）：
- YOUR TYPE
- タイプコード（INTJ等）
- ─ タイプ名 ─（建築家 / 건축가 等）
- キャッチコピー（タイプの本質）
- ── Animalume ──
- animalume.com

**品質**: 雑誌の表紙レベル。ChatGPT (DALL·E 3) で生成、文字化け皆無。

---

## 完了済み文書体系

```
animalume/
├── CLAUDE.md                       # プロジェクト全体仕様（§14, §15 含む）
├── 00-master-design.md             # 16タイプ設計マスター
└── docs/
    ├── README.md                   # docs 全体の目次
    ├── decisions/                  # ADR
    │   ├── README.md               # ADR 一覧
    │   ├── 0001-mbti-axis-scoring.md
    │   ├── 0002-types-can-change-philosophy.md  # 最高重要度
    │   ├── 0003-firebase-stack.md
    │   ├── 0004-zero-individual-monetization.md
    │   ├── 0005-character-pre-generation.md
    │   ├── 0006-cocomi-asset-reuse.md
    │   └── 0007-line-kakao-priority.md
    ├── design/
    │   ├── design-tokens.md        # カラー・タイポ・スペーシング等
    │   └── character-design.md     # キャラ世界観
    ├── data-model.md               # Firestore スキーマ詳細
    ├── question-design.md          # 問題設計指針
    ├── monetization.md             # 収益戦略 + Talking Points
    └── qa-scenarios.md             # QA シナリオ（S1〜S7）
```

---

## Phase 2: シェア体験 - スコープ定義

### CLAUDE.md §8 の Phase 2 記載

```
Phase 2: シェア体験（バズ導線）
1. シェア画像生成（1:1ベース、9:16/16:9拡張）
2. 各タイプの説明文整備
3. スコア強度別アクセント表示
4. SNSシェアボタン（X / Instagram / LINE）
5. OGP画像の動的生成
```

### 重要な方針変更（Phase 1 完了時に確定）

**シェアカード32枚を事前生成済みで配置完了**。
これにより以下が確定：

| 旧方針（CSS合成） | 新方針（プリセット画像） |
|---|---|
| html-to-image / html2canvas で動的生成 | 既存 PNG ファイルを直接使用 |
| キャラ画像 + テキスト合成処理 | 不要 |
| 確信度別バリエーションも考慮 | シェアではタイプ表明が主、確信度別は不要 |
| 9:16 ストーリーズ用は別途生成 | Phase 2 では 1:1 のみ、9:16 は後回し |
| OGP 動的生成（Cloud Functions） | 静的 OGP 画像で対応可能（Phase 2 範囲外でもOK） |

**結果として Phase 2 の実装が劇的にシンプル化**。
画像URLを Web Share API に渡すだけで完結する。

### Phase 2.0（MVP範囲、今回実装）

1. **シェアモーダル**（プレビュー + SNS選択UI）
2. **Web Share API 連携**（モバイルでネイティブシェア）
3. **SNS別シェアURL動線**（X / LINE）
4. **画像保存機能**（PC・Web Share API 非対応時）

### Phase 2.1 以降（後回し）

- Instagram シェア（公式 API なし、画像保存→ユーザー手動投稿）
- 9:16 ストーリーズ用画像（別途生成）
- OGP 動的生成（Cloud Functions）
- ハッシュタグ戦略の本格実装
- シェア成功率計測

---

## ターゲットユーザーの SNS 行動

### Instagram ストーリーズ
- 縦長 9:16
- 24時間で消える、軽いシェア
- 「自分のタイプ晒し」の文化
- → Phase 2 では画像保存対応のみ、ユーザーが手動アップ

### X（旧Twitter）
- カード型（1:1 または 16:9）
- フィード上で目を引く必要
- 引用RTで広がる
- → Phase 2 で URL 動線を整備

### LINE
- トーク内シェア
- カード形式で相手に送る
- 友達相性診断（Phase 5）への布石
- → Phase 2 で Web Share API + URL 動線

---

## 技術仕様

### ファイル名のマッピング

```typescript
// タイプ番号定義（既存 src/data/types/meta.ts に既にある可能性）
const TYPE_NUMBERS: Record<MbtiType, string> = {
  INTJ: '01', INTP: '02', ENTJ: '03', ENTP: '04',
  INFJ: '05', INFP: '06', ENFJ: '07', ENFP: '08',
  ISTJ: '09', ISFJ: '10', ESTJ: '11', ESFJ: '12',
  ISTP: '13', ISFP: '14', ESTP: '15', ESFP: '16',
};

// シェアカード画像のパス取得
function getShareCardUrl(type: MbtiType, locale: 'ja' | 'ko'): string {
  const num = TYPE_NUMBERS[type];
  const code = type.toLowerCase();
  return `/share-cards/${num}${code}-${locale}.png`;
}

// 例：getShareCardUrl('INFP', 'ja') → '/share-cards/06infp-ja.png'
```

### Web Share API の使用

```typescript
async function shareViaNative(
  imageUrl: string,
  type: MbtiType,
  name: string,
  tagline: string,
  locale: 'ja' | 'ko'
) {
  // 画像を Blob として取得
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const file = new File([blob], `animalume-${type}.png`, { type: 'image/png' });
  
  // ファイル付きシェアが可能かチェック
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    const text = locale === 'ja' 
      ? `私のタイプは「${type}・${name}」でした\n\n${tagline}\n\n#Animalume #アニマリュム`
      : `나의 타입은「${type}・${name}」였습니다\n\n${tagline}\n\n#Animalume #애니말룸`;
    
    await navigator.share({
      files: [file],
      title: `Animalume - ${type}`,
      text,
      url: 'https://animalume.com',
    });
    return true;
  }
  
  return false;
}
```

### SNS別 URL 生成

```typescript
// X
function buildXShareUrl(type: MbtiType, name: string, tagline: string, locale: 'ja' | 'ko') {
  const text = locale === 'ja'
    ? `私のタイプは「${type}・${name}」でした\n${tagline}\n#Animalume #アニマリュム`
    : `나의 타입은「${type}・${name}」였습니다\n${tagline}\n#Animalume #애니말룸`;
  const url = 'https://animalume.com';
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

// LINE
function buildLineShareUrl() {
  const url = 'https://animalume.com';
  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
}
```

### コンポーネント構成

```
src/features/share/
├── components/
│   ├── ShareModal.tsx           # メインのモーダル
│   ├── ShareCardPreview.tsx     # 画像プレビュー
│   └── ShareButtonGroup.tsx     # X / LINE / Save / Native
├── hooks/
│   └── useShare.ts              # シェアロジック
└── lib/
    ├── shareUrls.ts             # URL 生成関数群
    └── typeNumberMap.ts         # タイプ→ファイル名マッピング
```

---

## デザイン方針

### シェアモーダルのトーン

- **Quiet luxury 維持**：派手にならない、ブランド統一
- **プレビュー大きく表示**：「これシェアしたい」と思わせる
- **SNS ボタンは控えめ**：アイコン + テキスト、グレースケール基調
- **モーダル背景**：薄い暗幕（rgba(0,0,0,0.4) 程度）
- **角丸**：rounded-3xl
- **アニメーション**：ease-out duration-300（Phase 1.6 の方針継承）

### モーダル内レイアウト案

```
┌─────────────────────────────────┐
│                              [×]│
│                                 │
│      ─── シェア ───              │
│                                 │
│   ┌─────────────────┐           │
│   │                 │           │
│   │  [シェアカード]  │           │
│   │  プレビュー       │           │
│   │  1:1 表示        │           │
│   │                 │           │
│   └─────────────────┘           │
│                                 │
│   どこに送りますか？             │
│                                 │
│   [📱 シェア]  ← Web Share API   │
│   [𝕏  X で開く]                 │
│   [💬 LINE で開く]               │
│   [💾 画像を保存]                │
│                                 │
└─────────────────────────────────┘
```

### 結果画面のシェアボタン強化

現状は「シェアする」がアウトラインの控えめなボタン。
Phase 2 では：

- ボタンテキストはそのまま「シェアする」
- ボタンを少し主役寄りに（黒背景・白文字、または rose アクセント）
- クリックでモーダル表示

---

## バイラル設計

### シェアされる動機（雑誌の表紙レベルの画像があるからこそ実現可能）

1. **自己表現の欲求**：「私はINFPです」と美しい画像で言える
2. **共感を呼ぶ言葉**：キャッチコピーが引用RT素材になる
3. **シェアの容易さ**：Web Share API で1タップ

### ハッシュタグ戦略

```
日本語：
#Animalume #アニマリュム
#INFP仲介者 #光を編む人たち

韓国語：
#Animalume #애니말룸
#INFP중재자 #빛을엮는사람들
```

タイプ別ハッシュタグで**同じタイプ同士のコミュニティ形成**を促進。

### URL 構造

```
シェアされる URL: https://animalume.com  （ホーム）
↓
シェアを見た他人がアクセス
↓
ホーム画面で「あなたも診断する」CTA
↓
バイラル動線完成
```

将来的には `/result/{resultId}` で個別結果ページもありうるが、
**Phase 2.0 では `https://animalume.com` 直接で十分**。

---

## 関連ドキュメントと参照

新セッションで実装着手時、以下を参照：

- `CLAUDE.md` §8 Phase 2、§10.3（ハッシュタグ）
- `docs/design/design-tokens.md`（カラー・シャドウ・アニメーション）
- `docs/qa-scenarios.md` S3（シェア体験のシナリオ）
- `00-master-design.md`（タイプ別キャッチコピー一覧）

---

## 進め方の推奨ステップ

新セッションで進める順序：

### Step 1: 現状確認（5分）

- `view src/features/result/components/ResultScreen.tsx` で「シェアする」ボタン現状確認
- `ls public/share-cards/` で 32枚の存在確認
- `view src/data/types/meta-ja.ts` で TYPE_NUMBERS や tagline 定義確認

### Step 2: Phase 2 詳細設計（10分）

- ファイル構成決定
- ShareModal の UI 設計
- Web Share API のフォールバック設計
- 既存コンポーネントへの統合ポイント特定

### Step 3: 実装（30〜60分）

- TYPE_NUMBERS マッピング作成 or 既存確認
- shareUrls.ts ライブラリ実装
- ShareCardPreview コンポーネント
- ShareButtonGroup コンポーネント
- ShareModal コンポーネント
- ResultScreen への統合

### Step 4: 動作確認（10分）

- ローカルで `pnpm dev`
- 各 SNS ボタンの動作確認
- スマホ実機で Web Share API 動作確認
- iOS Safari / Android Chrome 両方

### Step 5: デプロイ + 確認（5分）

- `pnpm build && firebase deploy --only hosting`
- 本番URL で動作確認

合計：60〜90分の作業見込み。

---

## 確認したい点（新セッション開始時）

新セッションで Phase 2 着手時、以下を Sori に確認：

1. **シェアカード画像のファイル名規則は `{番号}{コード}-{言語}.png` で正しいか**
   - 例：`06infp-ja.png`
   - スクショで確認済みだが、コード実装時に再確認

2. **TYPE_NUMBERS マッピングは既に実装されているか**
   - `src/data/types/meta.ts` か別ファイルか
   - 無ければ新規作成

3. **「シェアする」ボタンの現在の実装状態**
   - クリックで何が起きるか
   - 既に Web Share API が動いているか

4. **SSL の状況**
   - `https://www.animalume.com` がアクセス可能か
   - ハッシュタグやシェアテキストの URL に使えるか

---

## 全体ステータス（Phase 2 着手時点）

| 項目 | 状態 |
|---|---|
| Phase 1.x 全シリーズ | ✅ |
| デザインシステム適用 | ✅ |
| 16タイプ × 3バージョン キャラ画像 48枚 | ✅ |
| 16タイプ × 2言語 シェアカード 32枚 | ✅ |
| Firebase デプロイ | ✅ |
| カスタムドメイン DNS | ✅ |
| カスタムドメイン SSL | 🔄 作成中 |
| ADR 7本 | ✅ |
| docs/ 全文書体系 | ✅ |
| **Phase 2: シェア体験** | ⬜ ←今ここ |
| Phase 3: 履歴・比較 | ⬜ |
| Phase 4: 韓国語ネイティブレビュー | ⬜ |
| Phase 5: 友達相性診断 | ⬜ |

---

## 新セッションへの最初の投げ方

```
Animalume の Phase 2（シェア体験）の実装に入ります。
このプロジェクトについては /mnt/project/CLAUDE.md と他の docs/ を参照してください。

【現状】
- Phase 1 系列（1.0〜1.7）と全画像素材80枚配置完了
- public/share-cards/ にシェアカード32枚（{番号}{コード}-{言語}.png 形式）
- 例：06infp-ja.png、01intj-ko.png

【Phase 2 のスコープ】
1. シェアモーダル（プレビュー + SNS選択UI）
2. Web Share API 連携
3. X / LINE への直接URL動線
4. 画像保存機能

シェアカード32枚は事前生成済みなので、CSS合成や html-to-image は不要。
画像URLを Web Share API に渡すだけで完結します。

まず現状確認（ResultScreen の現在の「シェアする」ボタン、TYPE 関連の既存定義等）から始めて、
Phase 2 の Claude Code 用の指示書を作ってください。
```

---

## 補足：今日のセッションで作成された成果物

新セッションでは context 上限の関係で再生成できない。Sori の手元にある資料：

- `animalume-share-card-prompts.zip`（32プロンプト集、参考用）
- `PHASE1.5-COMPLETE.md`、`PHASE1.6-POLISH.md`、`PHASE1.7-LINEBREAKS-AND-DECOR.md`
- `QUESTION-CARD-ALIGNMENT.md`（文字寄せ指示書）
- `firebase-deploy-instructions.md`、`custom-domain-setup.md`
- `TODO-CLAUDE-CODE.md`
- `DOCS-RESTRUCTURE.md`、`docs-draft/`（3ファイル + INSTRUCTIONS）

これらは「過去の参照」として手元にあれば良い。Phase 2 では新規に資料を作る。

---

**作成日**: 2026-05-08
**前セッションの context 圧迫により新セッションへの移行を実施**
