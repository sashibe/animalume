# Animalume - docs/ の3ファイル新規作成

`docs/data-model.md`、`docs/question-design.md`、`docs/monetization.md` の3ファイルを新規作成。
さらに `docs/design/character-design.md` を `00-master-design.md` から派生させる。

---

## Task 1: docs/data-model.md を新規作成

以下の内容で `docs/data-model.md` を作成してください。

[ここに data-model.md の中身が入る - 別途添付]

---

## Task 2: docs/question-design.md を新規作成

以下の内容で `docs/question-design.md` を作成してください。

[ここに question-design.md の中身が入る - 別途添付]

---

## Task 3: docs/monetization.md を新規作成

以下の内容で `docs/monetization.md` を作成してください。

[ここに monetization.md の中身が入る - 別途添付]

---

## Task 4: docs/design/character-design.md を作成

プロジェクトルートに既に存在する `00-master-design.md` を、
`docs/design/character-design.md` として整理・配置してください。

### 手順

1. `00-master-design.md` の内容を読み込む
2. ヘッダーと冒頭を以下のように調整：

```markdown
# Character Design / Animalume

> Animalume の 16 キャラクター設計マスター。
> 各タイプの本質メタファー・配色・服装・表情・装飾モチーフを定義する。
>
> このドキュメントに基づき、48枚（16タイプ × 3バージョン）の
> キャラクター画像と、32枚（16タイプ × 2言語）のシェアカード画像が生成される。

---

## 共通スタイル（全タイプ固定・絶対不変）

[以下、00-master-design.md の内容そのまま]
```

3. ファイル末尾に「関連」セクションを追加：

```markdown
---

## 関連

- [CLAUDE.md §9 Character Design](../../CLAUDE.md)
- [CLAUDE.md §10 Brand Guidelines](../../CLAUDE.md)
- [design-tokens.md](./design-tokens.md)
- [ADR-0005 キャラクター3バージョン事前生成](../decisions/0005-character-pre-generation.md)
```

4. オリジナルの `00-master-design.md` は**そのまま残す**
   - キャラ画像生成時の参照元として継続使用
   - 将来的に削除する判断は別途

5. `docs/README.md` の TODO を解消：
   - 「character-design.md（TODO: 未作成）」の表記を「character-design.md」に変更

---

## Task 5: CLAUDE.md の関連箇所を確認・調整

### 5-1. §6 Directory Structure

`docs/data-model.md`、`docs/question-design.md`、`docs/monetization.md` の項目に
（TODO: 未作成）等の表記があれば削除して、実体ある状態にする。

### 5-2. §13.2 関連プロジェクト

特に変更不要。

### 5-3. その他の整合性

各ファイル内で他ファイルへのリンクを参照している箇所が、
新しいパスで正しく解決されるか確認。

---

## Task 6: コミット

ファイルごとに分けてコミット：

```
docs(data): data-model.md を新規作成（Firestore スキーマ詳細）
docs(question): question-design.md を新規作成（問題設計指針）
docs(monetization): monetization.md を新規作成（収益戦略詳細）
docs(design): character-design.md を 00-master-design.md から整理して配置
docs(claude): §6 Directory Structure の TODO 表記を解消
```

---

## 完了条件

- [ ] `docs/data-model.md` 存在、内容反映済み
- [ ] `docs/question-design.md` 存在、内容反映済み
- [ ] `docs/monetization.md` 存在、内容反映済み
- [ ] `docs/design/character-design.md` 存在、`00-master-design.md` から整理済み
- [ ] `00-master-design.md` はプロジェクトルートに維持されている
- [ ] `docs/README.md` の TODO 表記が解消されている
- [ ] CLAUDE.md §6 の表記が新しい状態と整合
- [ ] 各ファイル内のリンクが正しく動作

---

## 完了報告

すべて完了したら以下を報告：

1. 作成したファイル4本のパスとサイズ
2. CLAUDE.md の差分（§6 周り）
3. 既存 ADR とのリンク整合性で気付いた点
4. 何か見落としがあれば

---

開始してください。
