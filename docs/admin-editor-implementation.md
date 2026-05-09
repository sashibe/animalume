# 管理画面（コンテンツエディタ）実装指示書

> 作成日: 2026-05-09
> 対象: Animalume の管理画面実装（CLAUDE.md §4 Phase 1 配下の機能）
> 配置先: `docs/admin-editor-implementation.md`

このドキュメントは Claude Code に向けた**実装指示書**です。順番に従ってファイルを作成すれば、`/admin` 配下のコンテンツ管理画面が完成します。

---

## 0. 事前確認

実装着手前に以下を確認してください。

### 0.1 必読ファイル

| 順序 | パス | 確認事項 |
|------|------|---------|
| 1 | `CLAUDE.md` | プロジェクト全体の context、Tone & Manner |
| 2 | `00-master-design.md` | 16タイプの設計マスター（参考） |
| 3 | `tailwind.config.ts` | 利用可能なクラス |
| 4 | `tsconfig.json` | パスエイリアス（`@/*` → `src/*`）の確認 |
| 5 | `src/lib/firebase.ts` | Firestore / Auth インスタンスのエクスポート |

### 0.2 前提機能

以下が **既に実装済み**であることを前提とします。なければ先に作ってください。

- [ ] Firebase Auth の初期化（`src/lib/firebase.ts` から `auth`, `db` をエクスポート）
- [ ] `useAuth()` フック（`src/lib/auth.ts`）
- [ ] shadcn/ui の `Input`, `Textarea`, `Button`
- [ ] `cn()` ユーティリティ（`@/lib/utils`）
- [ ] React Router によるルーティング基盤

`useAuth` が未実装の場合、`§9.2` の最小実装を先に配置してください。

### 0.3 依存パッケージ追加

以下を一括追加：

```bash
pnpm add idb budoux @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities firebase react-router-dom
```

shadcn/ui コンポーネントの追加（未追加の場合のみ）：

```bash
pnpm dlx shadcn@latest add input textarea button
```

---

## 1. 全体構成

### 1.1 ディレクトリ構造

```
src/features/admin/
├── shared/
│   ├── types.ts                  共通型定義
│   ├── limits.ts                 文字数ルール
│   ├── validate.ts               バリデーション
│   ├── draft-store.ts            IndexedDB 下書き
│   ├── hash.ts                   差分検出用ハッシュ
│   └── SmartText.tsx             BudouX 適用テキスト
├── editor/
│   ├── useAutoDraft.ts           自動保存フック
│   ├── LangTabs.tsx              言語切替タブ
│   ├── LocalizedField.tsx        多言語フィールド
│   ├── SaveIndicator.tsx         保存状態バッジ
│   └── EditorShell.tsx           編集画面共通レイアウト
├── types/                        タイプ説明エディタ
│   ├── topic-helpers.ts
│   ├── TopicCard.tsx
│   ├── TopicList.tsx
│   ├── TypePreview.tsx
│   └── TypeEditor.tsx
├── questions/                    問題エディタ
│   ├── question-helpers.ts
│   ├── AxisSelector.tsx
│   ├── WeightSelector.tsx
│   ├── QuestionPreview.tsx
│   └── QuestionEditor.tsx
├── ui-strings/                   UI 文言エディタ
│   ├── string-helpers.ts
│   ├── StringRow.tsx
│   ├── StringTree.tsx
│   ├── JsonImportExport.tsx
│   └── UiStringsEditor.tsx
├── publish/                      公開フロー
│   ├── firestore-store.ts
│   ├── diff.ts
│   ├── DiffView.tsx
│   ├── PublishDialog.tsx
│   └── usePublish.ts
├── lists/                        一覧画面
│   ├── shared-list/
│   │   ├── ProgressBadge.tsx
│   │   ├── DraftIndicator.tsx
│   │   └── useContentStatus.ts
│   ├── TypeList.tsx
│   ├── QuestionList.tsx
│   └── UiStringsList.tsx
├── layout/
│   ├── AdminShell.tsx
│   └── AdminSidebar.tsx
├── auth/
│   └── AdminGate.tsx
└── routes.tsx                    /admin 配下のルート定義
```

### 1.2 実装順序（依存順）

順番を守ってください。後段が前段に依存します。

1. **基盤層** (`shared/`)
2. **共通フレーム** (`editor/`)
3. **タイプエディタ** (`types/`)
4. **問題エディタ** (`questions/`)
5. **UI 文言エディタ** (`ui-strings/`)
6. **公開フロー** (`publish/`)
7. **一覧画面** (`lists/`, `layout/`, `auth/`)
8. **ルート統合** (`routes.tsx` + `App.tsx`)

各ステップ完了時に `pnpm tsc --noEmit` で型エラーがないことを確認してください。

---

## 2. 設計方針（実装前に必読）

### 2.1 多言語対応

すべての編集対象テキストは `Localized = { ja: string; ko: string }` 型で保持。**片言語のみ**の状態は許容するが、公開時は両方必須。

### 2.2 改行制御の思想

- **改行位置を編集者が完全制御することは諦める**（端末・フォントスケールで物理的に崩れる）
- 代わりに「**意味単位で書いて、どこで折れても破綻しない文章**」にする
- 短文（回答カード等）は **BudouX で意味単位の改行**を強制
- 長文（タイプ本文等）は CSS 禁則処理（`text-wrap: pretty`, `word-break: normal`）に任せる
- フィールド種別ごとに **ハード制限**と**ソフト制限**を区別

### 2.3 下書き → 公開のワークフロー

```
[編集中] IndexedDB（自動保存・1秒debounce）
   ↓ 「公開」
[差分プレビュー] PublishDialog
   ↓ 確定
[公開版] Firestore /content_published/{type}/items/{id}
[履歴]   Firestore /content_history/{type}/{id}/{autoId}
```

公開成功後はローカル下書きを削除（次回読み込み時は Firestore 公開版を初期値とする）。

### 2.4 認可

`role: 'admin'` の Firebase custom claim を持つユーザーのみアクセス可。`AdminGate` コンポーネントで全ルートをラップ。

---

## 3. Phase 1: 基盤層

### 3.1 `src/features/admin/shared/types.ts`

共通型定義。**すべての他ファイルがここから import する**。

```ts
// 多言語フィールド共通型
export type Locale = 'ja' | 'ko';
export type Localized = Record<Locale, string>;

export const LOCALES: Locale[] = ['ja', 'ko'];

// ───── タイプ説明 ─────
export type TypeCode =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type TypeTopic = {
  id: string;              // 'strengths', 'relationships' 等
  heading: Localized;
  body: Localized;         // 改行は \n
};

export type TypeDescription = {
  typeCode: TypeCode;
  tagline: Localized;
  topics: TypeTopic[];
};

// ───── 問題文 ─────
export type Axis = 'EI' | 'SN' | 'TF' | 'JP';

export type Question = {
  id: string;
  axis: Axis;
  content: Localized;
  optionA: { text: Localized; weight: number };
  optionB: { text: Localized; weight: number };
};

// ───── UI文言 ─────
export type UiStringNode =
  | Localized
  | { [key: string]: UiStringNode };

export type UiStrings = Record<string, UiStringNode>;

// ───── 下書き共通 ─────
export type ContentType = 'type' | 'question' | 'ui-strings';

export type DraftRecord<T = unknown> = {
  contentType: ContentType;
  contentId: string;       // typeCode / questionId / 'main'
  data: T;
  updatedAt: number;
  publishedHash?: string;
};
```

### 3.2 `src/features/admin/shared/limits.ts`

文字数制限の一元管理。`hard: true` のフィールドは入力時に強制カット。

```ts
import type { Locale } from './types';

export const LIMITS = {
  // ─── タイプ説明 ───
  tagline:     { ja: 22,  ko: 18,  hard: true  },
  typeHeading: { ja: 20,  ko: 18,  hard: false },
  typeBody:    { ja: 400, ko: 350, hard: false },

  // ─── 問題文 ───
  questionBody: { ja: 60, ko: 50, hard: false },
  answerCard:   { ja: 14, ko: 12, hard: true  }, // 物理的に崩れるので強制

  // ─── UI文言 ───
  uiLabel:  { ja: 30,  ko: 26,  hard: false },
  uiNotice: { ja: 100, ko: 90,  hard: false },
} as const;

export type LimitKind = keyof typeof LIMITS;

export function getLimit(kind: LimitKind, lang: Locale) {
  const def = LIMITS[kind];
  return { max: def[lang], hard: def.hard };
}
```

### 3.3 `src/features/admin/shared/validate.ts`

```ts
import type { Locale } from './types';
import { getLimit, LimitKind } from './limits';

export type ValidationStatus = 'ok' | 'warn' | 'over';

export type ValidationResult = {
  count: number;
  limit: number;
  hard: boolean;
  status: ValidationStatus;
};

// サロゲートペア対応の文字数カウント（改行は除外）
export function countChars(text: string): number {
  return [...text.replace(/\n/g, '')].length;
}

export function validateText(
  text: string,
  kind: LimitKind,
  lang: Locale,
): ValidationResult {
  const { max, hard } = getLimit(kind, lang);
  const count = countChars(text);
  const status: ValidationStatus =
    count > max ? 'over' :
    count > max * 0.9 ? 'warn' : 'ok';
  return { count, limit: max, hard, status };
}
```

### 3.4 `src/features/admin/shared/draft-store.ts`

IndexedDB を使った下書き永続化。`idb` ライブラリを薄くラップ。

```ts
import { openDB, type IDBPDatabase } from 'idb';
import type { ContentType, DraftRecord } from './types';

const DB_NAME = 'animalume-admin';
const DB_VERSION = 1;
const STORE = 'drafts';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, {
            keyPath: ['contentType', 'contentId'],
          });
          store.createIndex('updatedAt', 'updatedAt');
          store.createIndex('contentType', 'contentType');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveDraft<T>(record: DraftRecord<T>): Promise<void> {
  const db = await getDB();
  await db.put(STORE, { ...record, updatedAt: Date.now() });
}

export async function getDraft<T>(
  contentType: ContentType,
  contentId: string,
): Promise<DraftRecord<T> | undefined> {
  const db = await getDB();
  return db.get(STORE, [contentType, contentId]);
}

export async function listDraftsByType(
  contentType: ContentType,
): Promise<DraftRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE, 'contentType', contentType);
}

export async function listAllDrafts(): Promise<DraftRecord[]> {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function deleteDraft(
  contentType: ContentType,
  contentId: string,
): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, [contentType, contentId]);
}
```

### 3.5 `src/features/admin/shared/hash.ts`

差分検出用の軽量ハッシュ。衝突耐性は不要、変更検知のみが用途。

```ts
export function quickHash(input: unknown): string {
  const str = JSON.stringify(input);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(36);
}
```

### 3.6 `src/features/admin/shared/SmartText.tsx`

BudouX で意味単位に分割し、塊内での折り返しを禁止。**短文・狭幅**でのみ使用すること。

```tsx
import { useMemo } from 'react';
import { loadDefaultJapaneseParser, loadDefaultKoreanParser } from 'budoux';
import type { Locale } from './types';

const parsers = {
  ja: loadDefaultJapaneseParser(),
  ko: loadDefaultKoreanParser(),
};

type Props = {
  text: string;
  lang: Locale;
  className?: string;
};

export function SmartText({ text, lang, className }: Props) {
  const lines = useMemo(() => {
    return text.split('\n').map(line => parsers[lang].parse(line));
  }, [text, lang]);

  return (
    <span
      className={className}
      style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
    >
      {lines.map((chunks, lineIdx) => (
        <span key={lineIdx}>
          {lineIdx > 0 && <br />}
          {chunks.map((chunk, i) => (
            <span key={i} style={{ display: 'inline-block' }}>{chunk}</span>
          ))}
        </span>
      ))}
    </span>
  );
}
```

