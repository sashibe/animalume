# Animalume - Phase 1.6: フォント整理と装飾の追加

スマホでの実機テストで、以下のフィードバックが出ました：

1. **フォントの問題**：漢字だけが太く見える（Pretendard と他フォントの混在の疑い）
2. **改行位置が不自然**：「察知する気配り力」のような単語の途中で改行されている
3. **キャラクター画像のにじみが見えない**：CharacterFrame の水彩のにじみ効果が PC でもスマホでも判別できない
4. **画面が地味**：エディトリアル化したが、まだ視覚要素が不足。「テキストのみのインタビュー記事」のような印象

これらを解決する Phase 1.6 のリデザインタスク。

---

## 重要原則

**ブランドガイドラインを絶対に守る**：
- ✅ Quiet luxury（雑誌『&Premium』『Kinfolk』『The Gentlewoman』のWeb版に違和感ない）
- ❌ 派手にする、占いっぽくする、業者っぽくする

「**装飾を増やす**」≠「**派手にする**」。
洗練された雑誌のエディトリアル要素を増やすが、トーンは保つ。

---

## Task 1: フォント問題の解決（最優先）

### 現象

スマホで以下のような表示：

```
相手の細かなニーズや感情の変化を敏感に察知
する気配り力
```

ここで「相手」「変化」「敏感」「察知」「気配」など**漢字だけが他より太く**見える。

### 原因の調査

`src/styles/globals.css` または `tailwind.config.ts` で定義されているフォントスタックを確認。

おそらく Pretendard が日本語の漢字グリフを完全には含んでおらず、フォールバックフォント（システムフォント、Noto Sans CJK 等）に切り替わっている。
そのフォールバック先のフォントウェイトが Pretendard と一致せず、結果として漢字だけ太く見える現象。

### 解決方針

#### 方法A（推奨）：Noto Sans JP に統一する

Pretendard は韓国語に強いが、日本語の漢字レンダリングで問題が起きやすい。
日本語版のレンダリングを優先するなら、本文フォントを Noto Sans JP に統一するのが堅実。

```css
/* globals.css */
:root {
  --font-sans: 'Noto Sans JP', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: 'Noto Serif JP', serif;
}
```

韓国語版でも Noto Sans JP は読めるが、韓国語の見栄えが落ちる懸念がある場合は、
方法Bを採用。

#### 方法B：locale ごとにフォントを切り替える

```typescript
// src/lib/i18n.ts または App.tsx で
useEffect(() => {
  if (i18n.language === 'ko') {
    document.documentElement.style.setProperty('--font-sans', 'Pretendard, sans-serif');
  } else {
    document.documentElement.style.setProperty('--font-sans', 'Noto Sans JP, sans-serif');
  }
}, [i18n.language]);
```

### 実施内容

1. **現状調査**：DevTools の Computed タブで `font-family` と Rendered Fonts を確認
   - もしくは、コードで `getComputedStyle()` を使って実際にレンダリングに使われているフォント名をログ出力
2. **方法A を採用**：Noto Sans JP を本文に追加（Google Fonts または既存の Pretendard と同じ方法でセルフホスト）
3. **既存の Pretendard 設定を残す**：韓国語版で動作するように、フォントスタックの後続として残す
4. **font-weight の指定を統一**：`font-weight: 400` を明示的に設定して、フォールバック時のずれを抑える

### 完成条件

- 漢字とひらがな・カタカナで太さが揃って見える
- 強調（bold）は意図した太さで表示される
- 韓国語表示でも違和感がない

---

## Task 2: 改行位置の調整（最優先）

### 現象

```
相手の細かなニーズや感情の変化を敏感に察知
する気配り力                ← ここで「察知する」を分断
```

日本語の禁則処理が効いていない。

### 解決方法

`src/styles/globals.css` または該当コンポーネントで、日本語向けの改行制御を追加：

