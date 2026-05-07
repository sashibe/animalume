# Animalume - Phase 1.5: 診断UI 視覚強化 + 結果画面 言葉ベース化

Phase 1 の動作確認で、以下のフィードバックが出た：

1. 「画面がテキストだけでシンプルというより地味」
2. スワイプUIの存在に気づかず、選択肢をタップしてしまうユーザーが多い
3. 「ひとつ戻る」ボタンが目立たない
4. 40問の診断で視覚的フィードバックが少なく、飽きが来やすい
5. **結果画面の数値表示（13%、E 14%等）が誤解を生む**：
   - 「スコアの強さ 13%」がテストの点数のように見える
   - 4軸スコアバーが「合計100%にならない」混乱
   - ENFJ判定なのに「E 14%」表示が直感に反する

これらを **ブランドガイドライン（quiet luxury, 占い的でない, 媚びない）を守りながら** 改善する。

特に Task 6 は森香澄層（20-30代女性、コスメ・ライフスタイル感度高）への最適化。
**「数字より言葉」「分析より物語」**の方針で再設計する。

---

## 重要な原則

このタスクで「派手にする」「目立たせる」を**やりすぎない**こと。

- ✅ OK：水彩のにじみ、控えめな光の粒、滑らかなアニメーション、エディトリアル文章
- ❌ NG：ネオン、強い影、グラデーション多用、点滅、絵文字多用、強い色彩、ダッシュボード型UI、メーター・ゲージ系UI

迷ったら **「&Premium」「Kinfolk」「The Gentlewoman」誌のWeb版にあっても違和感ないか** で判断する。

---

## 実装タスク（優先順位順）

### Task 1: QuestionCard の視覚的強化

**現状**：白背景にテキスト、選択肢A/Bが上下に並ぶ、地味。

**変更内容**：

#### 1-1. カード背景に水彩のにじみを追加

`src/features/diagnosis/components/QuestionCard.tsx` のカード本体に、
SVG または CSS で淡い水彩風の背景を追加する。

```tsx
// カードのコンテナの background に、SVG inline で淡い円形のにじみを追加
// くすみピンク（accent-rose / opacity 0.15）の円を左上に
// セージグリーン（accent-sage / opacity 0.12）の円を右下に
// blur-3xl で滲ませる
```

実装は Tailwind の `before:` や `::before` 擬似要素 + 絶対配置でも、
純粋に div 重ねでもOK。カードの rounded-2xl の中に閉じ込めて、はみ出さないように。

#### 1-2. 選択肢の左右配置への変更

選択肢が「上下」配置だと「左右スワイプ」と直感的に対応しない。
**選択肢を左右に並べる**：

```
┌─────────────────────────────────┐
│                                 │
│       問題文がここに            │
│                                 │
│  ┌──────────┐  ┌──────────┐  │
│  │ 選択肢A   │  │ 選択肢B   │  │
│  │ ←       │  │       →   │  │
│  └──────────┘  └──────────┘  │
│                                 │
└─────────────────────────────────┘
```

具体的には：
- 選択肢A・Bを横並び（`grid-cols-2`）にする
- 各選択肢カード内に、控えめな矢印アイコン（lucide-react の `ArrowLeft` / `ArrowRight`、サイズ small）を表示
- タップでも選択可能（既存機能維持）

#### 1-3. 軸ごとのアクセントカラー

問題の `axis` 値に応じて、カード内の控えめなアクセント
（左右の細い縦線、または角の小さな印）を以下のように出す：

| 軸 | アクセント色 |
|---|---|
| EI | accent-rose（くすみピンク） |
| SN | accent-sage（セージグリーン） |
| TF | accent-mist（くすみブルー） |
| JP | accent-gold（ミューテッドゴールド） |

**ただし、ユーザーに「軸を見せる」のではなく、視覚的多様性を生むため**。
ラベル表示はしない。

---

### Task 2: 進捗とフィードバックの強化

#### 2-1. 進捗バーの改良

`src/features/diagnosis/components/DiagnosisScreen.tsx` の進捗表示：

- 現在の「12 / 40」表示はそのまま
- 進捗バーを Framer Motion でアニメーション付きに（`width` プロパティを動かす）
- 10問・20問・30問の節目に、控えめなマイルストーン表示：
  - 10問完了：「最初の10問、ありがとうございます」（フェードイン後3秒で消える）
  - 20問完了：「ちょうど折り返しです」
  - 30問完了：「ラスト10問」
  - これらは「励まし」より「節目の認識」のトーンで。
  - i18n対応：`locales/ja/common.json` と `ko/common.json` に追加
    - `diagnosis.milestone_10`, `diagnosis.milestone_20`, `diagnosis.milestone_30`