---

## 4. Phase 2: 共通フレーム

### 4.1 `src/features/admin/editor/useAutoDraft.ts`

```ts
import { useEffect, useRef } from 'react';
import { saveDraft, getDraft } from '../shared/draft-store';
import type { ContentType } from '../shared/types';

type Options = {
  debounceMs?: number;
  enabled?: boolean;
  onSaved?: () => void;
};

export function useAutoDraft<T>(
  contentType: ContentType,
  contentId: string,
  data: T,
  options: Options = {},
) {
  const { debounceMs = 1000, enabled = true, onSaved } = options;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;
    const serialized = JSON.stringify(data);
    if (serialized === lastSaved.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await saveDraft({ contentType, contentId, data, updatedAt: Date.now() });
      lastSaved.current = serialized;
      onSaved?.();
    }, debounceMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [contentType, contentId, data, debounceMs, enabled, onSaved]);
}

export async function loadDraftOrFallback<T>(
  contentType: ContentType,
  contentId: string,
  fallback: T,
): Promise<T> {
  const record = await getDraft<T>(contentType, contentId);
  return record?.data ?? fallback;
}
```

### 4.2 `src/features/admin/editor/LangTabs.tsx`

```tsx
import { cn } from '@/lib/utils';
import type { Locale } from '../shared/types';

const LABELS: Record<Locale, string> = {
  ja: '日本語',
  ko: '한국어',
};

type Props = {
  value: Locale;
  onChange: (lang: Locale) => void;
  missing?: Partial<Record<Locale, boolean>>;
};

export function LangTabs({ value, onChange, missing }: Props) {
  return (
    <div role="tablist" className="inline-flex rounded-lg border border-stone-200 bg-white p-1">
      {(['ja', 'ko'] as const).map(lang => {
        const selected = value === lang;
        return (
          <button
            key={lang}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(lang)}
            className={cn(
              'relative px-4 py-1.5 rounded-md text-sm transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
              selected
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100',
            )}
          >
            {LABELS[lang]}
            {missing?.[lang] && (
              <span
                className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500"
                aria-label="未入力あり"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
```

### 4.3 `src/features/admin/editor/LocalizedField.tsx`

**重要**: `hard: true` のフィールドは超過分を強制カットする。ペースト時にも有効。

```tsx
import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { validateText, countChars } from '../shared/validate';
import { getLimit } from '../shared/limits';
import type { Locale, Localized } from '../shared/types';
import type { LimitKind } from '../shared/limits';

type Props = {
  label: string;
  value: Localized;
  onChange: (next: Localized) => void;
  lang: Locale;
  kind: LimitKind;
  multiline?: boolean;
  rows?: number;
  placeholder?: Partial<Record<Locale, string>>;
  hint?: string;
};

export function LocalizedField({
  label, value, onChange, lang, kind,
  multiline = false, rows = 6, placeholder, hint,
}: Props) {
  const id = useId();
  const current = value[lang] ?? '';
  const v = validateText(current, kind, lang);

  const otherLang: Locale = lang === 'ja' ? 'ko' : 'ja';
  const otherEmpty = !(value[otherLang] ?? '').trim();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const next = e.target.value;
    const { max, hard } = getLimit(kind, lang);

    if (hard && countChars(next) > max) {
      const trimmed = [...next].slice(0, max).join('');
      onChange({ ...value, [lang]: trimmed });
      return;
    }
    onChange({ ...value, [lang]: next });
  };

  const inputCls = cn(
    'font-mono text-sm',
    v.status === 'over' && 'border-red-400 focus-visible:ring-red-400',
    v.status === 'warn' && 'border-amber-300',
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-stone-700">
          {label}
        </label>
        <span
          className={cn(
            'text-xs tabular-nums',
            v.status === 'over' && 'text-red-600 font-medium',
            v.status === 'warn' && 'text-amber-600',
            v.status === 'ok' && 'text-stone-400',
          )}
          aria-live="polite"
        >
          {v.count}/{v.limit}
          {v.hard && v.status !== 'ok' && ' ⚠'}
        </span>
      </div>

      {multiline ? (
        <Textarea
          id={id}
          value={current}
          onChange={handleChange}
          rows={rows}
          placeholder={placeholder?.[lang]}
          className={inputCls}
        />
      ) : (
        <Input
          id={id}
          value={current}
          onChange={handleChange}
          placeholder={placeholder?.[lang]}
          className={inputCls}
        />
      )}

      <div className="flex items-center justify-between text-xs">
        {hint && <p className="text-stone-500">{hint}</p>}
        {otherEmpty && (
          <p className="text-amber-600 ml-auto">
            ⚠ {otherLang === 'ko' ? '韓国語' : '日本語'}が未入力
          </p>
        )}
      </div>
    </div>
  );
}
```

### 4.4 `src/features/admin/editor/SaveIndicator.tsx`

```tsx
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  status: 'saving' | 'saved' | 'unsaved' | 'idle';
  className?: string;
};

const TEXT = {
  saving:   { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, label: '保存中', cls: 'text-stone-500' },
  saved:    { icon: <Check className="h-3.5 w-3.5" />,                label: '保存済み', cls: 'text-stone-500' },
  unsaved:  { icon: <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />, label: '未保存', cls: 'text-amber-600' },
  idle:     { icon: null, label: '', cls: '' },
} as const;

export function SaveIndicator({ status, className }: Props) {
  if (status === 'idle') return null;
  const { icon, label, cls } = TEXT[status];
  return (
    <div className={cn('flex items-center gap-1.5 text-xs', cls, className)}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
```

### 4.5 `src/features/admin/editor/EditorShell.tsx`

```tsx
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  langTabs: ReactNode;
  saveIndicator?: ReactNode;
  onBack?: () => void;
  onPublish?: () => void;
  publishLabel?: string;
  publishDisabled?: boolean;
  children: ReactNode;
  preview?: ReactNode;
};

export function EditorShell({
  title, subtitle, langTabs, saveIndicator,
  onBack, onPublish, publishLabel = '公開', publishDisabled,
  children, preview,
}: Props) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-md hover:bg-stone-100 text-stone-600"
              aria-label="戻る"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-medium text-stone-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-stone-500 truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saveIndicator}
            {langTabs}
            {onPublish && (
              <Button onClick={onPublish} disabled={publishDisabled} size="sm">
                {publishLabel}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {preview ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            <div className="space-y-6 min-w-0">{children}</div>
            <aside className="space-y-2">
              <h2 className="text-xs font-medium uppercase tracking-wider text-stone-500">
                プレビュー
              </h2>
              <div className="sticky top-20">{preview}</div>
            </aside>
          </div>
        ) : (
          <div className="space-y-6">{children}</div>
        )}
      </main>
    </div>
  );
}
```

---

## 5. Phase 3: タイプ説明エディタ

### 5.1 `src/features/admin/types/topic-helpers.ts`

```ts
import type { TypeTopic, Localized } from '../shared/types';

const emptyLoc = (): Localized => ({ ja: '', ko: '' });

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function newTopic(): TypeTopic {
  return { id: generateId(), heading: emptyLoc(), body: emptyLoc() };
}

export function addTopic(topics: TypeTopic[]): TypeTopic[] {
  return [...topics, newTopic()];
}

export function removeTopic(topics: TypeTopic[], id: string): TypeTopic[] {
  return topics.filter(t => t.id !== id);
}

export function updateTopic(
  topics: TypeTopic[],
  id: string,
  patch: Partial<TypeTopic>,
): TypeTopic[] {
  return topics.map(t => (t.id === id ? { ...t, ...patch } : t));
}

export function reorderTopics(
  topics: TypeTopic[],
  fromId: string,
  toId: string,
): TypeTopic[] {
  const fromIdx = topics.findIndex(t => t.id === fromId);
  const toIdx = topics.findIndex(t => t.id === toId);
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return topics;
  const next = [...topics];
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);
  return next;
}
```

### 5.2 `src/features/admin/types/TopicCard.tsx`

```tsx
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LocalizedField } from '../editor/LocalizedField';
import type { Locale, TypeTopic } from '../shared/types';

type Props = {
  topic: TypeTopic;
  index: number;
  lang: Locale;
  onChange: (next: TypeTopic) => void;
  onDelete: () => void;
};

export function TopicCard({ topic, index, lang, onChange, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: topic.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const headingText = topic.heading[lang] || `（見出し未入力）`;
  const bodyPreview = (topic.body[lang] || '').slice(0, 40);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-stone-200 bg-white',
        'transition-shadow',
        isDragging && 'shadow-lg ring-1 ring-stone-300',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-100">
        <button
          {...attributes}
          {...listeners}
          type="button"
          className="p-1 -ml-1 text-stone-400 hover:text-stone-600 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded"
          aria-label="並び替え"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <span className="text-xs text-stone-400 tabular-nums w-6">
          #{index + 1}
        </span>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex-1 text-left flex items-center gap-2 min-w-0 hover:text-stone-900 text-stone-700"
        >
          {collapsed ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronUp className="h-4 w-4 shrink-0" />}
          <span className="font-medium text-sm truncate">{headingText}</span>
          {collapsed && bodyPreview && (
            <span className="text-xs text-stone-400 truncate hidden sm:inline">
              — {bodyPreview}
            </span>
          )}
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-stone-500">削除しますか？</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="h-7 text-xs"
            >
              削除
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              className="h-7 text-xs"
            >
              取消
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 text-stone-400 hover:text-red-600 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            aria-label="このトピックを削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4">
          <LocalizedField
            label="見出し"
            value={topic.heading}
            onChange={(heading) => onChange({ ...topic, heading })}
            lang={lang}
            kind="typeHeading"
          />
          <LocalizedField
            label="本文"
            value={topic.body}
            onChange={(body) => onChange({ ...topic, body })}
            lang={lang}
            kind="typeBody"
            multiline
            rows={6}
            hint="段落区切りは空行（Enter 2回）。行内の改行はブラウザに任せます。"
          />
        </div>
      )}
    </div>
  );
}
```

### 5.3 `src/features/admin/types/TopicList.tsx`

```tsx
import {
  DndContext, DragEndEvent, KeyboardSensor, PointerSensor,
  closestCenter, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopicCard } from './TopicCard';
import { addTopic, removeTopic, reorderTopics, updateTopic } from './topic-helpers';
import type { Locale, TypeTopic } from '../shared/types';

type Props = {
  topics: TypeTopic[];
  lang: Locale;
  onChange: (next: TypeTopic[]) => void;
};

export function TopicList({ topics, lang, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onChange(reorderTopics(topics, String(active.id), String(over.id)));
  };

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={topics.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {topics.map((topic, i) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                index={i}
                lang={lang}
                onChange={(next) => onChange(updateTopic(topics, topic.id, next))}
                onDelete={() => onChange(removeTopic(topics, topic.id))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {topics.length === 0 && (
        <div className="text-center py-8 text-sm text-stone-500 border border-dashed border-stone-200 rounded-lg">
          まだトピックがありません
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => onChange(addTopic(topics))}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        トピックを追加
      </Button>
    </div>
  );
}
```

