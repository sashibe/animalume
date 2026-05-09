# Animalume - QuestionCard テキスト揃え調整

設問画面の QuestionCard で、テキストの揃え方を調整してください。

---

## 変更内容

`src/features/diagnosis/components/QuestionCard.tsx` の以下を調整：

### 1. 質問文（content）

質問文を表示している要素に `text-center` を追加（中央寄せ）。

```tsx
// 現状の例
<h2 className="text-xl font-serif ...">
  {question.content}
</h2>

// 修正後
<h2 className="text-xl font-serif text-center ...">
  {question.content}
</h2>
```

鉤括弧の擬似要素（`question-bracket` クラス）も中央寄せに揃うように。

### 2. 選択肢A（左側、optionA.text）

選択肢Aの表示要素に `text-left` を追加（左寄せ）。

```tsx
// 修正後
<button className="text-left ...">
  {question.optionA.text}
</button>
```

### 3. 選択肢B（右側、optionB.text）

選択肢Bの表示要素に `text-right` を追加（右寄せ）。

```tsx
// 修正後
<button className="text-right ...">
  {question.optionB.text}
</button>
```

---

## 注意点

- **矢印アイコン（←/→）の位置はそのまま維持**
  - 矢印は今まで通りの位置（おそらく選択肢内の対角の隅）
  - テキストの揃えだけを変更
- **選択肢の左右配置（A=左、B=右）は変更しない**
  - 配置のグリッド構成（grid-cols-2 等）はそのまま
- **既存の他のクラスはすべて維持**
  - パディング、ボーダー、背景色、ホバーエフェクト等はそのまま
- **`whitespace-pre-line` などのクラスがあれば残す**
  - 改行制御は引き続き有効に

---

## 期待する見え方

```
       [Q.04 章番号]

   「大人数の集まりに2時間
    参加した後の気持ちは？」      ← 中央寄せ

  ┌──────────┐  ┌──────────┐
  │もっと盛り  │  │  楽しかったけど│
  │上がりたい  │  │そろそろ一人時間│
  │            │  │      が欲しい  │
  │ ←         │  │           →   │
  └──────────┘  └──────────┘
   左寄せ              右寄せ
```

各カードの中で、テキストが「カードの中心側に寄っている」状態になる。
- 左カード：テキストが左に寄る（カード左端から始まる）
- 右カード：テキストが右に寄る（カード右端で終わる）

この配置によって、左右スワイプの方向性が視覚的にも強調される。

---

## 完成条件

- [ ] 質問文が中央寄せで表示される
- [ ] 選択肢Aのテキストが左寄せ
- [ ] 選択肢Bのテキストが右寄せ
- [ ] 矢印アイコンの位置は変わっていない
- [ ] スマホ・PC両方で確認して違和感ない
- [ ] `pnpm typecheck` `pnpm lint` `pnpm build` エラーなし

---

## コミット

```
feat(diagnosis): QuestionCard のテキスト揃えを調整

- 質問文を中央寄せに
- 選択肢Aを左寄せに
- 選択肢Bを右寄せに
```

---

開始してください。