#### 2-2. 選択時のフィードバック強化

ユーザーが選択肢を選んだ瞬間：
- 選んだ選択肢カードが一瞬「内側からほのかに光る」アニメーション
  （max-opacity 0.3 程度の暖色オーバーレイを200msで消す）
- カード本体が次の問題に切り替わる前に、わずかにスケールダウン
  （scale 1 → 0.97 → 0、150ms）
- 次の問題のカードは右からスライドイン（translateX 20px → 0、200ms）

すべて Framer Motion の `AnimatePresence` を使う。

---

### Task 3: 「ひとつ戻る」ボタンの発見性向上

#### 3-1. 配置と視認性

現状はおそらく目立たない位置にある。以下に変更：

- 進捗バーの**真下**、左寄せに配置
- アイコン（lucide-react の `ChevronLeft`）+ テキスト「ひとつ戻る」
- 1問目では `disabled`（薄いグレー）、2問目以降は `active`（ink-soft 色）
- 押下可能時は微かなホバーエフェクト（hover:opacity-70）

#### 3-2. 「スキップ」を削除（重要）

スキップ機能はデータ品質的にネガティブ。MVPでは削除する。
理由：
- 軸ごとに10問必要なのに、スキップされると判定精度が下がる
- データ収集観点でも、スキップは適当回答と区別がつかない

`store.ts` から skip 関連のロジックを削除、UI からもボタン削除。

---

### Task 4: 初回チュートリアル（控えめに）

#### 4-1. 1問目だけのスワイプヒント

最初の問題（インデックス 0）でのみ、カードの下に：

```
タップ、または左右にスワイプして選択
```

絵文字は使わない方針なので、代わりに lucide-react の `MousePointerClick` アイコン + テキスト。
**フォントサイズは小さく、color は ink-mute** で、控えめに。
i18n: `diagnosis.swipe_hint`

問題インデックス 1 以降では非表示。

#### 4-2. アニメーションヒント

1問目のカードが表示された直後（500ms 待ってから）、
カードがほんのわずかに左右に揺れる（translateX -2px → 2px → 0、計1秒）。
スワイプ可能であることを暗示する。1回のみ実行。

---

### Task 5: ホーム画面の改良（時間あれば）

現状のホーム画面もテキスト中心で地味。以下を検討：

- ヘッダー部分の下に、控えめな水彩の月相モチーフ（SVG）
- 「診断をはじめる」ボタンの周りに、ほんのり光のオーラ（CSS の box-shadow で広めに、薄く）

これは Task 1〜4 が完了した余裕があれば実装。MVPでは Task 1〜4 が優先。

---

### Task 6: 結果画面を「言葉ベース」に再設計（最重要）

**現状の問題**：
- 「スコアの強さ 13%」がテストの点数のように見える
- 4軸スコアバーが「合計100%にならない」混乱を生む
- ENFJ判定なのに「E 14%」表示が直感に反する
- 数字主役の表示が女性向けブランドのトーンと合わない

**変更方針**：
**「数字より言葉」「分析より物語」**で再設計。
雑誌のエッセイを読むような体験にする。
グラフ・メーター・%表示は徹底的に排除。

---

#### 6-1. 削除する要素

`src/features/result/components/ResultScreen.tsx` から以下を**完全削除**：

- 「スコアの強さ XX%」のラベルと数値表示
- その下のシンプルな進捗バー
- 4軸スコアバー（EI / SN / TF / JP のラベル付きバー）
- 「E 14%」「N 18%」のような % 表示

#### 6-2. メインメッセージの追加（動的生成）

タイプ名・キャラ画像・キャッチコピー・本質説明の下に、
**確信度に応じた動的メッセージ**を1段落で表示する。