### 5.4 `src/features/admin/types/TypePreview.tsx`

```tsx
import { SmartText } from '../shared/SmartText';
import type { Locale, TypeDescription } from '../shared/types';

type Props = {
  data: TypeDescription;
  lang: Locale;
};

export function TypePreview({ data, lang }: Props) {
  return (
    <div className="space-y-3">
      <div className="text-[10px] text-stone-400 px-1">375px (iPhone SE / 標準)</div>

      <div
        className="rounded-2xl bg-[#FAF9F6] shadow-sm border border-stone-200/50 overflow-hidden mx-auto"
        style={{ width: 375 }}
      >
        <div className="px-6 py-8 space-y-6">
          <div className="text-center">
            <p className="text-xs tracking-[0.3em] text-stone-500 mb-2">
              {data.typeCode}
            </p>
            <SmartText
              text={data.tagline[lang] || '(タグライン未入力)'}
              lang={lang}
              className="font-serif text-2xl text-stone-800 leading-tight"
            />
          </div>

          <div className="border-t border-stone-200/60" />

          {data.topics.length === 0 && (
            <p className="text-center text-xs text-stone-400">
              トピック未作成
            </p>
          )}

          {data.topics.map((topic) => {
            const heading = topic.heading[lang];
            const body = topic.body[lang];
            if (!heading && !body) return null;
            return (
              <section key={topic.id} className="space-y-2">
                {heading && (
                  <h3 className="font-serif text-base text-stone-800">
                    {heading}
                  </h3>
                )}
                {body && (
                  <p
                    className="text-[15px] text-stone-700 leading-[1.8] whitespace-pre-line"
                    style={{
                      wordBreak: 'normal',
                      overflowWrap: 'break-word',
                      // @ts-expect-error - text-wrap: pretty は新しい CSS
                      textWrap: 'pretty',
                    }}
                  >
                    {body}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### 5.5 `src/features/admin/types/TypeEditor.tsx`

```tsx
import { useEffect, useState } from 'react';
import type { Locale, TypeCode, TypeDescription } from '../shared/types';
import { useAutoDraft, loadDraftOrFallback } from '../editor/useAutoDraft';
import { LangTabs } from '../editor/LangTabs';
import { LocalizedField } from '../editor/LocalizedField';
import { EditorShell } from '../editor/EditorShell';
import { SaveIndicator } from '../editor/SaveIndicator';
import { TopicList } from './TopicList';
import { TypePreview } from './TypePreview';
import { usePublish } from '../publish/usePublish';
import { PublishDialog } from '../publish/PublishDialog';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

const empty = (typeCode: TypeCode): TypeDescription => ({
  typeCode,
  tagline: { ja: '', ko: '' },
  topics: [],
});

type Props = {
  typeCode: TypeCode;
  onBack?: () => void;
};

