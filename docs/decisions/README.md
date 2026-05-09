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
| [0004](./0004-zero-individual-monetization.md) | 個人課金なし、データライセンス事業モデル | Accepted | 高 | 2026-05-08 |
| [0005](./0005-character-pre-generation.md) | キャラクター3バージョン事前生成方式 | Accepted | 中 | 2026-05-08 |
| [0006](./0006-cocomi-asset-reuse.md) | Cocomi 資産（swipe-deck 等）流用判断 | Accepted | 中 | 2026-05-08 |
| [0007](./0007-line-kakao-priority.md) | LINE / Kakao Login 優先（Instagram 後回し） | Accepted | 中 | 2026-05-08 |

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