```tsx
// src/features/result/lib/messageGenerator.ts （新規作成）

import type { DiagnosisResult } from '@/features/diagnosis/logic/types';
import type { QuestionLocale } from '@/data/questions/types';
import { getTypeMeta } from '@/data/types';
import { getConfidenceLevel, findBorderlineAxes } from '@/features/diagnosis/logic';

export function generateMainMessage(
  result: DiagnosisResult,
  locale: QuestionLocale,
): string {
  const meta = getTypeMeta(result.type, locale);
  const level = getConfidenceLevel(result.confidence);
  
  // i18nのキーを返す形式でも、ここで文字列組み立てでもOK。
  // 簡単のため、ここでは i18n の interpolation を使う前提で
  // 翻訳キーと変数を返すヘルパーにする。
  return `result.message_${level}`;  // 'very_high' | 'high' | 'moderate' | 'low'
}

export function generateBorderlineMessage(
  result: DiagnosisResult,
  locale: QuestionLocale,
): string | null {
  const borderlineAxes = findBorderlineAxes(result.scores);
  if (borderlineAxes.length === 0) return null;
  
  // 揺らいでる軸を1つ選んで、その軸の説明を返す
  // 例：JP軸が境界線なら「判断と知覚の間でほぼ中間」
  const primaryAxis = borderlineAxes[0];
  return `result.borderline_${primaryAxis}`;
}
```

i18n 翻訳ファイル（`locales/ja/common.json` に追加）：

```json
{
  "result": {
    "message_very_high": "あなたは典型的な{{typeName}}です。{{tagline}}という言葉が、まさに今のあなたを表しています。",
    "message_high": "あなたは{{typeName}}の傾向がしっかりと出ています。{{tagline}}という側面が、あなたの中に見えます。",
    "message_moderate": "いま、あなたは{{typeName}}の傾向が見えますが、ほかのタイプの要素もあわせ持っています。時期や環境によって、違う面が現れることもあるでしょう。",
    "message_low": "いま、あなたは{{typeName}}の傾向が見えますが、まだいくつかの要素の間で揺らいでいます。3ヶ月後にもう一度受けると、違う光が見えるかもしれません。",
    "borderline_EI": "特に、外に向かうか内に向かうかという軸では、ほぼ中間に位置しています。状況によって両方の側面が現れる、しなやかさを持っています。",
    "borderline_SN": "特に、目の前の事実を見るか、その先の可能性を見るかという軸では、ほぼ中間に位置しています。両方の視点を行き来できる柔軟さがあります。",
    "borderline_TF": "特に、論理で決めるか、心で決めるかという軸では、ほぼ中間に位置しています。理性と感情の両方を大切にできる豊かさがあります。",
    "borderline_JP": "特に、計画を立てて進むか、流れに任せて進むかという軸では、ほぼ中間に位置しています。状況によって両方の側面が現れる、しなやかさを持っています。"
  }
}
```

韓国語版（`locales/ko/common.json`）：

```json
{
  "result": {
    "message_very_high": "당신은 전형적인 {{typeName}}입니다. {{tagline}}라는 말이, 바로 지금의 당신을 표현하고 있습니다.",
    "message_high": "당신은 {{typeName}}의 경향이 분명히 드러나고 있습니다. {{tagline}}라는 면이, 당신 안에 보입니다.",
    "message_moderate": "지금, 당신은 {{typeName}}의 경향이 보이지만, 다른 타입의 요소도 함께 가지고 있습니다. 시기나 환경에 따라, 다른 면이 나타날 수도 있을 것입니다.",
    "message_low": "지금, 당신은 {{typeName}}의 경향이 보이지만, 아직 여러 요소 사이에서 흔들리고 있습니다. 3개월 후에 다시 받아보면, 다른 빛이 보일지도 모릅니다.",
    "borderline_EI": "특히, 밖으로 향하는가 안으로 향하는가의 축에서는, 거의 중간에 위치하고 있습니다. 상황에 따라 양쪽 면이 나타나는, 유연함을 지니고 있습니다.",
    "borderline_SN": "특히, 눈앞의 사실을 보는가, 그 너머의 가능성을 보는가의 축에서는, 거의 중간에 위치하고 있습니다. 두 관점을 오갈 수 있는 유연함이 있습니다.",
    "borderline_TF": "특히, 논리로 결정하는가, 마음으로 결정하는가의 축에서는, 거의 중간에 위치하고 있습니다. 이성과 감정 양쪽을 모두 소중히 여길 수 있는 풍요로움이 있습니다.",
    "borderline_JP": "특히, 계획을 세워 나아가는가, 흐름에 맡겨 나아가는가의 축에서는, 거의 중간에 위치하고 있습니다. 상황에 따라 양쪽 면이 나타나는, 유연함을 지니고 있습니다."
  }
}
```

#### 6-3. ResultScreen の表示構造

