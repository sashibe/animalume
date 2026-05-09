# Data Model / Animalume

> Animalume の Firestore データモデルの詳細仕様書。
> CLAUDE.md §7 を補完し、各コレクションのスキーマ詳細・インデックス・セキュリティルール・運用方針を記述する。
>
> このドキュメントは MVP-speed-first フェーズ時点の設計を基準とする。
> production-safety-first 移行時には migration ファイルでスキーマ変更を管理する（CLAUDE.md §4.3）。

---

## 設計原則

### 1. 個人特定情報と統計データの分離

CLAUDE.md §3.3「Data Collection Principles」に基づき、個人特定情報（メール、ソーシャル ID）と
統計データ（タイプ判定結果、属性、回答ログ）は**論理的に分離**して保管する。

具体的には：
- `users/{uid}` には個人特定情報を集約
- `results/{resultId}` には統計データのみ
- `analytics_aggregates/{periodId}` には個人と紐づかない集計のみ

データライセンス販売時は、`analytics_aggregates` または匿名化済みの `results` のみが対象。
`users` の個人特定情報は販売対象外。

### 2. 同意ベースの段階的データ取得

CLAUDE.md §3.3 に基づき、以下を遵守：
- すべての属性データは任意入力
- 各データに対して何のために取るかを明示
- 同意（consent）フラグで利用範囲を分離管理

### 3. 縦断データの保持

CLAUDE.md §3.1「売れるデータの5条件」(5) 時系列性 / ADR-0002「タイプは変化する」前提に基づき、
**ユーザーごとの時系列データを永続的に保持**する。

ユーザーが任意に過去の結果を削除可能。
ただし削除後も匿名化された統計データは集計に残る場合がある（プライバシーポリシーで明示）。

---

## コレクション一覧

| コレクション | 用途 | 永続性 | サイズ予測 |
|---|---|---|---|
| `users` | ユーザーアカウント情報 | 永続 | アクティブユーザー数 |
| `results` | 診断結果ログ | 永続 | アクティブユーザー × 診断回数 |
| `questions` | 問題プール（将来 Firestore 移行） | 永続 | 80問（4軸 × 20問） |
| `relationships` | 友達相性診断結果 | 永続 | 友達ペア数 |
| `analytics_aggregates` | 集計データ（販売用） | 永続 | 月次 × グループ数 |
| `_meta` | 内部運用メタデータ（将来） | 永続 | 数十件 |

---

## users/{uid}

### スキーマ

```typescript
interface User {
  uid: string;                          // Firebase Auth の UID
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
  locale: 'ja' | 'ko';
  isAnonymous: boolean;
  linkedProviders: AuthProvider[];      // ('google' | 'twitter' | 'line' | 'kakao')[]
  
  profile?: {
    ageRange?: '10s' | '20s' | '30s' | '40s' | '50s+';
    gender?: 'female' | 'male' | 'other' | 'no_answer';
    region?: string;                    // ISO 3166-2 形式（例: 'JP-13' = 東京都）
    occupation?: string;                // 列挙値（後で確定）
  };
  
  consent: {
    dataLicensing: boolean;             // 匿名集計データの利用同意
    friendMatching: boolean;            // 友達相性診断の利用同意
    consentedAt: Timestamp;             // 同意日時
    privacyPolicyVersion: string;       // 同意したプライバシーポリシーのバージョン
  };
  
  displayName?: string;                 // 友達相性で表示される名前
  lineUserId?: string;                  // ハッシュ化保管（SHA-256）
  kakaoUserId?: string;                 // ハッシュ化保管（SHA-256）
  
  // 縦断データ分析用
  stats?: {
    totalDiagnoses: number;             // 累計診断回数
    firstDiagnoseAt?: Timestamp;
    lastDiagnoseAt?: Timestamp;
    typeHistory?: {                     // タイプ変化の簡易履歴
      type: MbtiType;
      diagnosedAt: Timestamp;
    }[];
  };
}
```

### インデックス

```
users コレクション:
- locale ASC, lastActiveAt DESC          # アクティブユーザー集計
- profile.ageRange ASC, locale ASC       # セグメント集計
- consent.dataLicensing ASC              # データ利用可能ユーザーの抽出
```

### セキュリティルール

```javascript
match /users/{uid} {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow create: if request.auth != null && request.auth.uid == uid;
  allow update: if request.auth != null && request.auth.uid == uid
    && !('uid' in request.resource.data.diff(resource.data).affectedKeys())
    && !('createdAt' in request.resource.data.diff(resource.data).affectedKeys());
  allow delete: if false;  // 論理削除のみ（後述）
}
```