export function TypeEditor({ typeCode, onBack }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<TypeDescription>(empty(typeCode));
  const [lang, setLang] = useState<Locale>('ja');
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  useEffect(() => {
    loadDraftOrFallback('type', typeCode, empty(typeCode)).then((d) => {
      setData(d);
      setLoaded(true);
    });
  }, [typeCode]);

  useAutoDraft('type', typeCode, data, {
    enabled: loaded,
    onSaved: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  const pub = usePublish<TypeDescription>({
    db,
    userId: user?.uid ?? 'anonymous',
    contentType: 'type',
    contentId: typeCode,
  });

  const missing = {
    ja:
      !data.tagline.ja.trim() ||
      data.topics.some((t) => !t.heading.ja.trim() || !t.body.ja.trim()),
    ko:
      !data.tagline.ko.trim() ||
      data.topics.some((t) => !t.heading.ko.trim() || !t.body.ko.trim()),
  };

  const canPublish = !missing.ja && !missing.ko && data.topics.length > 0;

  return (
    <>
      <EditorShell
        title={`${typeCode} - タイプ説明`}
        subtitle={`${data.topics.length}個のトピック`}
        onBack={onBack}
        saveIndicator={<SaveIndicator status={saveStatus} />}
        langTabs={<LangTabs value={lang} onChange={setLang} missing={missing} />}
        onPublish={() => pub.open(data)}
        publishDisabled={!canPublish}
        preview={<TypePreview data={data} lang={lang} />}
      >
        {!loaded ? (
          <div className="text-sm text-stone-400">読み込み中…</div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-stone-700">タグライン</h2>
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <LocalizedField
                  label="タグライン"
                  value={data.tagline}
                  onChange={(tagline) => {
                    setSaveStatus('saving');
                    setData({ ...data, tagline });
                  }}
                  lang={lang}
                  kind="tagline"
                  hint="タイプを一言で表すキャッチコピー（例：未来の地図を描く者）"
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium text-stone-700">トピック</h2>
              <TopicList
                topics={data.topics}
                lang={lang}
                onChange={(topics) => {
                  setSaveStatus('saving');
                  setData({ ...data, topics });
                }}
              />
            </section>
          </>
        )}
      </EditorShell>

      <PublishDialog
        open={pub.dialogOpen}
        contentType="type"
        contentLabel={`${typeCode} - タイプ説明`}
        draft={pub.draft as TypeDescription}
        fetchPublished={pub.fetchPublished}
        onPublish={pub.publish}
        onClose={pub.close}
      />
    </>
  );
}
```

---

## 6. Phase 4: 問題エディタ

### 6.1 `src/features/admin/questions/question-helpers.ts`

```ts
import type { Question, Axis, Localized } from '../shared/types';

const emptyLoc = (): Localized => ({ ja: '', ko: '' });

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function newQuestion(axis: Axis = 'EI'): Question {
  return {
    id: generateId(),
    axis,
    content: emptyLoc(),
    optionA: { text: emptyLoc(), weight: 1 },
    optionB: { text: emptyLoc(), weight: -1 },
  };
}

export const AXIS_POLES: Record<Axis, { positive: string; negative: string; label: string }> = {
  EI: { positive: 'E（外向）', negative: 'I（内向）', label: '外向 ↔ 内向' },
  SN: { positive: 'S（感覚）', negative: 'N（直観）', label: '感覚 ↔ 直観' },
  TF: { positive: 'T（思考）', negative: 'F（感情）', label: '思考 ↔ 感情' },
  JP: { positive: 'J（判断）', negative: 'P（知覚）', label: '判断 ↔ 知覚' },
};
```

### 6.2 `src/features/admin/questions/AxisSelector.tsx`

```tsx
import { cn } from '@/lib/utils';
import { AXIS_POLES } from './question-helpers';
import type { Axis } from '../shared/types';

const AXES: Axis[] = ['EI', 'SN', 'TF', 'JP'];

type Props = {
  value: Axis;
  onChange: (next: Axis) => void;
};

export function AxisSelector({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="軸" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {AXES.map((axis) => {
        const selected = value === axis;
        return (
          <button
            key={axis}
            role="radio"
            type="button"
            aria-checked={selected}
            onClick={() => onChange(axis)}
            className={cn(
              'rounded-lg border px-3 py-2.5 text-left transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
              selected
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300',
            )}
          >
            <div className="font-mono text-sm font-medium">{axis}</div>
            <div className={cn('text-[11px] mt-0.5', selected ? 'text-stone-300' : 'text-stone-500')}>
              {AXIS_POLES[axis].label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

### 6.3 `src/features/admin/questions/WeightSelector.tsx`

```tsx
import { cn } from '@/lib/utils';

const WEIGHTS = [1, 2, 3] as const;

type Props = {
  value: number;
  onChange: (next: number) => void;
  poleLabel: string;
};

export function WeightSelector({ value, onChange, poleLabel }: Props) {
  const abs = Math.abs(value);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-500 w-24 shrink-0">{poleLabel} 寄与度</span>
      <div className="flex gap-1">
        {WEIGHTS.map((w) => {
          const selected = abs === w;
          return (
            <button
              key={w}
              type="button"
              onClick={() => onChange(value < 0 ? -w : w)}
              className={cn(
                'h-7 w-9 rounded text-xs font-mono transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
                selected
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
              )}
              aria-pressed={selected}
            >
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

### 6.4 `src/features/admin/questions/QuestionPreview.tsx`

```tsx
import { SmartText } from '../shared/SmartText';
import type { Locale, Question } from '../shared/types';

type Props = {
  question: Question;
  lang: Locale;
  index?: number;
  total?: number;
};

export function QuestionPreview({ question, lang, index = 1, total = 40 }: Props) {
  const content = question.content[lang];
  const a = question.optionA.text[lang];
  const b = question.optionB.text[lang];
  const percent = Math.round((index / total) * 100);

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-stone-400 px-1">375px (実機相当)</div>

      <div
        className="rounded-2xl bg-[#FAF9F6] border border-stone-200/50 overflow-hidden mx-auto"
        style={{ width: 375 }}
      >
        <div className="px-6 pt-6 pb-2">
          <div className="h-0.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-stone-700" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-stone-500 mt-1.5 font-mono">
            <span>{index} / {total}</span>
            <span>{percent}%</span>
          </div>
        </div>

        <div className="px-6 pt-12 pb-10">
          <div className="rounded-xl border border-stone-200/70 bg-white/60 px-5 py-8 space-y-8">
            <div className="text-center">
              <div className="text-[11px] tracking-[0.2em] text-stone-400 mb-4">
                Q.{String(index).padStart(2, '0')}
              </div>
              <h2 className="font-serif text-[22px] leading-[1.5] text-stone-800">
                {content ? `「${content}」` : <span className="text-stone-300">（問題文未入力）</span>}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <OptionCard text={a} lang={lang} dir="left" />
              <OptionCard text={b} lang={lang} dir="right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionCard({ text, lang, dir }: { text: string; lang: Locale; dir: 'left' | 'right' }) {
  return (
    <div className="rounded-xl border border-stone-200/70 bg-white/60 px-3.5 py-4 min-h-[120px] flex flex-col justify-between">
      <div className="text-[14px] leading-[1.6] text-stone-700">
        {text ? (
          <SmartText text={text} lang={lang} />
        ) : (
          <span className="text-stone-300">（未入力）</span>
        )}
      </div>
      <div className={`text-stone-300 text-base ${dir === 'left' ? 'text-left' : 'text-right'}`}>
        {dir === 'left' ? '←' : '→'}
      </div>
    </div>
  );
}
```

### 6.5 `src/features/admin/questions/QuestionEditor.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Locale, Question, Axis } from '../shared/types';
import { useAutoDraft, loadDraftOrFallback } from '../editor/useAutoDraft';
import { LangTabs } from '../editor/LangTabs';
import { LocalizedField } from '../editor/LocalizedField';
import { EditorShell } from '../editor/EditorShell';
import { SaveIndicator } from '../editor/SaveIndicator';
import { AxisSelector } from './AxisSelector';
import { WeightSelector } from './WeightSelector';
import { QuestionPreview } from './QuestionPreview';
import { newQuestion, AXIS_POLES } from './question-helpers';
import { usePublish } from '../publish/usePublish';
import { PublishDialog } from '../publish/PublishDialog';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

type Props = {
  questionId: string;
  initial?: Question;
  index?: number;
  total?: number;
  onBack?: () => void;
};

export function QuestionEditor({
  questionId, initial, index = 1, total = 40, onBack,
}: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<Question>(initial ?? newQuestion());
  const [lang, setLang] = useState<Locale>('ja');
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  useEffect(() => {
    loadDraftOrFallback('question', questionId, initial ?? newQuestion()).then((d) => {
      setData(d);
      setLoaded(true);
    });
  }, [questionId, initial]);

  useAutoDraft('question', questionId, data, {
    enabled: loaded,
    onSaved: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  const pub = usePublish<Question>({
    db,
    userId: user?.uid ?? 'anonymous',
    contentType: 'question',
    contentId: questionId,
  });

  const update = (patch: Partial<Question>) => {
    setSaveStatus('saving');
    setData({ ...data, ...patch });
  };

  const missing = {
    ja: !data.content.ja.trim() || !data.optionA.text.ja.trim() || !data.optionB.text.ja.trim(),
    ko: !data.content.ko.trim() || !data.optionA.text.ko.trim() || !data.optionB.text.ko.trim(),
  };

  const canPublish = !missing.ja && !missing.ko;
  const poles = AXIS_POLES[data.axis];

  return (
    <>
      <EditorShell
        title={`問題 ${String(index).padStart(2, '0')} - ${data.axis}`}
        subtitle={poles.label}
        onBack={onBack}
        saveIndicator={<SaveIndicator status={saveStatus} />}
        langTabs={<LangTabs value={lang} onChange={setLang} missing={missing} />}
        onPublish={() => pub.open(data)}
        publishDisabled={!canPublish}
        preview={<QuestionPreview question={data} lang={lang} index={index} total={total} />}
      >
        {!loaded ? (
          <div className="text-sm text-stone-400">読み込み中…</div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-stone-700">軸</h2>
              <AxisSelector
                value={data.axis}
                onChange={(axis: Axis) => update({ axis })}
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium text-stone-700">問題文（状況提示）</h2>
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <LocalizedField
                  label="状況"
                  value={data.content}
                  onChange={(content) => update({ content })}
                  lang={lang}
                  kind="questionBody"
                  hint="例：自分が間違っていたと気づいたとき。プレビューでは自動で「」が付きます。"
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium text-stone-700">選択肢</h2>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                回答カードは <span className="font-mono">14文字以内（日）/ 12文字以内（韓）</span>。物理的に崩れるので超過入力はブロックされます。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
                  <div className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                    選択肢 A → {data.optionA.weight >= 0 ? poles.positive : poles.negative}
                  </div>
                  <LocalizedField
                    label="本文"
                    value={data.optionA.text}
                    onChange={(text) => update({ optionA: { ...data.optionA, text } })}
                    lang={lang}
                    kind="answerCard"
                  />
                  <WeightSelector
                    value={data.optionA.weight}
                    onChange={(w) => update({ optionA: { ...data.optionA, weight: w } })}
                    poleLabel={data.optionA.weight >= 0 ? poles.positive : poles.negative}
                  />
                </div>

                <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
                  <div className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                    選択肢 B → {data.optionB.weight >= 0 ? poles.positive : poles.negative}
                  </div>
                  <LocalizedField
                    label="本文"
                    value={data.optionB.text}
                    onChange={(text) => update({ optionB: { ...data.optionB, text } })}
                    lang={lang}
                    kind="answerCard"
                  />
                  <WeightSelector
                    value={data.optionB.weight}
                    onChange={(w) => update({ optionB: { ...data.optionB, weight: w } })}
                    poleLabel={data.optionB.weight >= 0 ? poles.positive : poles.negative}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => update({
                    optionA: { ...data.optionA, weight: -data.optionA.weight },
                    optionB: { ...data.optionB, weight: -data.optionB.weight },
                  })}
                  className="text-xs"
                >
                  A↔B の極性を入れ替え
                </Button>
              </div>
            </section>
          </>
        )}
      </EditorShell>

      <PublishDialog
        open={pub.dialogOpen}
        contentType="question"
        contentLabel={`問題 ${String(index).padStart(2, '0')} - ${data.axis}`}
        draft={pub.draft as Question}
        fetchPublished={pub.fetchPublished}
        onPublish={pub.publish}
        onClose={pub.close}
      />
    </>
  );
}
```

---

## 7. Phase 5: UI 文言エディタ

### 7.1 `src/features/admin/ui-strings/string-helpers.ts`

```ts
import type { Localized, UiStrings, UiStringNode } from '../shared/types';

export function isLocalized(node: UiStringNode): node is Localized {
  return (
    typeof node === 'object' &&
    node !== null &&
    'ja' in node &&
    'ko' in node &&
    typeof (node as Localized).ja === 'string' &&
    typeof (node as Localized).ko === 'string'
  );
}

export type FlatEntry = {
  path: string;
  segments: string[];
  value: Localized;
};

export function flatten(strings: UiStrings, prefix: string[] = []): FlatEntry[] {
  const out: FlatEntry[] = [];
  for (const key of Object.keys(strings).sort()) {
    const node = strings[key];
    const segments = [...prefix, key];
    if (isLocalized(node)) {
      out.push({ path: segments.join('.'), segments, value: node });
    } else {
      out.push(...flatten(node as UiStrings, segments));
    }
  }
  return out;
}

export function getAtPath(strings: UiStrings, segments: string[]): Localized | undefined {
  let cur: UiStringNode = strings;
  for (const seg of segments) {
    if (typeof cur !== 'object' || cur === null || isLocalized(cur)) return undefined;
    cur = (cur as UiStrings)[seg];
    if (cur === undefined) return undefined;
  }
  return isLocalized(cur) ? cur : undefined;
}

export function setAtPath(
  strings: UiStrings,
  segments: string[],
  value: Localized,
): UiStrings {
  if (segments.length === 0) return strings;
  const [head, ...rest] = segments;
  const next = { ...strings };
  if (rest.length === 0) {
    next[head] = value;
  } else {
    const child = (strings[head] && !isLocalized(strings[head] as UiStringNode))
      ? (strings[head] as UiStrings)
      : {};
    next[head] = setAtPath(child, rest, value);
  }
  return next;
}

export function splitByLocale(strings: UiStrings): { ja: object; ko: object } {
  const ja: any = {};
  const ko: any = {};
  for (const entry of flatten(strings)) {
    let cursorJa = ja;
    let cursorKo = ko;
    for (let i = 0; i < entry.segments.length - 1; i++) {
      const seg = entry.segments[i];
      cursorJa[seg] = cursorJa[seg] ?? {};
      cursorKo[seg] = cursorKo[seg] ?? {};
      cursorJa = cursorJa[seg];
      cursorKo = cursorKo[seg];
    }
    const last = entry.segments[entry.segments.length - 1];
    cursorJa[last] = entry.value.ja;
    cursorKo[last] = entry.value.ko;
  }
  return { ja, ko };
}

export function mergeFromLocale(jaJson: object, koJson: object): UiStrings {
  function walk(jaNode: any, koNode: any): UiStrings | Localized {
    if (typeof jaNode === 'string' || typeof koNode === 'string') {
      return { ja: typeof jaNode === 'string' ? jaNode : '', ko: typeof koNode === 'string' ? koNode : '' };
    }
    const out: UiStrings = {};
    const keys = new Set([...Object.keys(jaNode ?? {}), ...Object.keys(koNode ?? {})]);
    for (const key of keys) {
      const childJa = jaNode?.[key];
      const childKo = koNode?.[key];
      const merged = walk(childJa, childKo);
      out[key] = merged as UiStringNode;
    }
    return out;
  }
  return walk(jaJson, koJson) as UiStrings;
}

export function inferLimitKind(path: string): 'uiLabel' | 'uiNotice' {
  const lower = path.toLowerCase();
  if (/(message|description|notice|hint|body|caption|tooltip)/.test(lower)) {
    return 'uiNotice';
  }
  return 'uiLabel';
}
```

### 7.2 `src/features/admin/ui-strings/StringRow.tsx`

```tsx
import { useState } from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocalizedField } from '../editor/LocalizedField';
import { inferLimitKind } from './string-helpers';
import type { Locale, Localized } from '../shared/types';

type Props = {
  path: string;
  value: Localized;
  onChange: (next: Localized) => void;
  lang: Locale;
  highlight?: string;
};

export function StringRow({ path, value, onChange, lang, highlight }: Props) {
  const [open, setOpen] = useState(!!highlight);
  const kind = inferLimitKind(path);
  const otherLang: Locale = lang === 'ja' ? 'ko' : 'ja';
  const missing = !value[lang]?.trim();
  const otherMissing = !value[otherLang]?.trim();

  const segments = path.split('.');
  const last = segments.pop()!;
  const prefix = segments.join('.');

  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 text-left',
          'hover:bg-stone-50 transition-colors',
          'focus-visible:outline-none focus-visible:bg-stone-50',
          open && 'bg-stone-50',
        )}
      >
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 text-stone-400 shrink-0 transition-transform',
            open && 'rotate-90',
          )}
        />

        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <code className="text-[11px] font-mono text-stone-400 shrink-0">
            {prefix && <>{prefix}.</>}
            <span className="text-stone-700">{last}</span>
          </code>
          <span
            className={cn(
              'text-sm truncate',
              missing ? 'text-stone-300 italic' : 'text-stone-700',
            )}
          >
            {missing ? '(未入力)' : value[lang]}
          </span>
        </div>

        {(missing || otherMissing) && (
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" aria-label="未入力あり" />
        )}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 bg-stone-50/50">
          <LocalizedField
            label={last}
            value={value}
            onChange={onChange}
            lang={lang}
            kind={kind}
          />
        </div>
      )}
    </div>
  );
}
```

### 7.3 `src/features/admin/ui-strings/StringTree.tsx`

```tsx
import { useMemo } from 'react';
import { StringRow } from './StringRow';
import { flatten, setAtPath } from './string-helpers';
import type { Locale, UiStrings } from '../shared/types';

type Props = {
  strings: UiStrings;
  onChange: (next: UiStrings) => void;
  lang: Locale;
  query: string;
  filter: 'all' | 'missing' | 'lang-missing';
};

export function StringTree({ strings, onChange, lang, query, filter }: Props) {
  const entries = useMemo(() => flatten(strings), [strings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (q) {
        const hay = `${e.path} ${e.value.ja} ${e.value.ko}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filter === 'missing') {
        return !e.value.ja.trim() || !e.value.ko.trim();
      }
      if (filter === 'lang-missing') {
        return !e.value[lang].trim();
      }
      return true;
    });
  }, [entries, query, filter, lang]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const head = e.segments[0];
      if (!map.has(head)) map.set(head, []);
      map.get(head)!.push(e);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-stone-400 border border-dashed border-stone-200 rounded-lg">
        {query ? `「${query}」に一致するキーがありません` : '表示できるキーがありません'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([groupKey, groupEntries]) => (
        <section key={groupKey} className="rounded-lg border border-stone-200 bg-white overflow-hidden">
          <header className="px-3 py-2 bg-stone-50 border-b border-stone-200">
            <code className="text-xs font-mono text-stone-600">
              {groupKey}
              <span className="text-stone-400 ml-1.5">({groupEntries.length})</span>
            </code>
          </header>
          <div>
            {groupEntries.map((e) => (
              <StringRow
                key={e.path}
                path={e.path}
                value={e.value}
                onChange={(next) => onChange(setAtPath(strings, e.segments, next))}
                lang={lang}
                highlight={query}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

### 7.4 `src/features/admin/ui-strings/JsonImportExport.tsx`

```tsx
import { useState } from 'react';
import { Download, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { splitByLocale, mergeFromLocale } from './string-helpers';
import type { UiStrings } from '../shared/types';

type Props = {
  strings: UiStrings;
  onImport: (next: UiStrings) => void;
};

export function JsonImportExport({ strings, onImport }: Props) {
  const [mode, setMode] = useState<'closed' | 'export' | 'import'>('closed');
  const [importJa, setImportJa] = useState('');
  const [importKo, setImportKo] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const exported = splitByLocale(strings);

  const handleImport = () => {
    try {
      const ja = importJa.trim() ? JSON.parse(importJa) : {};
      const ko = importKo.trim() ? JSON.parse(importKo) : {};
      onImport(mergeFromLocale(ja, ko));
      setMode('closed');
      setImportJa('');
      setImportKo('');
      setImportError(null);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'JSON解析エラー');
    }
  };

  if (mode === 'closed') {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setMode('export')}>
          <Download className="h-3.5 w-3.5 mr-1.5" /> エクスポート
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMode('import')}>
          <Upload className="h-3.5 w-3.5 mr-1.5" /> インポート
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <header className="flex items-center justify-between px-5 py-3 border-b border-stone-200">
          <h2 className="font-medium text-stone-800">
            {mode === 'export' ? 'JSON エクスポート' : 'JSON インポート'}
          </h2>
          <button
            type="button"
            onClick={() => setMode('closed')}
            className="p-1 text-stone-400 hover:text-stone-700 rounded"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {mode === 'export' && (
            <>
              <p className="text-xs text-stone-500">
                以下を <code>i18n/ja.json</code> / <code>i18n/ko.json</code> に貼り付けてコミットしてください。
              </p>
              <ExportBlock label="ja.json" json={exported.ja} />
              <ExportBlock label="ko.json" json={exported.ko} />
            </>
          )}

          {mode === 'import' && (
            <>
              <p className="text-xs text-stone-500">
                既存の <code>ja.json</code> / <code>ko.json</code> を貼り付けてください。空欄でも可。
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">ja.json</label>
                <Textarea
                  value={importJa}
                  onChange={(e) => setImportJa(e.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder="{...}"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">ko.json</label>
                <Textarea
                  value={importKo}
                  onChange={(e) => setImportKo(e.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder="{...}"
                />
              </div>
              {importError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {importError}
                </div>
              )}
            </>
          )}
        </div>

        <footer className="flex justify-end gap-2 px-5 py-3 border-t border-stone-200">
          <Button variant="ghost" onClick={() => setMode('closed')}>キャンセル</Button>
          {mode === 'import' && (
            <Button onClick={handleImport}>インポート実行</Button>
          )}
        </footer>
      </div>
    </div>
  );
}

function ExportBlock({ label, json }: { label: string; json: object }) {
  const text = JSON.stringify(json, null, 2);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-stone-700">{label}</label>
        <Button variant="ghost" size="sm" onClick={copy} className="h-7 text-xs">
          {copied ? 'コピーしました' : 'コピー'}
        </Button>
      </div>
      <pre className="bg-stone-50 border border-stone-200 rounded p-3 text-xs font-mono overflow-auto max-h-48">
        {text}
      </pre>
    </div>
  );
}
```

### 7.5 `src/features/admin/ui-strings/UiStringsEditor.tsx`

```tsx
import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Locale, UiStrings } from '../shared/types';
import { useAutoDraft, loadDraftOrFallback } from '../editor/useAutoDraft';
import { LangTabs } from '../editor/LangTabs';
import { EditorShell } from '../editor/EditorShell';
import { SaveIndicator } from '../editor/SaveIndicator';
import { StringTree } from './StringTree';
import { JsonImportExport } from './JsonImportExport';
import { flatten } from './string-helpers';
import { usePublish } from '../publish/usePublish';
import { PublishDialog } from '../publish/PublishDialog';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

type FilterMode = 'all' | 'missing' | 'lang-missing';

type Props = {
  initial?: UiStrings;
  onBack?: () => void;
};

const CONTENT_ID = 'main';

export function UiStringsEditor({ initial = {}, onBack }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<UiStrings>(initial);
  const [lang, setLang] = useState<Locale>('ja');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  useEffect(() => {
    loadDraftOrFallback('ui-strings', CONTENT_ID, initial).then((d) => {
      setData(d);
      setLoaded(true);
    });
  }, [initial]);

  useAutoDraft('ui-strings', CONTENT_ID, data, {
    enabled: loaded,
    onSaved: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  const pub = usePublish<UiStrings>({
    db,
    userId: user?.uid ?? 'anonymous',
    contentType: 'ui-strings',
    contentId: CONTENT_ID,
  });

  const stats = useMemo(() => {
    const all = flatten(data);
    const missingJa = all.filter((e) => !e.value.ja.trim()).length;
    const missingKo = all.filter((e) => !e.value.ko.trim()).length;
    return { total: all.length, missingJa, missingKo };
  }, [data]);

  const missing = {
    ja: stats.missingJa > 0,
    ko: stats.missingKo > 0,
  };

  const canPublish = !missing.ja && !missing.ko && stats.total > 0;

  const handleChange = (next: UiStrings) => {
    setSaveStatus('saving');
    setData(next);
  };

  return (
    <>
      <EditorShell
        title="UI文言"
        subtitle={`${stats.total}キー / 未入力 ja:${stats.missingJa} ko:${stats.missingKo}`}
        onBack={onBack}
        saveIndicator={<SaveIndicator status={saveStatus} />}
        langTabs={<LangTabs value={lang} onChange={setLang} missing={missing} />}
        onPublish={() => pub.open(data)}
        publishDisabled={!canPublish}
      >
        {!loaded ? (
          <div className="text-sm text-stone-400">読み込み中…</div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="キー名・値で検索（例: result.share）"
                  className="pl-9"
                />
              </div>

              <div className="flex gap-1 rounded-lg border border-stone-200 bg-white p-1">
                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
                  全て
                </FilterButton>
                <FilterButton active={filter === 'missing'} onClick={() => setFilter('missing')}>
                  未入力
                </FilterButton>
                <FilterButton active={filter === 'lang-missing'} onClick={() => setFilter('lang-missing')}>
                  {lang === 'ja' ? '日本語' : '韓国語'}が未入力
                </FilterButton>
              </div>

              <JsonImportExport strings={data} onImport={handleChange} />
            </div>

            {stats.total > 0 && (
              <div className="flex gap-4 text-xs text-stone-500">
                <span>
                  日本語 完了率: <span className="font-mono text-stone-700">
                    {Math.round(((stats.total - stats.missingJa) / stats.total) * 100)}%
                  </span>
                </span>
                <span>
                  韓国語 完了率: <span className="font-mono text-stone-700">
                    {Math.round(((stats.total - stats.missingKo) / stats.total) * 100)}%
                  </span>
                </span>
              </div>
            )}

            <StringTree
              strings={data}
              onChange={handleChange}
              lang={lang}
              query={query}
              filter={filter}
            />

            {stats.total === 0 && (
              <div className="text-center py-12 text-sm text-stone-500 border border-dashed border-stone-200 rounded-lg">
                <p className="mb-3">UI文言がまだ登録されていません</p>
                <p className="text-xs text-stone-400">
                  右上の「インポート」から既存の <code>ja.json</code> / <code>ko.json</code> を取り込んでください
                </p>
              </div>
            )}
          </>
        )}
      </EditorShell>

      <PublishDialog
        open={pub.dialogOpen}
        contentType="ui-strings"
        contentLabel="UI文言"
        draft={pub.draft as UiStrings}
        fetchPublished={pub.fetchPublished}
        onPublish={pub.publish}
        onClose={pub.close}
      />
    </>
  );
}

function FilterButton({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-md text-xs transition whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
        active
          ? 'bg-stone-900 text-white'
          : 'text-stone-600 hover:bg-stone-100',
      )}
    >
      {children}
    </button>
  );
}
```

---

## 8. Phase 6: 公開フロー

### 8.1 `src/features/admin/publish/firestore-store.ts`

```ts
import {
  doc, getDoc, setDoc, collection, addDoc, serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type {
  ContentType, TypeDescription, Question, UiStrings,
} from '../shared/types';

type PublishedContent = TypeDescription | Question | UiStrings;

const COLLECTION_PATHS: Record<ContentType, string> = {
  type: 'content_published/types/items',
  question: 'content_published/questions/items',
  'ui-strings': 'content_published/ui_strings/items',
};

const HISTORY_PATH = 'content_history';

export class ContentStore {
  constructor(private db: Firestore, private currentUserId: string) {}

  async getPublished<T extends PublishedContent>(
    contentType: ContentType,
    contentId: string,
  ): Promise<T | null> {
    const ref = doc(this.db, COLLECTION_PATHS[contentType], contentId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as T) : null;
  }

  async publish<T extends PublishedContent>(
    contentType: ContentType,
    contentId: string,
    data: T,
    options?: { changeNote?: string },
  ): Promise<void> {
    const ref = doc(this.db, COLLECTION_PATHS[contentType], contentId);
    const before = await this.getPublished<T>(contentType, contentId);

    await setDoc(ref, {
      ...data,
      _meta: {
        publishedAt: serverTimestamp(),
        publishedBy: this.currentUserId,
      },
    });

    const historyRef = collection(
      this.db,
      `${HISTORY_PATH}/${contentType}/${contentId}`,
    );
    await addDoc(historyRef, {
      before,
      after: data,
      changeNote: options?.changeNote ?? '',
      changedAt: serverTimestamp(),
      changedBy: this.currentUserId,
    });
  }
}
```

### 8.2 `src/features/admin/publish/diff.ts`

```ts
import type { Localized } from '../shared/types';

export type DiffEntry =
  | { kind: 'added'; path: string; after: Localized }
  | { kind: 'removed'; path: string; before: Localized }
  | { kind: 'modified'; path: string; before: Localized; after: Localized };

export function diffLocalizedTree(
  before: unknown,
  after: unknown,
  path: string[] = [],
): DiffEntry[] {
  const out: DiffEntry[] = [];

  if (isLocalizedLike(before) && isLocalizedLike(after)) {
    if (before.ja !== after.ja || before.ko !== after.ko) {
      out.push({ kind: 'modified', path: path.join('.'), before, after });
    }
    return out;
  }

  if (isLocalizedLike(before) && !isLocalizedLike(after)) {
    out.push({ kind: 'removed', path: path.join('.'), before });
    return out;
  }
  if (!isLocalizedLike(before) && isLocalizedLike(after)) {
    out.push({ kind: 'added', path: path.join('.'), after });
    return out;
  }

  if (Array.isArray(before) || Array.isArray(after)) {
    const beforeArr = Array.isArray(before) ? before : [];
    const afterArr = Array.isArray(after) ? after : [];

    const beforeMap = new Map<string, { item: any; index: number }>();
    beforeArr.forEach((item, i) => {
      const key = item?.id ?? `__idx_${i}`;
      beforeMap.set(key, { item, index: i });
    });

    const seenKeys = new Set<string>();
    afterArr.forEach((item, i) => {
      const key = item?.id ?? `__idx_${i}`;
      seenKeys.add(key);
      const beforeEntry = beforeMap.get(key);
      out.push(...diffLocalizedTree(
        beforeEntry?.item,
        item,
        [...path, key],
      ));
    });
    beforeMap.forEach((entry, key) => {
      if (!seenKeys.has(key)) {
        out.push(...diffLocalizedTree(entry.item, undefined, [...path, key]));
      }
    });
    return out;
  }

  if (isPlainObject(before) || isPlainObject(after)) {
    const allKeys = new Set([
      ...Object.keys(before ?? {}),
      ...Object.keys(after ?? {}),
    ]);
    for (const key of allKeys) {
      out.push(...diffLocalizedTree(
        (before as any)?.[key],
        (after as any)?.[key],
        [...path, key],
      ));
    }
    return out;
  }

  return out;
}

function isLocalizedLike(v: unknown): v is Localized {
  return typeof v === 'object' && v !== null && 'ja' in v && 'ko' in v
    && typeof (v as any).ja === 'string' && typeof (v as any).ko === 'string';
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export type DiffSummary = {
  added: number;
  removed: number;
  modified: number;
  total: number;
};

export function summarize(diffs: DiffEntry[]): DiffSummary {
  const s = { added: 0, removed: 0, modified: 0, total: diffs.length };
  for (const d of diffs) s[d.kind]++;
  return s;
}
```

### 8.3 `src/features/admin/publish/DiffView.tsx`

```tsx
import { Plus, Minus, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiffEntry, DiffSummary } from './diff';
import type { Locale } from '../shared/types';

type Props = {
  diffs: DiffEntry[];
  summary: DiffSummary;
};

export function DiffView({ diffs, summary }: Props) {
  if (summary.total === 0) {
    return (
      <div className="text-center py-8 text-sm text-stone-500 border border-dashed border-stone-200 rounded-lg">
        変更はありません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3 text-xs">
        {summary.added > 0 && <SummaryBadge kind="added" count={summary.added} />}
        {summary.modified > 0 && <SummaryBadge kind="modified" count={summary.modified} />}
        {summary.removed > 0 && <SummaryBadge kind="removed" count={summary.removed} />}
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {diffs.map((d, i) => (
          <DiffItem key={`${d.path}-${i}`} diff={d} />
        ))}
      </div>
    </div>
  );
}

function SummaryBadge({ kind, count }: { kind: DiffEntry['kind']; count: number }) {
  const config = {
    added:    { icon: <Plus className="h-3 w-3" />,   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',  label: '追加' },
    modified: { icon: <Pencil className="h-3 w-3" />, cls: 'bg-amber-50 text-amber-700 border-amber-200',        label: '変更' },
    removed:  { icon: <Minus className="h-3 w-3" />,  cls: 'bg-red-50 text-red-700 border-red-200',              label: '削除' },
  }[kind];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded border', config.cls)}>
      {config.icon}
      <span className="font-medium">{count}件</span>
      <span>{config.label}</span>
    </span>
  );
}

function DiffItem({ diff }: { diff: DiffEntry }) {
  const config = {
    added:    { cls: 'border-l-emerald-400 bg-emerald-50/30', label: '追加' },
    modified: { cls: 'border-l-amber-400 bg-amber-50/30',     label: '変更' },
    removed:  { cls: 'border-l-red-400 bg-red-50/30',         label: '削除' },
  }[diff.kind];

  return (
    <div className={cn('border border-stone-200 border-l-[3px] rounded-md', config.cls)}>
      <div className="px-3 py-2 border-b border-stone-200/70 flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500">
          {config.label}
        </span>
        <code className="text-xs font-mono text-stone-700 truncate flex-1">
          {diff.path || '(root)'}
        </code>
      </div>
      <div className="px-3 py-2.5 space-y-2">
        {diff.kind === 'modified' && (
          <>
            <DiffSide lang="ja" before={diff.before.ja} after={diff.after.ja} />
            <DiffSide lang="ko" before={diff.before.ko} after={diff.after.ko} />
          </>
        )}
        {diff.kind === 'added' && (
          <>
            <ValueLine label="ja" value={diff.after.ja} variant="added" />
            <ValueLine label="ko" value={diff.after.ko} variant="added" />
          </>
        )}
        {diff.kind === 'removed' && (
          <>
            <ValueLine label="ja" value={diff.before.ja} variant="removed" />
            <ValueLine label="ko" value={diff.before.ko} variant="removed" />
          </>
        )}
      </div>
    </div>
  );
}

function DiffSide({ lang, before, after }: { lang: Locale; before: string; after: string }) {
  if (before === after) {
    return <ValueLine label={lang} value={before || '(空)'} variant="unchanged" />;
  }
  return (
    <div className="space-y-1">
      <ValueLine label={lang} value={before || '(空)'} variant="removed" />
      <ValueLine label={lang} value={after || '(空)'} variant="added" />
    </div>
  );
}

function ValueLine({
  label, value, variant,
}: {
  label: string;
  value: string;
  variant: 'added' | 'removed' | 'unchanged';
}) {
  const cls = {
    added:     'bg-emerald-100/50 text-emerald-900 border-emerald-200',
    removed:   'bg-red-100/50 text-red-900 border-red-200 line-through opacity-70',
    unchanged: 'bg-stone-100/50 text-stone-600 border-stone-200',
  }[variant];
  const sign = { added: '+', removed: '−', unchanged: ' ' }[variant];

  return (
    <div className={cn('flex gap-2 text-sm rounded px-2 py-1.5 border', cls)}>
      <span className="font-mono text-xs text-stone-500 shrink-0 w-5">{label}</span>
      <span className="font-mono text-xs text-stone-400 shrink-0">{sign}</span>
      <span className="whitespace-pre-wrap break-words flex-1">{value}</span>
    </div>
  );
}
```

### 8.4 `src/features/admin/publish/PublishDialog.tsx`

```tsx
import { useEffect, useMemo, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DiffView } from './DiffView';
import { diffLocalizedTree, summarize } from './diff';
import type { ContentType } from '../shared/types';

type Props<T> = {
  open: boolean;
  contentType: ContentType;
  contentLabel: string;
  draft: T;
  fetchPublished: () => Promise<T | null>;
  onPublish: (changeNote: string) => Promise<void>;
  onClose: () => void;
};

type Phase = 'loading' | 'review' | 'publishing' | 'done' | 'error';

export function PublishDialog<T>({
  open, contentType, contentLabel,
  draft, fetchPublished, onPublish, onClose,
}: Props<T>) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [published, setPublished] = useState<T | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [changeNote, setChangeNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setPhase('loading');
    setChangeNote('');
    fetchPublished()
      .then((p) => {
        setPublished(p);
        setPhase('review');
      })
      .catch((e) => {
        setErrorMsg(e instanceof Error ? e.message : '読み込みエラー');
        setPhase('error');
      });
  }, [open, fetchPublished]);

  const diffs = useMemo(() => {
    if (!open || phase !== 'review') return [];
    return diffLocalizedTree(published, draft);
  }, [open, phase, published, draft]);

  const summary = useMemo(() => summarize(diffs), [diffs]);

  const handlePublish = async () => {
    setPhase('publishing');
    try {
      await onPublish(changeNote);
      setPhase('done');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '公開エラー');
      setPhase('error');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-5 py-3 border-b border-stone-200">
          <div>
            <h2 className="font-medium text-stone-800">公開の確認</h2>
            <p className="text-xs text-stone-500 mt-0.5">{contentLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={phase === 'publishing'}
            className="p-1 text-stone-400 hover:text-stone-700 rounded disabled:opacity-50"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {phase === 'loading' && (
            <div className="flex items-center justify-center py-12 text-sm text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              公開版を読み込み中…
            </div>
          )}

          {phase === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              <p className="font-medium mb-1">エラーが発生しました</p>
              <p>{errorMsg}</p>
            </div>
          )}

          {phase === 'done' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-800">
              <p className="font-medium mb-1">公開しました</p>
              <p>変更内容が本番に反映されました。</p>
            </div>
          )}

          {(phase === 'review' || phase === 'publishing') && (
            <>
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-2">
                  差分
                </h3>
                <DiffView diffs={diffs} summary={summary} />
              </div>

              {summary.total > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700">
                    変更メモ（任意・履歴に残ります）
                  </label>
                  <Textarea
                    value={changeNote}
                    onChange={(e) => setChangeNote(e.target.value)}
                    rows={2}
                    placeholder="例: 韓国語ネイティブレビュー反映、表現を柔らかく調整"
                    disabled={phase === 'publishing'}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <footer className="flex justify-end gap-2 px-5 py-3 border-t border-stone-200">
          {phase === 'done' ? (
            <Button onClick={onClose}>閉じる</Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={phase === 'publishing'}
              >
                キャンセル
              </Button>
              <Button
                onClick={handlePublish}
                disabled={phase !== 'review' || summary.total === 0}
              >
                {phase === 'publishing' ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> 公開中…</>
                ) : (
                  <>公開する{summary.total > 0 && ` (${summary.total}件)`}</>
                )}
              </Button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
```

### 8.5 `src/features/admin/publish/usePublish.ts`

```ts
import { useCallback, useState } from 'react';
import { Firestore } from 'firebase/firestore';
import { ContentStore } from './firestore-store';
import { deleteDraft } from '../shared/draft-store';
import type { ContentType } from '../shared/types';

type Options = {
  db: Firestore;
  userId: string;
  contentType: ContentType;
  contentId: string;
  onPublished?: () => void;
};

export function usePublish<T>(options: Options) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<T | null>(null);

  const store = new ContentStore(options.db, options.userId);

  const open = useCallback((data: T) => {
    setDraft(data);
    setDialogOpen(true);
  }, []);

  const close = useCallback(() => {
    setDialogOpen(false);
    setDraft(null);
  }, []);

  const fetchPublished = useCallback(
    () => store.getPublished<T>(options.contentType, options.contentId) as Promise<T | null>,
    [store, options.contentType, options.contentId],
  );

  const publish = useCallback(async (changeNote: string) => {
    if (!draft) throw new Error('下書きがありません');
    await store.publish(options.contentType, options.contentId, draft as any, { changeNote });
    await deleteDraft(options.contentType, options.contentId);
    options.onPublished?.();
  }, [draft, store, options]);

  return {
    dialogOpen,
    draft,
    open,
    close,
    fetchPublished,
    publish,
  };
}
```

---

## 9. Phase 7: 一覧画面・レイアウト・認可

### 9.1 `src/features/admin/lists/shared-list/ProgressBadge.tsx`

```tsx
import { cn } from '@/lib/utils';
import type { Locale } from '../../shared/types';

type Props = {
  lang: Locale;
  progress: number;
  className?: string;
};

const LABELS: Record<Locale, string> = { ja: '日', ko: '韓' };

export function ProgressBadge({ lang, progress, className }: Props) {
  const percent = Math.round(progress * 100);
  const tone =
    percent === 100 ? 'complete' :
    percent === 0 ? 'empty' : 'partial';

  const cls = {
    complete: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    partial:  'bg-amber-50 text-amber-700 border-amber-200',
    empty:    'bg-stone-50 text-stone-400 border-stone-200',
  }[tone];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono tabular-nums',
        cls,
        className,
      )}
      aria-label={`${lang === 'ja' ? '日本語' : '韓国語'} ${percent}%`}
    >
      <span className="font-medium">{LABELS[lang]}</span>
      <span>{percent}%</span>
    </span>
  );
}
```

### 9.2 `src/features/admin/lists/shared-list/DraftIndicator.tsx`

```tsx
import { cn } from '@/lib/utils';

type Props = {
  hasDraft: boolean;
  className?: string;
};

export function DraftIndicator({ hasDraft, className }: Props) {
  if (!hasDraft) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] text-amber-700',
        className,
      )}
      aria-label="未公開の変更あり"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      未公開
    </span>
  );
}
```

### 9.3 `src/features/admin/lists/shared-list/useContentStatus.ts`

```ts
import { useEffect, useState } from 'react';
import type { Firestore } from 'firebase/firestore';
import { ContentStore } from '../../publish/firestore-store';
import { listDraftsByType } from '../../shared/draft-store';
import { flatten as flattenStrings } from '../../ui-strings/string-helpers';
import type {
  TypeDescription, Question, UiStrings, Locale, Localized,
} from '../../shared/types';

export type ContentStatus = {
  contentId: string;
  hasPublished: boolean;
  hasDraft: boolean;
  progress: Record<Locale, number>;
};

function calcProgress(values: Localized[], lang: Locale): number {
  if (values.length === 0) return 0;
  const filled = values.filter(v => v[lang]?.trim()).length;
  return filled / values.length;
}

function collectTypeFields(d: TypeDescription | null): Localized[] {
  if (!d) return [];
  return [
    d.tagline,
    ...d.topics.flatMap(t => [t.heading, t.body]),
  ];
}

function collectQuestionFields(q: Question | null): Localized[] {
  if (!q) return [];
  return [q.content, q.optionA.text, q.optionB.text];
}

function collectUiStringFields(s: UiStrings | null): Localized[] {
  if (!s) return [];
  return flattenStrings(s).map(e => e.value);
}

export function useTypeStatuses(db: Firestore, userId: string, typeCodes: readonly string[]) {
  const [statuses, setStatuses] = useState<Record<string, ContentStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const store = new ContentStore(db, userId);

    (async () => {
      setLoading(true);
      const drafts = await listDraftsByType('type');
      const draftMap = new Map(drafts.map(d => [d.contentId, d.data as TypeDescription]));

      const entries = await Promise.all(
        typeCodes.map(async (code) => {
          const published = await store.getPublished<TypeDescription>('type', code);
          const draft = draftMap.get(code) ?? null;
          const source = draft ?? published;
          const fields = collectTypeFields(source);
          return [code, {
            contentId: code,
            hasPublished: !!published,
            hasDraft: !!draft,
            progress: {
              ja: calcProgress(fields, 'ja'),
              ko: calcProgress(fields, 'ko'),
            },
          }] as const;
        })
      );

      if (!cancelled) {
        setStatuses(Object.fromEntries(entries));
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [db, userId, typeCodes.join(',')]);

  return { statuses, loading };
}

export function useQuestionStatuses(db: Firestore, userId: string, questionIds: readonly string[]) {
  const [statuses, setStatuses] = useState<Record<string, ContentStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const store = new ContentStore(db, userId);

    (async () => {
      setLoading(true);
      const drafts = await listDraftsByType('question');
      const draftMap = new Map(drafts.map(d => [d.contentId, d.data as Question]));

      const entries = await Promise.all(
        questionIds.map(async (id) => {
          const published = await store.getPublished<Question>('question', id);
          const draft = draftMap.get(id) ?? null;
          const source = draft ?? published;
          const fields = collectQuestionFields(source);
          return [id, {
            contentId: id,
            hasPublished: !!published,
            hasDraft: !!draft,
            progress: {
              ja: calcProgress(fields, 'ja'),
              ko: calcProgress(fields, 'ko'),
            },
          }] as const;
        })
      );

      if (!cancelled) {
        setStatuses(Object.fromEntries(entries));
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [db, userId, questionIds.join(',')]);

  return { statuses, loading };
}

export function useUiStringsStatus(db: Firestore, userId: string) {
  const [status, setStatus] = useState<ContentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const store = new ContentStore(db, userId);

    (async () => {
      setLoading(true);
      const drafts = await listDraftsByType('ui-strings');
      const draft = drafts.find(d => d.contentId === 'main')?.data as UiStrings | undefined;
      const published = await store.getPublished<UiStrings>('ui-strings', 'main');
      const source = draft ?? published;
      const fields = collectUiStringFields(source ?? null);

      if (!cancelled) {
        setStatus({
          contentId: 'main',
          hasPublished: !!published,
          hasDraft: !!draft,
          progress: {
            ja: calcProgress(fields, 'ja'),
            ko: calcProgress(fields, 'ko'),
          },
        });
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [db, userId]);

  return { status, loading };
}
```

### 9.4 `src/features/admin/lists/TypeList.tsx`

```tsx
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBadge } from './shared-list/ProgressBadge';
import { DraftIndicator } from './shared-list/DraftIndicator';
import { useTypeStatuses } from './shared-list/useContentStatus';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { TypeCode } from '../shared/types';

const GROUPS: { label: string; tagline: string; codes: TypeCode[] }[] = [
  { label: 'Analysts',   tagline: '光の探究者たち', codes: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] },
  { label: 'Diplomats',  tagline: '光を編む人たち', codes: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] },
  { label: 'Sentinels',  tagline: '光の番人たち',   codes: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] },
  { label: 'Explorers',  tagline: '光の踊り手たち', codes: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] },
];

const TYPE_LABELS: Record<TypeCode, string> = {
  INTJ: '建築家', INTP: '論理学者', ENTJ: '指揮官', ENTP: '討論者',
  INFJ: '提唱者', INFP: '仲介者',   ENFJ: '主人公', ENFP: '運動家',
  ISTJ: '管理者', ISFJ: '擁護者',   ESTJ: '幹部',   ESFJ: '領事官',
  ISTP: '巨匠',   ISFP: '冒険家',   ESTP: '起業家', ESFP: 'エンターテイナー',
};

const ALL_CODES: TypeCode[] = GROUPS.flatMap(g => g.codes);

export function TypeList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { statuses, loading } = useTypeStatuses(db, user?.uid ?? 'anonymous', ALL_CODES);

  const totalDrafts = Object.values(statuses).filter(s => s.hasDraft).length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-stone-900">タイプ説明</h1>
          <p className="text-sm text-stone-500 mt-1">
            16タイプ × 多言語のキャラクター説明
          </p>
        </div>
        {totalDrafts > 0 && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5">
            未公開の変更 {totalDrafts}件
          </div>
        )}
      </header>

      {loading && (
        <div className="flex items-center justify-center py-12 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          読み込み中…
        </div>
      )}

      {!loading && (
        <div className="space-y-8">
          {GROUPS.map((group) => (
            <section key={group.label}>
              <header className="mb-3">
                <h2 className="text-sm font-medium text-stone-700">{group.label}</h2>
                <p className="text-xs text-stone-400">{group.tagline}</p>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {group.codes.map((code) => {
                  const status = statuses[code];
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => navigate(`/admin/types/${code}`)}
                      className={cn(
                        'group text-left rounded-lg border bg-white p-4 transition',
                        'hover:border-stone-400 hover:shadow-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
                        status?.hasDraft ? 'border-amber-200' : 'border-stone-200',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="font-mono text-sm font-medium text-stone-900">{code}</div>
                          <div className="text-xs text-stone-500 mt-0.5">{TYPE_LABELS[code]}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 transition mt-0.5" />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {status && (
                          <>
                            <ProgressBadge lang="ja" progress={status.progress.ja} />
                            <ProgressBadge lang="ko" progress={status.progress.ko} />
                            <DraftIndicator hasDraft={status.hasDraft} className="ml-auto" />
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 9.5 `src/features/admin/lists/QuestionList.tsx`

```tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProgressBadge } from './shared-list/ProgressBadge';
import { DraftIndicator } from './shared-list/DraftIndicator';
import { useQuestionStatuses } from './shared-list/useContentStatus';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { listDraftsByType, saveDraft } from '../shared/draft-store';
import { newQuestion } from '../questions/question-helpers';
import type { Axis, Question } from '../shared/types';

const AXES: (Axis | 'all')[] = ['all', 'EI', 'SN', 'TF', 'JP'];

export function QuestionList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Axis | 'all'>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [draftsLoaded, setDraftsLoaded] = useState(false);

  useEffect(() => {
    listDraftsByType('question').then((drafts) => {
      const qs = drafts.map(d => d.data as Question);
      qs.sort((a, b) => a.id.localeCompare(b.id));
      setQuestions(qs);
      setDraftsLoaded(true);
    });
  }, []);

  const ids = useMemo(() => questions.map(q => q.id), [questions]);
  const { statuses, loading } = useQuestionStatuses(db, user?.uid ?? 'anonymous', ids);

  const filtered = useMemo(() => {
    if (filter === 'all') return questions;
    return questions.filter(q => q.axis === filter);
  }, [questions, filter]);

  const counts = useMemo(() => {
    const c: Record<Axis, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };
    questions.forEach(q => { c[q.axis]++; });
    return c;
  }, [questions]);

  const totalDrafts = Object.values(statuses).filter(s => s.hasDraft).length;

  const handleNew = async () => {
    const q = newQuestion(filter === 'all' ? 'EI' : filter);
    await saveDraft({
      contentType: 'question',
      contentId: q.id,
      data: q,
      updatedAt: Date.now(),
    });
    navigate(`/admin/questions/${q.id}`);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-stone-900">問題</h1>
          <p className="text-sm text-stone-500 mt-1">
            {questions.length}問 / 各軸10問が目標
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalDrafts > 0 && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5">
              未公開 {totalDrafts}件
            </div>
          )}
          <Button onClick={handleNew} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            新しい問題
          </Button>
        </div>
      </header>

      <div className="flex gap-1 rounded-lg border border-stone-200 bg-white p-1 w-fit">
        {AXES.map((axis) => {
          const active = filter === axis;
          const count = axis === 'all'
            ? questions.length
            : counts[axis as Axis];
          return (
            <button
              key={axis}
              type="button"
              onClick={() => setFilter(axis)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs transition flex items-center gap-1.5',
                active ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100',
              )}
            >
              <span className="font-mono">{axis === 'all' ? '全て' : axis}</span>
              <span className={cn('text-[10px]', active ? 'text-stone-300' : 'text-stone-400')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {(loading || !draftsLoaded) && (
        <div className="flex items-center justify-center py-12 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          読み込み中…
        </div>
      )}

      {!loading && draftsLoaded && filtered.length === 0 && (
        <div className="text-center py-16 border border-dashed border-stone-200 rounded-lg">
          <p className="text-sm text-stone-500 mb-4">
            {filter === 'all' ? '問題がまだありません' : `${filter}軸の問題がありません`}
          </p>
          <Button onClick={handleNew} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            最初の問題を作る
          </Button>
        </div>
      )}

      {!loading && draftsLoaded && filtered.length > 0 && (
        <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
          {filtered.map((q, i) => {
            const status = statuses[q.id];
            const preview = q.content.ja || q.content.ko || '(問題文未入力)';
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => navigate(`/admin/questions/${q.id}`)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left',
                  'hover:bg-stone-50 transition border-b border-stone-100 last:border-0',
                  'focus-visible:outline-none focus-visible:bg-stone-50',
                )}
              >
                <span className="text-xs font-mono text-stone-400 w-8 tabular-nums">
                  #{String(i + 1).padStart(2, '0')}
                </span>

                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 shrink-0">
                  {q.axis}
                </span>

                <span className="flex-1 min-w-0 truncate text-sm text-stone-700">
                  {preview}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  {status && (
                    <>
                      <ProgressBadge lang="ja" progress={status.progress.ja} />
                      <ProgressBadge lang="ko" progress={status.progress.ko} />
                      <DraftIndicator hasDraft={status.hasDraft} />
                    </>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-stone-300 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### 9.6 `src/features/admin/lists/UiStringsList.tsx`

```tsx
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { ProgressBadge } from './shared-list/ProgressBadge';
import { DraftIndicator } from './shared-list/DraftIndicator';
import { useUiStringsStatus } from './shared-list/useContentStatus';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

export function UiStringsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { status, loading } = useUiStringsStatus(db, user?.uid ?? 'anonymous');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-serif text-stone-900">UI文言</h1>
        <p className="text-sm text-stone-500 mt-1">
          ボタンラベル、メッセージ、エラー文言など
        </p>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-12 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          読み込み中…
        </div>
      )}

      {!loading && status && (
        <button
          type="button"
          onClick={() => navigate('/admin/ui-strings/edit')}
          className="w-full text-left rounded-lg border border-stone-200 bg-white p-5 hover:border-stone-400 hover:shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-medium text-stone-900">アプリ全体の文言</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {status.hasPublished ? '公開済み' : '未公開'}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 transition" />
          </div>
          <div className="flex items-center gap-2">
            <ProgressBadge lang="ja" progress={status.progress.ja} />
            <ProgressBadge lang="ko" progress={status.progress.ko} />
            <DraftIndicator hasDraft={status.hasDraft} className="ml-auto" />
          </div>
        </button>
      )}
    </div>
  );
}
```

### 9.7 `src/features/admin/layout/AdminSidebar.tsx`

```tsx
import { NavLink } from 'react-router-dom';
import { Users, HelpCircle, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { to: '/admin/types',       label: 'タイプ説明', icon: Users },
  { to: '/admin/questions',   label: '問題',       icon: HelpCircle },
  { to: '/admin/ui-strings',  label: 'UI文言',     icon: Type },
];

export function AdminSidebar() {
  return (
    <nav className="w-56 border-r border-stone-200 bg-stone-50/50 p-4 space-y-1">
      <div className="px-3 py-2 mb-2">
        <div className="font-serif text-stone-900">Animalume</div>
        <div className="text-[10px] uppercase tracking-wider text-stone-400 mt-0.5">
          Admin
        </div>
      </div>
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition',
              isActive
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100',
            )
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

### 9.8 `src/features/admin/layout/AdminShell.tsx`

```tsx
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

export function AdminShell() {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminListContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl p-8">
      {children}
    </div>
  );
}
```

### 9.9 `src/features/admin/auth/AdminGate.tsx`

```tsx
import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type Props = {
  children: ReactNode;
  loginPath?: string;
};

export function AdminGate({ children, loginPath = '/login' }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    user.getIdTokenResult().then((result) => {
      setIsAdmin(result.claims.role === 'admin');
    }).catch(() => {
      setIsAdmin(false);
    });
  }, [user, authLoading]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        認証確認中…
      </div>
    );
  }

  if (!user) {
    return <Navigate to={loginPath} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-medium text-stone-800 mb-2">
            アクセス権限がありません
          </h1>
          <p className="text-sm text-stone-500">
            この画面は管理者のみが閲覧できます。
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 9.10 `src/features/admin/routes.tsx`

```tsx
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { AdminGate } from './auth/AdminGate';
import { AdminShell, AdminListContainer } from './layout/AdminShell';
import { TypeList } from './lists/TypeList';
import { QuestionList } from './lists/QuestionList';
import { UiStringsList } from './lists/UiStringsList';
import { TypeEditor } from './types/TypeEditor';
import { QuestionEditor } from './questions/QuestionEditor';
import { UiStringsEditor } from './ui-strings/UiStringsEditor';
import type { TypeCode } from './shared/types';

export function AdminRoutes() {
  return (
    <AdminGate>
      <Routes>
        <Route element={<AdminShell />}>
          <Route index element={<TypeListPage />} />
          <Route path="types" element={<TypeListPage />} />
          <Route path="questions" element={<QuestionListPage />} />
          <Route path="ui-strings" element={<UiStringsListPage />} />
          <Route path="types/:typeCode" element={<TypeEditorPage />} />
          <Route path="questions/:questionId" element={<QuestionEditorPage />} />
          <Route path="ui-strings/edit" element={<UiStringsEditorPage />} />
        </Route>
      </Routes>
    </AdminGate>
  );
}

function TypeListPage() {
  return <AdminListContainer><TypeList /></AdminListContainer>;
}
function QuestionListPage() {
  return <AdminListContainer><QuestionList /></AdminListContainer>;
}
function UiStringsListPage() {
  return <AdminListContainer><UiStringsList /></AdminListContainer>;
}

function TypeEditorPage() {
  const { typeCode } = useParams();
  const navigate = useNavigate();
  return (
    <TypeEditor
      typeCode={(typeCode ?? 'INTJ') as TypeCode}
      onBack={() => navigate('/admin/types')}
    />
  );
}

function QuestionEditorPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  return (
    <QuestionEditor
      questionId={questionId ?? ''}
      onBack={() => navigate('/admin/questions')}
    />
  );
}

function UiStringsEditorPage() {
  const navigate = useNavigate();
  return (
    <UiStringsEditor
      onBack={() => navigate('/admin/ui-strings')}
    />
  );
}
```

---

## 10. ルートへの組み込み

### 10.1 `src/App.tsx`（既存ファイルへ追記）

既存のルーティングに `/admin/*` を追加：

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminRoutes } from '@/features/admin/routes';
// ... 既存の import

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... 既存のルート */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 10.2 `src/lib/auth.ts`（未実装の場合のみ）

既に存在する場合はスキップ。

```ts
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}
```

---

## 11. Firestore Security Rules

`firestore.rules` に追記してください。CLAUDE.md §7.2 の方針に準拠します。

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 既存のルール…

    // 公開コンテンツ：誰でも読める、書き込みは admin のみ
    match /content_published/{type}/items/{id} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.role == 'admin';
    }

    // 履歴：admin のみ読み書き
    match /content_history/{type}/{id}/{historyId} {
      allow read, write: if request.auth != null
        && request.auth.token.role == 'admin';
    }
  }
}
```

デプロイ：
```bash
firebase deploy --only firestore:rules
```

---

## 12. 管理者権限の付与

`role: 'admin'` カスタムクレームを Firebase Auth ユーザーに付与する必要があります。

### 12.1 一回限りスクリプト

`scripts/grant-admin.mjs` を作成：

```js
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'node:fs';

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node scripts/grant-admin.mjs <uid>');
  process.exit(1);
}

await getAuth().setCustomUserClaims(uid, { role: 'admin' });
console.log(`Granted admin role to ${uid}`);
```

実行：
```bash
pnpm add -D firebase-admin
node scripts/grant-admin.mjs <自分のUID>
```

`service-account.json` は Firebase コンソール →プロジェクト設定 → サービスアカウントから取得。**Git にはコミットしない**こと（`.gitignore` に追加）。

---

## 13. CLAUDE.md への追記

実装完了後、`CLAUDE.md` の以下のセクションに追記してください。

### 13.1 §6 Directory Structure へ追記

```
src/features/
  ├── admin/                       # 管理画面
  │   ├── shared/                  # 基盤
  │   ├── editor/                  # 編集共通フレーム
  │   ├── types/                   # タイプ説明エディタ
  │   ├── questions/               # 問題エディタ
  │   ├── ui-strings/              # UI文言エディタ
  │   ├── publish/                 # 公開フロー
  │   ├── lists/                   # 一覧画面
  │   ├── layout/                  # 管理画面レイアウト
  │   ├── auth/                    # 認可ガード
  │   └── routes.tsx
```

### 13.2 §7.1 Collections へ追記

```
content_published/
  types/items/{typeCode}            # TypeDescription
  questions/items/{questionId}      # Question
  ui_strings/items/main             # UiStrings

content_history/{contentType}/{contentId}/{autoId}
  - before, after, changeNote, changedAt, changedBy
```

### 13.3 §13.3 To Be Decided から削除

- 商標出願以外の「認証」関連項目は埋まったため削除可

---

## 14. 動作確認チェックリスト

実装完了後、以下を順に確認してください。

### 14.1 ビルド・型確認

- [ ] `pnpm tsc --noEmit` でエラーなし
- [ ] `pnpm dev` で起動エラーなし
- [ ] `/admin` にアクセスでき、認可ガードが動く

### 14.2 タイプ説明エディタ

- [ ] `/admin/types` で 16 タイプがグループ表示される
- [ ] `/admin/types/INTJ` でエディタが開く
- [ ] タグライン入力 → 1 秒後に「保存済み」表示
- [ ] トピック追加・並び替え（DnD）・削除が動く
- [ ] 言語タブ切替で内容が保たれる
- [ ] 片方の言語が空のとき言語タブにバッジ
- [ ] プレビューが 375px 幅で表示される
- [ ] 「公開」ボタンで PublishDialog が開き差分が表示される

### 14.3 問題エディタ

- [ ] `/admin/questions` で「新しい問題」ボタンから作成できる
- [ ] 軸選択（EI/SN/TF/JP）が動く
- [ ] 回答カードに 14 文字を超えて入力すると **強制カット**される
- [ ] プレビューで「立つ」「る」のような孤立改行が**起きない**
- [ ] 公開フローが動く

### 14.4 UI 文言エディタ

- [ ] `/admin/ui-strings/edit` でツリー表示
- [ ] インポートで既存 JSON が取り込める
- [ ] 検索でフィルタリングされる
- [ ] エクスポートで `ja.json` / `ko.json` 形式の出力が得られる
- [ ] 公開フローが動く

### 14.5 公開フロー

- [ ] 差分プレビューで追加・変更・削除が色分けされる
- [ ] 変更 0 件のときは公開ボタンが無効
- [ ] 公開後にローカル下書きが消え、再読み込み時は Firestore 公開版が初期値になる
- [ ] `content_history` に履歴が記録される

---

## 15. トラブルシュート

### `Module not found: budoux`
依存追加忘れ。`pnpm add budoux` を実行。

### `Property 'role' does not exist on type 'ParsedToken'`
Firebase Auth の型定義の問題。`AdminGate.tsx` 内で `result.claims.role as string` のようにキャストするか、`@firebase/auth` を最新版に。

### IndexedDB のスキーマ移行エラー
`DB_NAME` を変更するか、ブラウザの DevTools → Application → IndexedDB から `animalume-admin` を削除して再読み込み。

### Firestore 書き込み権限エラー
`grant-admin.mjs` で custom claim を付与した後、**ブラウザ側でログアウト→再ログイン**が必要（トークン更新のため）。

---

## 16. 実装完了後の次の課題

このドキュメントの範囲は **管理画面のフレームワーク**まで。実コンテンツ運用にあたって以下が別途必要です。

- 既存の `descriptions-ja.ts` などの静的データを Firestore に流し込む取り込みスクリプト
- 結果ページ・問題ページ側の Firestore 読み込みフック（公開コンテンツの利用側）
- 問題 ID の命名規約見直し（現在は `Math.random()`、運用上は `EI_001` のような連番が望ましい可能性）
- 複数管理者の同時編集ロック（MAU 1 万到達後）

これらは別タスクとして扱ってください。

---

**End of Document**
