# 0003. Firebase / Firestore 選定（Supabase / AWS 比較）

## 状況

Animalume のバックエンド・インフラ選定に際し、以下の選択肢を検討した：

- **Firebase**（Authentication + Firestore + Hosting + Cloud Functions）
- **Supabase**（PostgreSQL + Auth + Storage + Edge Functions）
- **AWS Amplify / AppSync**（DynamoDB or Aurora ベース）
- 自前構築（VPS + 各種ミドルウェア）

ソロ開発主体・MVP-speed-first フェーズ（CLAUDE.md §4.1）・データライセンス事業を将来的に見据える要件が、選定の制約条件となった。

## 決定

**Firebase Authentication + Cloud Firestore + Firebase Hosting + Cloud Functions（必要最小限）構成を採用する。**

詳細は CLAUDE.md §5.2 に記載。

## 理由

### 採用理由

- **Cocomi 資産の即時流用**: Cocomi で構築済みの Firebase 接続ラッパー、匿名認証フロー、swipe-deck コンポーネント、カテゴリタブ・ボトムナビゲーション基盤がそのまま流用可能（CLAUDE.md §5.3、ADR-0006）。Supabase や AWS では資産を活かせず、MVP-speed-first フェーズに致命的に不利。
- **ソロ運用の負荷最小化**: Firebase はマネージドサービスとして運用負荷がほぼゼロ。バックアップ、自動スケーリング、SSL、CDN が標準提供。Sori のソロ開発主体（CLAUDE.md §5.5）と整合。
- **匿名認証 → ソーシャル連携アップグレードが標準サポート**: Animalume の認証フロー（CLAUDE.md §8 Phase 3）と完全に整合。匿名 UID を保持したままアカウント連携できる Firebase Auth の仕組みは、診断履歴の引き継ぎに必須。
- **LINE / Kakao Login 統合の実績**: Firebase Auth Custom Token 経由で実装可能。Phase 5（CLAUDE.md §8）の友達相性機能の前提。Supabase でも実装可能だが、日本語・韓国語圏の事例蓄積は Firebase のほうが厚い。
- **Firestore のリアルタイム同期**: 友達相性診断（Phase 5）で「相互 consent 後に即座に表示」する UX に有利。

### 却下した選択肢

#### Supabase

- **強み**: PostgreSQL ベースで集計クエリは強力。SQL の表現力が高く、データライセンス事業のクエリには向いている。
- **却下理由**:
  - Cocomi 資産流用ができない（実装速度が致命的に劣化）
  - LINE / Kakao Login 統合の実例が Firebase より少ない
  - Sori 自身の Firebase 運用経験値が圧倒的に高い
- **将来的検討の余地**: Phase 6（データライセンス事業）で集計クエリの弱さが顕在化したら、BigQuery 連携または Supabase 並走を検討する余地を残す。

#### AWS Amplify / AppSync

- **却下理由**: 学習コスト・初期構築コストが高い。ソロ MVP には過剰。料金構造の予測性も Firebase に劣る。

#### 自前構築

- **却下理由**: 論外。MVP フェーズで採用する理由が一つもない。運用負荷・セキュリティ責任・スケーリングコストすべてが負債。

### 既知の制約と受容

- **Firestore の集計クエリの弱さ**: ドキュメント DB のため、集計は重い・遅い・高い。MVP フェーズでは Cloud Functions で日次バッチ実行（CLAUDE.md §7.1 analytics_aggregates コレクション）で対応。Phase 6 でデータ販売事業を本格化する際、BigQuery 連携を導入する。
- **ベンダーロックイン**: 受容する。Firestore のデータエクスポート機能は標準提供されているため、将来の移行コストは限定的。Animalume の競争優位は「データそのもの」と「ユーザー体験」にあり、インフラ層ではない。
- **コスト構造**: ユーザー数とデータ量に比例して増加するが、無料診断モデル（ADR-0004）でも十分に持続可能な単価設計が見込める（1 ユーザーあたり数円〜数十円/月の試算）。

## 結果

（後から追記）

---

**作成日**: 2026-05-08
**関連**: CLAUDE.md §5.2, §5.3, §5.5, §7.1, §8, ADR-0006（Cocomi 資産流用）