```css
/* グローバル、または .prose-ja クラスとして */
.prose-ja,
.diagnosis-question,
.result-text {
  word-break: keep-all;       /* 単語の中で改行しない */
  overflow-wrap: anywhere;    /* どうしても収まらない時はどこでも改行 */
  line-break: strict;         /* 厳格な改行ルール */
}
```

### 適用範囲

以下のテキストに適用：

- QuestionCard の質問文（`src/features/diagnosis/components/QuestionCard.tsx`）
- QuestionCard の選択肢A・Bのテキスト
- ResultScreen の各種テキスト：
  - キャッチコピー
  - 本質説明
  - メインメッセージ（リード+本文）
  - 境界線軸の言及
  - 各軸の傾向（軸ラベル、判定ラベル）
  - あなたの強み（3項目）
  - 関係性での傾向

### 完成条件

- 日本語の単語が途中で改行されない
- 句読点が行頭に来ない（禁則処理）
- 韓国語でも違和感ない（韓国語は禁則処理の影響少ない）

---

## Task 3: CharacterFrame の演出変更（B案：境界線縁取り）

### 現状の問題

CharacterFrame の水彩のにじみ効果が、PC でもスマホでも判別できない。
opacity が低すぎる、または ぼかし範囲が狭すぎて、視覚的に効いていない。

### 採用案

水彩のにじみを諦めて、**画像の周りを淡いグループカラーで縁取り**する：

```tsx
// src/features/result/components/CharacterFrame.tsx

import { GROUP_OF, GROUP_ACCENT } from '@/lib/group';

type CharacterFrameProps = {
  type: MbtiType;
  variant: CharacterVariant;
};

export function CharacterFrame({ type, variant }: CharacterFrameProps) {
  const group = GROUP_OF[type];
  const accentClass = GROUP_ACCENT[group].border; // 例: 'border-accent-rose'
  
  return (
    <div className="relative">
      {/* 縁取り（控えめ、border /30 程度の透明度） */}
      <div className={`
        absolute -inset-1 rounded-3xl 
        ${accentClass}/20 
        border
      `} />
      
      {/* キャラクター画像 */}
      <div className="relative rounded-3xl overflow-hidden">
        <CharacterImage 
          type={type} 
          variant={variant} 
          className="w-full"
        />
      </div>
    </div>
  );
}
```

### 視覚的な意図

- **画像の周りに薄い縁取りライン**：グループカラー（NT=mist, NF=rose, SJ=gold, SP=sage）
- **太さ1px、透明度20%程度**：控えめだが認識できる
- **画像と縁取りの間に少し隙間**（-inset-1）：縁取りが画像から「浮いてる」感
- **角丸 rounded-3xl で統一**：画像と縁取りの両方

### 完成条件

- グループに応じて縁取り色が変わることが視認できる
- ENFJ（NF）→ピンク系、ESTP（SP）→セージ系、など
- 派手にならず、上品に見える
- スマホでもPCでも視認できる

---

## Task 4: 設問画面の地味さ解消

### 追加する装飾要素

雑誌のエディトリアル感をもう一段階上げる。
**追加するが、テキスト中心の構成は維持**。

#### 4-1. 章番号の装飾化

現状：
```
─ Q.04 ─
```

変更後：
```
       ─── Q.04 ───
       
       Quartiary Question
```

サブテキスト「Quartiary Question」みたいなのは過剰なので**入れない**。
ただし**章番号自体の周りの罫線を長くする**：

```tsx
<div className="flex items-center justify-center gap-3 text-ink-mute">
  <span className="h-px w-8 bg-ink-mute/40" />
  <span className="text-xs tracking-widest font-medium">Q.{String(index + 1).padStart(2, '0')}</span>
  <span className="h-px w-8 bg-ink-mute/40" />
</div>
```

罫線（左右に8px）+ 中央に Q.## の構成。今より少し**章扉感**が出る。

#### 4-2. カード上下のヘアライン

QuestionCard 全体の上下に**控えめな装飾**：

```
━━━━━━━━━━━━━━━━━━━━━  ← 細いボーダー、画面幅80%
[Q.04 章番号]
[質問文]
[選択肢A] [選択肢B]
━━━━━━━━━━━━━━━━━━━━━  ← 細いボーダー、画面幅80%
```