### 運用ノート

- **匿名→ソーシャル連携**：匿名 UID から新 UID への移行時、`results` も新 UID に紐付け直す（Cloud Function 経由）
- **論理削除**：物理削除はせず、`deletedAt` フィールドでマーク。GDPR 等の削除権行使時のみ物理削除
- **lineUserId / kakaoUserId のハッシュ化**：プラットフォーム ID をそのまま保存せず、`SHA-256(uid + platformId)` で保管

---

## results/{resultId}

### スキーマ

```typescript
interface Result {
  resultId: string;                     // Firestore 自動生成 ID
  userId: string;                       // users/{uid} への参照
  takenAt: Timestamp;
  locale: 'ja' | 'ko';
  type: MbtiType;                       // 'INTJ' | 'INTP' | ... | 'ESFP'
  
  scores: {
    EI: number;                         // -100 to +100（負がI、正がE）
    SN: number;                         // -100 to +100（負がN、正がS）
    TF: number;                         // -100 to +100（負がF、正がT）
    JP: number;                         // -100 to +100（負がP、正がJ）
  };
  
  confidence: number;                   // 0-1、各軸の絶対値平均
  duration: number;                     // 回答所要時間（秒）
  
  quality: {
    flagged: boolean;                   // 適当回答フラグ
    reason?: 
      | 'too_fast'                      // 最短時間しきい値以下
      | 'all_same_direction'            // 全問同じ方向
      | 'identical_pattern'             // 過去の自分と完全一致
      | 'inconsistent_responses';       // 同じ軸の問題で矛盾
    flaggedAt?: Timestamp;
  };
  
  answers: Answer[];                    // 全問の回答ログ（下記 Answer 参照）
  
  // 任意フィールド
  lifeEvents?: LifeEvent[];             // この時点のライフイベント
  notes?: string;                       // ユーザーが残すメモ（将来）
  
  // 分析用メタデータ
  meta?: {
    appVersion: string;                 // 診断時のアプリバージョン
    questionPoolVersion: string;        // 問題プールのバージョン
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    referrer?: string;                  // 流入元（utm パラメータ等）
  };
}

interface Answer {
  questionId: string;
  axis: 'EI' | 'SN' | 'TF' | 'JP';
  optionSelected: 'A' | 'B';
  weight: number;                       // 選択した選択肢の重み（-1 or +1 or その他）
  answeredAt: Timestamp;
  responseTimeMs: number;               // この問題に費やした時間
}

interface LifeEvent {
  category: 
    | 'employment_start'
    | 'employment_change' 
    | 'marriage' 
    | 'childbirth' 
    | 'relocation' 
    | 'loss' 
    | 'other';
  occurredAt?: Timestamp;
  description?: string;                 // 任意のメモ
}
```

### インデックス

```
results コレクション:
- userId ASC, takenAt DESC               # 履歴一覧表示
- type ASC, locale ASC, takenAt DESC     # タイプ別分析
- locale ASC, takenAt DESC               # 地域別分析
- quality.flagged ASC, takenAt DESC      # 品質チェック
- type ASC, takenAt DESC                 # 月次集計用
```

### セキュリティルール

```javascript
match /results/{resultId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
  allow update: if request.auth != null && request.auth.uid == resource.data.userId
    && !('userId' in request.resource.data.diff(resource.data).affectedKeys())
    && !('takenAt' in request.resource.data.diff(resource.data).affectedKeys());
  allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
}
```

集計クエリは Cloud Functions 経由で実行（管理者権限）、ユーザーから直接の集計クエリは禁止。

### 運用ノート

- **適当回答フラグ**：診断完了時に自動評価し、`quality.flagged` を設定。フラグ付き結果はデータ販売の集計対象から除外（CLAUDE.md §3.3）
- **answers の保持**：個別の回答ログは弁別力（D 係数）算出に必要。問題改善のための分析にも使用
- **life_events の取得タイミング**：診断直後ではなく、3回目以降の訪問時に任意で入力（CLAUDE.md §3.3 段階的データ収集フロー）

---

## questions/{questionId}

### スキーマ