```tsx
<div>
  {/* タイプ名・グループ・キャラ画像（既存） */}
  <Header />
  <CharacterImage />
  
  {/* キャッチコピーと本質（既存） */}
  <Tagline>{meta.tagline}</Tagline>
  <Essence>{meta.essence}</Essence>
  
  {/* 動的メインメッセージ（新規） */}
  <MainMessage>
    {t(`result.message_${level}`, { typeName: meta.nameJa, tagline: meta.tagline })}
  </MainMessage>
  
  {/* 境界線軸の個別言及（あれば） */}
  {borderlineMessage && (
    <BorderlineMessage>{t(borderlineMessageKey)}</BorderlineMessage>
  )}
  
  {/* 詳しく見る アコーディオン（新規、Task 6-4） */}
  <DetailsAccordion typeMeta={meta} scores={result.scores} locale={locale} />
  
  {/* アクションボタン（既存） */}
  <ActionButtons />
</div>
```

#### 6-4. 「詳しく見る」アコーディオン

`shadcn/ui` の Accordion コンポーネントを使用。
3つのセクションが折りたたまれてる：

1. **各軸の傾向**：4軸の言葉ベース説明
2. **あなたの強み**：タイプごとに3点、箇条書き
3. **関係性での傾向**：1段落の文章

##### 各軸の傾向

```tsx
<AccordionSection title={t('result.details.axes_title')}>
  <AxisDescription axis="EI" preference={determinePreference('EI', scores.EI)} strength={getStrengthLabel(scores.EI)} />
  <AxisDescription axis="SN" preference={determinePreference('SN', scores.SN)} strength={getStrengthLabel(scores.SN)} />
  <AxisDescription axis="TF" preference={determinePreference('TF', scores.TF)} strength={getStrengthLabel(scores.TF)} />
  <AxisDescription axis="JP" preference={determinePreference('JP', scores.JP)} strength={getStrengthLabel(scores.JP)} />
</AccordionSection>
```

各軸の説明テキスト（i18n）：

```json
{
  "result": {
    "details": {
      "axes_title": "各軸の傾向",
      "axis_EI_label": "外向か、内向か",
      "axis_SN_label": "感覚か、直観か",
      "axis_TF_label": "思考か、感情か",
      "axis_JP_label": "判断か、知覚か",
      "axis_EI_strong_E": "強く E（外向）寄り",
      "axis_EI_moderate_E": "明確に E（外向）寄り",
      "axis_EI_mild_E": "やや E（外向）寄り",
      "axis_EI_strong_I": "強く I（内向）寄り",
      "axis_EI_moderate_I": "明確に I（内向）寄り",
      "axis_EI_mild_I": "やや I（内向）寄り",
      "axis_EI_borderline": "ほぼ中間",
      // SN, TF, JP も同様のキー
    }
  }
}
```

UI 例：
```
外向か、内向か
やや E（外向）寄り

感覚か、直観か
やや N（直観）寄り

思考か、感情か
やや F（感情）寄り

判断か、知覚か
ほぼ中間
```

##### あなたの強み

`src/data/types/meta-ja.ts` と `meta-ko.ts` に各タイプの strengths を追加：

```typescript
export const TYPE_META_JA: Record<MbtiType, TypeMeta> = {
  INTJ: {
    // 既存フィールド
    code: 'INTJ',
    nameJa: '建築家',
    // ...
    strengths: [
      '本質を見抜き、複雑な状況の中から構造を見出す力',
      '長期的な視点で計画を立て、辛抱強く実行する能力',
      '他人の評価に左右されず、自分の判断軸を持つ独立性',
    ],
    relationshipNote: '人付き合いは広くないけれど深い。一度信頼した相手には、表面では見せない繊細さや内側にある熱を分かち合えます。相手にも同じ深さを求める傾向があります。',
  },
  // ... 残り15タイプ
};
```

各タイプの strengths（3点）と relationshipNote（1段落）を、
**Animalumeのトーン（決めつけない、占い的でない、媚びない）**で書く。

i18n 設計：上記のように **meta データ自体に書く**（locale ごとに別ファイル）。
これは結果文の表現が長く、i18n キーで分けるより直接 meta に置く方が管理しやすい。

##### 関係性での傾向

タイプの relationshipNote をそのまま表示するだけ。

```tsx
<AccordionSection title={t('result.details.relationship_title')}>
  <p>{meta.relationshipNote}</p>
</AccordionSection>
```

#### 6-5. 16タイプ × 強み3点 + 関係性1段落 の追加

すべての TypeMeta に `strengths: string[]`（3点）と `relationshipNote: string`（1段落）を追加。

**重要**：これらのテキストは Animalume のトーンで書く。
- 「あなたは〇〇です」← NG
- 「〇〇な側面があります」「〇〇の傾向が見えます」← OK
- 「〇〇な力を持っている」← OK
- 「絶対に〇〇」← NG