または、カードの**上下中央のみ**に装飾線：
- 上：左右からカード中央に向けてのヘアライン
- 下：軸別のアクセント色の小さなドット

これは Claude Design に裁量任せ。ブランドトーン崩さず、エディトリアル感を強める方向で。

#### 4-3. 軸別のグラフィック装飾（控えめに）

軸ごとに、カードの隅に**控えめなアクセントマーク**：

| 軸 | 装飾 |
|---|---|
| EI | カード右上に小さな半円弧（accent-rose/30） |
| SN | カード右上に小さな三角形（accent-sage/30） |
| TF | カード右上に小さな菱形（accent-mist/30） |
| JP | カード右上に小さな円（accent-gold/30） |

サイズは 12px 程度、極めて控えめに。
**ユーザーは意識して見ないと気づかないくらい**でちょうどいい。
何度も診断していると「あ、軸ごとに違うんだ」と発見する楽しみ。

#### 4-4. 進捗バーの周辺の情報密度を上げる

現状：
```
[━━━━━━━━━━━━━━]
1 / 40                              0%
ひとつ戻る
```

変更後：
```
[━━━━━━━━━━━━━━]
QUESTION 1 OF 40              REMAINING 39
[ひとつ戻る]
```

これは過剰かも。むしろ**現状のミニマルさを保ちつつ、進捗バーをもう少し主張させる**方向：

```tsx
// 進捗バーの色を、進捗に応じてグラデーション
// 序盤：ink-mute/40 → 終盤：ink-soft（濃く）
```

進捗が進むにつれて**バーの色が濃くなる**ようなアニメーション。視覚的に「進んでいる」感覚を強化。

### 実装上の注意

これらの装飾を全部入れると過剰になる可能性。
**4-1（章番号の罫線）と 4-3（軸別アクセントマーク）を優先**で実装。
4-2、4-4 は時間あれば。

---

## Task 5: 結果画面の地味さ解消

### 追加する要素

#### 5-1. キャラクター画像の前に「装飾的な余白」を追加

現状はヘッダー直後にキャラ画像。
画像の上に「対面」のための演出を入れる：

```tsx
{/* ヘッダー */}
<ResultHeader ... />

{/* 装飾的な余白セクション */}
<div className="flex justify-center my-8">
  <div className="flex items-center gap-2 text-ink-mute/60">
    <div className="h-px w-12 bg-current" />
    <div className="text-xs tracking-widest">PORTRAIT</div>
    <div className="h-px w-12 bg-current" />
  </div>
</div>

{/* キャラクター画像 */}
<CharacterFrame ... />
```

これで「あなたのタイプ」→「PORTRAIT（あなたの肖像）」→ キャラ画像、という章立てが生まれる。

韓国語版では「PORTRAIT」を「초상화」または「肖像」など適切な訳に。

#### 5-2. 章番号の装飾を強化

現状：
```
─ 01 ─ READING
```

変更後（縦に伸ばす章扉風）：
```
       ━━━━━━━
        — 01 —
       ━━━━━━━
       
       READING
```

または、シンプルにフォントサイズを大きくして：

```tsx
<div className="text-center my-12">
  <div className="text-xs tracking-widest text-ink-mute mb-2">— 01 —</div>
  <div className="text-2xl font-serif tracking-wider text-ink">Reading</div>
</div>
```

「READING」「MORE」のラベルを**もう少し主役に**。

#### 5-3. アコーディオンの装飾

現状：
```
[各軸の傾向         ▼]
[あなたの強み       ▼]
[関係性での傾向     ▼]
```

それぞれのセクションに**小さなアイコン**または**装飾**を追加：

```
[◇ 各軸の傾向         ▼]
[✦ あなたの強み       ▼]
[◯ 関係性での傾向     ▼]
```