```typescript
interface Question {
  questionId: string;
  axis: 'EI' | 'SN' | 'TF' | 'JP';
  format: 'binary' | 'situation' | 'likert';
  locale: 'ja' | 'ko';
  content: string;                      // 問題文
  
  optionA: {
    text: string;
    weight: number;                     // 通常 -1 または +1
  };
  optionB: {
    text: string;
    weight: number;
  };
  
  active: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';  // 弁別力に基づく難易度
  tags?: string[];                      // 'decision', 'social', 'creativity' 等
  
  // 統計（運用中に Cloud Function で更新）
  stats?: {
    shownCount: number;                 // 表示回数
    answeredCount: number;              // 回答到達回数
    skipRate: number;                   // スキップ率
    discriminationIndex: number;        // D 係数（弁別力指標、目標 ≥ 0.3）
    avgResponseTimeMs: number;          // 平均回答時間
    optionADistribution: number;        // A 選択率
    lastAnalyzedAt: Timestamp;
  };
  
  // 運用メタ
  version: string;                      // 問題のバージョン（改訂履歴管理）
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archivedAt?: Timestamp;               // アーカイブされた場合
  archiveReason?: 'low_discrimination' | 'translation_issue' | 'cultural_drift' | 'duplicate' | 'other';
}
```

### 現状

MVP フェーズ（現在）では、問題プールは TypeScript ファイル（`src/data/questions/*-pool.{ja,ko}.ts`）に
ハードコードされている。

理由：
- 高速な開発のため、初期は静的データで十分
- ビルド時に型チェックが効く
- バージョン管理（git）が確実

### Firestore 移行のタイミング

CLAUDE.md §4.2 の Phase Switch 条件と連動：

- 月間アクティブユーザー 1万人を超えた時点
- A/B テストの本格運用を開始する時点
- 多言語対応で問題追加が頻繁になった時点

そのいずれかで Firestore 移行を実施。

### インデックス（移行後）

```
questions コレクション:
- axis ASC, locale ASC, active ASC      # 出題抽出
- stats.discriminationIndex DESC         # 弁別力ランキング
- locale ASC, active ASC, version DESC   # バージョン管理
```

### セキュリティルール

```javascript
match /questions/{questionId} {
  allow read: if true;                  // 全員読み取り可（出題のため）
  allow write: if false;                // 管理者のみ（Cloud Functions 経由）
}
```

---

## relationships/{relId}

### スキーマ

```typescript
interface Relationship {
  relId: string;                        // 自動生成 ID
  userIdA: string;
  userIdB: string;
  
  viewedBy: string[];                   // [userIdA] または [userIdA, userIdB]
                                        // 両者 consent していれば両方
  
  score: number;                        // 0-100、相性スコア
  scoreReason?: string;                 // 相性の解釈（自動生成）
  
  resultIdA: string;                    // userIdA が使った結果ID
  resultIdB: string;                    // userIdB が使った結果ID
  
  typeA: MbtiType;                      // ペアした時の userIdA のタイプ
  typeB: MbtiType;                      // ペアした時の userIdB のタイプ
  
  createdAt: Timestamp;
  lastViewedAt?: Timestamp;
}
```

### インデックス

```
relationships コレクション:
- userIdA ASC, createdAt DESC
- userIdB ASC, createdAt DESC
- (userIdA, userIdB) 複合（ペア検索用）
```

### セキュリティルール

```javascript
match /relationships/{relId} {
  allow read: if request.auth != null 
    && request.auth.uid in resource.data.viewedBy;
  allow create: if request.auth != null
    && request.auth.uid in [request.resource.data.userIdA, request.resource.data.userIdB];
  allow update: if false;               // 一度作成したら不変、新規作成のみ
  allow delete: if request.auth != null
    && request.auth.uid in [resource.data.userIdA, resource.data.userIdB];
}
```

### 運用ノート

- **両者の consent が必要**：友達 A が友達 B を相性診断にかけたい場合、B も Animalume で診断済みかつ `consent.friendMatching: true` である必要がある
- **タイプは時間で変わる**：ADR-0002 に従い、`typeA` `typeB` は「ペアした時点での」タイプを保存。後で再診断しても、過去の relationship は変更されない（履歴として残る）
- **再ペア時の挙動**：両者が再診断した後、新しい relationship を作成可能。古いものはそのまま残る（縦断データとして）

---

## analytics_aggregates/{periodId}

### スキーマ