各タイプの内容は `00-master-design.md` の本質メタファーをベースに、
タイプの本質を言葉で表現する。

**16タイプ分の strengths と relationshipNote を新規作成すること**。
日本語版・韓国語版の両方。

参考フォーマット（INTJ 日本語）：

```typescript
strengths: [
  '本質を見抜き、複雑な状況の中から構造を見出す力',
  '長期的な視点で計画を立て、辛抱強く実行する能力',
  '他人の評価に左右されず、自分の判断軸を持つ独立性',
],
relationshipNote: '人付き合いは広くないけれど深い、というのが INTJ の特徴かもしれません。一度信頼した相手には、表面では見せない繊細さや内側にある熱を分かち合える人。ただ、相手にも同じ深さを求める傾向があるため、表面的な会話だけの関係には早々に飽きてしまうこともあるでしょう。',
```

韓国語版も同様のトーンで書く（ネイティブレビュー前のドラフトでOK）。

---

## 実装上の注意

### Framer Motion の使い方

すでに依存に入ってる。`motion.div`, `AnimatePresence`, `useAnimate` などを活用。
過度に複雑にしない、シンプルなフェード・スライドのみで十分。

### Tailwind の活用

新しい色は使わない。`tailwind.config.ts` に既に定義してある以下のみ使う：
- `accent-rose` `accent-sage` `accent-gold` `accent-mist`
- `bg`, `bg-subtle`, `bg-muted`
- `ink`, `ink-soft`, `ink-mute`
- `border`, `border-strong`

### shadcn/ui Accordion

`pnpm dlx shadcn@latest add accordion` で追加。
既に他の shadcn コンポーネントを使っているはず。

### アクセシビリティ

- アニメーションは `prefers-reduced-motion` を尊重する
- `motion-safe:` プレフィックスを使うか、`useReducedMotion` フックで判定

### コミット粒度

各 Task ごとに git commit：
- `feat(diagnosis): カード背景の水彩演出と軸別アクセント`
- `feat(diagnosis): 選択肢を左右配置に変更、スワイプ示唆`
- `feat(diagnosis): 進捗マイルストーンと選択フィードバック`
- `feat(diagnosis): 戻るボタンの視認性向上、スキップ削除`
- `feat(diagnosis): 初回チュートリアル追加`
- `feat(result): 数値表示を削除、動的メインメッセージに変更`
- `feat(result): 詳しく見るアコーディオン追加（軸傾向・強み・関係性）`
- `feat(types): 16タイプに strengths と relationshipNote を追加`

---

## 完成条件

- [ ] `pnpm dev` 起動、視覚的に明らかに改善されていることを確認
- [ ] 1問目でスワイプヒントが表示される
- [ ] 2問目以降では非表示
- [ ] 選択肢が左右配置になっている
- [ ] 軸ごとに微妙にカードのアクセントが変わる
- [ ] 進捗マイルストーン（10/20/30問）でメッセージが表示される
- [ ] 選択時のアニメーションが滑らか
- [ ] 「ひとつ戻る」ボタンが進捗バーの下に常時表示
- [ ] スキップ機能は削除
- [ ] **結果画面の数値（%、スコアバー）がすべて削除されている**
- [ ] **確信度レベルに応じた動的メインメッセージが表示される**
- [ ] **境界線軸がある場合、その軸の説明が表示される**
- [ ] **「詳しく見る」アコーディオンが機能（軸傾向・強み・関係性）**
- [ ] **16タイプすべてに strengths（3点）と relationshipNote（1段落）が用意されている**
- [ ] 日本語・韓国語の切替で全テキストが変わる
- [ ] `pnpm typecheck` `pnpm lint` `pnpm build` 全てエラーなし

---

## 期待する変化

ユーザーが診断中に「**自分を見つめている時間**」を感じられ、
結果画面では「**自分の物語を読んでいる**」感覚になる。

業者っぽくない、占いっぽくない、ダッシュボードっぽくない、
けれど「**ただの心理テスト**」じゃないと伝わる、エディトリアル雑誌のような体験。

---

開始してください。Task 1 から順番に進めて、各タスク完了時に簡潔に報告してください。

特に Task 6 は実装ボリューム大きい（16タイプ × 強み3点 + 関係性1段落 × 2言語 = 計32項目の新規テキスト作成）ので、
最後に集中して取り組むこと。
詰まったら遠慮なく止めて、ユーザーに確認してください。