ただし**Lucide Icons の控えめなアイコン**を使う、絵文字は使わない。
おすすめ：
- 各軸の傾向 → `Compass` (lucide-react)
- あなたの強み → `Sparkles` または `Sun`
- 関係性での傾向 → `Users` または `Heart`

サイズ 16px、色 `ink-mute`、控えめに。

#### 5-4. メインメッセージ（Reading セクション）の演出

現状：
```
いま、あなたは仲介者の傾向が見えます。
（リード）

まだいくつかの要素の間で揺らいでいるようです。
（本文）
```

変更後（雑誌のドロップキャップ風、ただし日本語版では難しいので、別の演出）：

```
| いま、あなたは仲介者の傾向が見えます。
| 
| まだいくつかの要素の間で揺らいでいる
| ようです。3ヶ月後にもう一度受けると、
| 違う光が見えるかもしれません。
```

左に**淡いボーダーライン**を入れて、引用ブロック風に：

```tsx
<div className="border-l-2 border-accent-rose/30 pl-6 my-8">
  <p className="text-2xl font-serif text-ink leading-relaxed">
    {leadMessage}
  </p>
  <p className="text-base text-ink-soft mt-4 leading-relaxed">
    {bodyMessage}
  </p>
</div>
```

ボーダーカラーはタイプのグループカラー（NT=mist, NF=rose, etc.）。

#### 5-5. フッターの装飾

現状：
```
─── タイプは時間と共に変化することもあります
```

変更後：

```tsx
<div className="text-center py-8 my-8 border-t border-border">
  <div className="text-xs tracking-widest text-ink-mute mb-2">— Animalume —</div>
  <p className="text-xs text-ink-mute italic">
    タイプは時間と共に変化することもあります
  </p>
</div>
```

「Animalume」のロゴ的なテキスト + フッター本文。雑誌の奥付風。

### 実装上の注意

5-1, 5-2, 5-3 を優先。5-4, 5-5 は余裕があれば。

---

## Task 6: 全体の動作確認

### 確認項目

実装後、`pnpm dev` で確認：

- [ ] 漢字とひらがなで太さが揃う
- [ ] 改行位置が自然（単語の途中で切れない）
- [ ] CharacterFrame の縁取りが視認できる、グループ別に色が変わる
- [ ] 設問画面の章番号装飾が雑誌っぽい
- [ ] 設問画面の軸別アクセントマークが控えめに表示される
- [ ] 結果画面の「PORTRAIT」章立てが追加される
- [ ] 結果画面の章番号（01, 02）が大きく主役に
- [ ] アコーディオンに控えめなアイコンが追加
- [ ] メインメッセージが引用ブロック風に演出される
- [ ] フッターに「Animalume」のロゴ的テキストが追加される
- [ ] スマホで実機確認しても、Quiet luxury が崩れていない

### typecheck / lint / build

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

すべてエラーなしを確認。

---

## コミット粒度

各 Task ごとに git commit：

- `fix(typography): 漢字とひらがなのウェイト統一（Noto Sans JP導入）`
- `fix(typography): 日本語禁則処理の追加（word-break: keep-all）`
- `feat(result): CharacterFrame をグループ別境界線縁取りに変更`
- `feat(diagnosis): 章番号装飾と軸別アクセントマーク追加`
- `feat(result): PORTRAIT章立てとアコーディオンアイコン追加`
- `feat(result): メインメッセージを引用ブロック風に、フッターにAnimalume署名追加`

---

## 完成のイメージ

これらが完了すると、Animalume は：

- **雑誌の特集記事のような** 視覚的密度
- **派手にせず、quiet luxury を保ちながら** 読み物としての魅力
- **日本語のレンダリング品質が向上**（漢字の太さ均一、自然な改行）
- **キャラクター画像とグループカラーの結びつき**が視覚的に明確

「テキストのみのインタビュー記事」から「写真とテキストが交差する特集」へ。

---

開始してください。Task 1, 2 が最優先（バグ修正レベル）、その後 Task 3-5 を順次。
各タスク完了時に簡潔に報告してください。
詰まったら遠慮なく止めて確認してください。
