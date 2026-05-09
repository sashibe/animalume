# Animalume - Phase 1.7: 改行制御と設問画面の装飾

Phase 1.6 後の追加調整タスク。

【背景】
- 結果画面の長文で改行位置が不自然（句読点が行頭に来る等）
- 設問画面が依然として「テキストのみ」で地味
- これらを一気に解決する

【方針】
- 改行は Sori が i18n テキスト側で `\n` を使って明示的に指定する方式に
- 設問画面に控えめな雑誌的装飾を追加（鉤括弧・Sparkle・影・進捗背景）

---

## Task A: 改行制御の有効化（最優先）

### 目的

i18n テキストやメタデータに `\n` を入れたとき、それが改行として表示されるようにする。
これにより、テキスト側で改行位置を明示的にコントロールできるようになる。

### 実装

該当する全ての <p> や <h2> 等のテキスト要素に、Tailwind の `whitespace-pre-line` クラスを追加する。

#### A-1. ResultScreen.tsx 内の対象

`src/features/result/components/ResultScreen.tsx` で、以下の要素に `whitespace-pre-line` を追加：

1. **メインメッセージのリード**（大きい文字、Reading セクション内）
2. **メインメッセージのボディ**（本文、Reading セクション内）
3. **境界線軸の言及**（borderline_* を表示する <p>）
4. **キャッチコピー（tagline）**（hero ブロック内）
5. **本質説明（essence）**（hero ブロック内）
6. **フッターの footnote**

#### A-2. アコーディオン内の対象

7. **「あなたの強み」3項目**（StrengthList コンポーネント、各項目の <p> または <li>）
8. **「関係性での傾向」段落**（relationshipNote を表示する <p>）

#### A-3. QuestionCard.tsx 内の対象

`src/features/diagnosis/components/QuestionCard.tsx` で：

9. **質問文**（content を表示する <h2> または <p>）
10. **選択肢A・Bのテキスト**（optionA.text, optionB.text を表示する要素）

### 完成条件

- 翻訳ファイル（locales/ja/common.json, locales/ko/common.json）に `\n` を入れた箇所で、
  実際に画面で改行されることを確認
- 通常のスペースは1つにまとめられる（whitespace-pre-line の仕様、これでOK）

---

## Task B: 質問文を鉤括弧で囲む

### 目的

質問文を「」で囲むことで、雑誌のインタビュー記事の質問風にする。

### 実装

`src/features/diagnosis/components/QuestionCard.tsx` の質問文表示箇所：

```tsx
// 修正前
<h2 className="text-xl font-serif ...">
  {question.content}
</h2>

// 修正後（CSS擬似要素で「」を追加）
<h2 className="
  text-xl font-serif ...
  before:content-['「'] before:text-ink-mute before:mr-1
  after:content-['」'] after:text-ink-mute after:ml-1
">
  {question.content}
</h2>
```

CSS擬似要素で実装する理由：
- テキストの折り返しに影響しない
- 「」の色や余白を細かく制御できる
- 翻訳ファイルを変更する必要がない（韓国語版でも同じ装飾になる）

### 完成条件

- 質問文が「〜」の鉤括弧で囲まれる
- 「と」の文字色が text-ink-mute（控えめなグレー）
- 鉤括弧の前後に小さな余白（mr-1, ml-1）

---

## Task C: カード周辺の Sparkle アイコン装飾

### 目的

設問画面のカード周辺に、控えめな雑誌的装飾を追加する。

### 実装

`src/features/diagnosis/components/QuestionCard.tsx` の最上位コンテナで、
カードの**上部の少し上**と**下部の少し下**に Sparkle アイコンを配置：

```tsx
import { Sparkle } from 'lucide-react';

return (
  <div className="relative w-full">
    {/* カード上部装飾 */}
    <div className="flex justify-center mb-4 text-ink-mute/40">
      <Sparkle className="w-3 h-3" strokeWidth={1.5} />
    </div>

    {/* QuestionCard 本体（既存） */}
    <motion.div className="...">
      {/* 既存のカード内容 */}
    </motion.div>

    {/* カード下部装飾（スワイプヒントの上に配置） */}
    <div className="flex justify-center mt-4 text-ink-mute/40">
      <Sparkle className="w-3 h-3" strokeWidth={1.5} />
    </div>
  </div>
);
```

ただし、1問目のスワイプヒント表示があるため、
下部の Sparkle の位置に注意。スワイプヒントとの間に十分な余白。

### 完成条件

- カードの上下に控えめな Sparkle アイコンが配置される
- サイズは 12px（w-3 h-3）、透明度 40%（text-ink-mute/40）
- strokeWidth 1.5 で線が細く上品
- 派手にならない、ぱっと見では気付かないレベル

---

## Task D: カードに控えめなドロップシャドウ