```typescript
interface AnalyticsAggregate {
  periodId: string;                     // '2026-05' （月次）または '2026-W18' （週次）
  period: string;                       // 同上、別フィールドで明示
  periodType: 'monthly' | 'weekly' | 'daily';
  
  // 全体統計
  totalUsers: number;
  totalDiagnoses: number;
  newUsers: number;                     // 期間内の新規ユーザー
  returningUsers: number;               // 期間内の再診断ユーザー
  
  // タイプ別分布
  typeDistribution: {
    INTJ: number;
    INTP: number;
    // ... 全16タイプ
  };
  
  // セグメント別の分布
  segmentBreakdowns: {
    byAgeRange: {
      [ageRange: string]: { 
        total: number;
        typeDistribution: Record<MbtiType, number>;
      };
    };
    byGender: {
      [gender: string]: {
        total: number;
        typeDistribution: Record<MbtiType, number>;
      };
    };
    byRegion: {
      [region: string]: {
        total: number;
        typeDistribution: Record<MbtiType, number>;
      };
    };
    byLocale: {
      ja: { total: number; typeDistribution: Record<MbtiType, number>; };
      ko: { total: number; typeDistribution: Record<MbtiType, number>; };
    };
  };
  
  // 縦断分析（変化の傾向）
  typeChangeStats?: {
    totalReDiagnoses: number;           // 期間内の再診断回数
    sameTypeRate: number;               // 同タイプを維持した割合
    oneAxisChangeRate: number;          // 1軸だけ変化した割合
    multiAxisChangeRate: number;        // 複数軸変化した割合
  };
  
  // 品質統計
  qualityStats: {
    totalFlagged: number;
    flaggedRate: number;
    avgConfidence: number;
    avgDuration: number;                // 秒
  };
  
  generatedAt: Timestamp;
  generatedBy: string;                  // Cloud Function 名 or 管理者ID
  generationDurationMs: number;
}
```

### インデックス

```
analytics_aggregates コレクション:
- periodType ASC, period DESC            # 期間タイプ別の最新取得
- generatedAt DESC                       # 生成順
```

### セキュリティルール

```javascript
match /analytics_aggregates/{periodId} {
  allow read: if false;                 // 管理者のみ（Admin SDK 経由）
  allow write: if false;                // Cloud Functions のみ
}
```

### 運用ノート

- **生成タイミング**：月次集計は毎月1日 0:00 JST に Cloud Scheduler で自動実行
- **適当回答の除外**：`results.quality.flagged: true` の結果は集計から除外
- **匿名化**：個別ユーザーの特定が不可能な形での集計（最小単位 N=10）
- **販売時の使用**：BtoB データライセンス契約時、契約範囲内の集計レポートを生成・提供

---

## データライフサイクル

### 保持期間

| データ | 保持期間 | 削除トリガー |
|---|---|---|
| `users/{uid}` | 永続（最終アクティブから3年間アイドルで論理削除候補） | ユーザー削除権行使、長期非アクティブ |
| `results/{resultId}` | 永続 | ユーザーから個別削除リクエスト、アカウント削除 |
| `questions/{questionId}` | 永続 | アーカイブのみ（削除しない） |
| `relationships/{relId}` | 永続 | 両者削除合意、片方のアカウント削除 |
| `analytics_aggregates/{periodId}` | 永続 | 削除しない |

### 削除権の対応

GDPR、個人情報保護法に基づくユーザーの削除リクエストに対応：

1. ユーザーから削除リクエスト受領
2. 該当 `users/{uid}` を物理削除
3. `results/{resultId}` のうち該当 userId を匿名化（userId を null に置換）または物理削除
4. `relationships/{relId}` のうち該当ユーザーを含むものを削除
5. `analytics_aggregates` には個人特定情報が含まれないため、影響なし

---

## マイグレーション戦略

### 現フェーズ（MVP-speed-first）

スキーマ変更は git 履歴のみで管理。
本番影響が大きい変更は事前に Sori と相談、段階的にロールアウト。

### production-safety-first 移行後

CLAUDE.md §4.3 に基づき、すべての破壊的変更に migration ファイル必須：

```
migrations/
├── 2026-06-01-add-stats-to-users.ts
├── 2026-06-15-rename-locale-field.ts
└── ...
```

各 migration は：
- forward / backward 両方の処理を実装
- バッチ処理として Cloud Functions で実行
- 実行ログを `_meta/migrations` に記録

---

## 関連

- [CLAUDE.md §3 Data Strategy](../CLAUDE.md)
- [CLAUDE.md §7 Data Model](../CLAUDE.md)
- [ADR-0002 「タイプは変化する」](./decisions/0002-types-can-change-philosophy.md)
- [ADR-0003 Firebase / Firestore 選定](./decisions/0003-firebase-stack.md)
- [ADR-0004 個人課金なし、データライセンス事業モデル](./decisions/0004-zero-individual-monetization.md)