### 目的

QuestionCard と CharacterFrame に、雑誌写真のような控えめな影を追加する。

### 実装

#### D-1. tailwind.config.ts に新しいシャドウを追加

```typescript
// tailwind.config.ts
boxShadow: {
  // 既存のものに追加
  'editorial': '0 8px 32px -12px rgba(42, 41, 37, 0.04)',
  'editorial-md': '0 12px 48px -16px rgba(42, 41, 37, 0.06)',
  'editorial-lg': '0 16px 64px -20px rgba(42, 41, 37, 0.08)',
}
```

#### D-2. QuestionCard に適用

```tsx
// QuestionCard 本体の motion.div に追加
<motion.div className="
  rounded-3xl bg-bg-subtle 
  shadow-editorial-md   // ← 追加
  ...
">
```

#### D-3. CharacterFrame に適用

`src/features/result/components/CharacterFrame.tsx` の最外コンテナに：

```tsx
<div className="relative shadow-editorial">
  {/* 既存の縁取り + 画像 */}
</div>
```

### 完成条件

- 影が控えめで、業者っぽくならない（透明度4-8%）
- カードや画像が「ふわっと浮いてる」感覚
- 派手な影ではなく、上品な雑誌感

---

## Task E: 進捗の節目で背景の色味が微変化

### 目的

40問の診断の中盤・終盤で、背景色がほんのわずかに変化することで、
ユーザーに「進んでいる」感覚を視覚的に与える。

### 実装

#### E-1. tailwind.config.ts に追加

```typescript
// tailwind.config.ts
backgroundColor: {
  // 既存の 'bg' (#FAF9F6) はそのまま
  'bg-rose': '#FAF5F3',   // 11-20問、わずかにピンク寄り
  'bg-sage': '#F7FAF6',   // 21-30問、わずかにセージ寄り
  'bg-gold': '#FAF7F1',   // 31-40問、わずかにゴールド寄り
}
```

#### E-2. DiagnosisScreen.tsx で適用

```tsx
// src/features/diagnosis/components/DiagnosisScreen.tsx

const phaseBackgrounds = [
  'bg-bg',         // Phase 0: 1-10問、デフォルト
  'bg-bg-rose',    // Phase 1: 11-20問
  'bg-bg-sage',    // Phase 2: 21-30問
  'bg-bg-gold',    // Phase 3: 31-40問
];

const progressPhase = Math.min(
  Math.floor(currentIndex / 10),
  phaseBackgrounds.length - 1
);

return (
  <div className={`
    min-h-screen
    ${phaseBackgrounds[progressPhase]} 
    transition-colors duration-1000 ease-in-out
  `}>
    {/* 既存の中身 */}
  </div>
);
```

### 完成条件

- 1-10問は通常のオフホワイト背景
- 11問目で背景がほんのりピンクに
- 21問目でセージグリーンに
- 31問目でゴールドに
- 変化は1秒かけてゆっくり（duration-1000）
- ユーザーが意識して見れば「変わってる？」程度の極微差
- 過剰にならない、目障りにならない

---

## Task F: 動作確認とコミット

### 確認項目

`pnpm dev` で起動して以下を確認：

- [ ] i18n の `\n` が改行として反映される（テストで翻訳ファイルに `\n` を入れて確認）
- [ ] 質問文が「〜」の鉤括弧で囲まれる
- [ ] カード上下に控えめな Sparkle アイコン
- [ ] QuestionCard と CharacterFrame に上品な影
- [ ] 進捗が進むにつれて背景色が微変化（10問・20問・30問の節目で）
- [ ] スマホで見ても全体的に「上品な雑誌感」が増している
- [ ] 派手になっていない、quiet luxury は保たれている

### typecheck / lint / build

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

すべてエラーなしを確認。

### コミット

各 Task ごとに git commit：

- `feat(text): whitespace-pre-line で \n 改行を有効化`
- `feat(diagnosis): 質問文を鉤括弧で囲む装飾`
- `feat(diagnosis): カード周辺に Sparkle アイコン装飾`
- `feat(style): editorial シャドウを QuestionCard と CharacterFrame に適用`
- `feat(diagnosis): 進捗フェーズで背景色を微変化`

---

## 期待する変化

これが完了すると：

- **改行を文章ごとにコントロール可能** → 編集しやすくなる
- **質問が雑誌のインタビュー記事風** → 上質感アップ
- **カードが装飾された空間に置かれてる感覚** → 地味さ解消
- **影で立体感** → 雑誌写真の質感
- **進捗の体感的フィードバック** → 飽きにくくなる

派手にならず、quiet luxury を保ちながら、エディトリアルの密度が上がる。

---

開始してください。Task A → B → C → D → E の順番で。
完了したら簡潔に報告してください。
