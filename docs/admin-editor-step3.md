# Step 3: エディタ UI を .ts ファイル編集に対応させる 実装指示書

> 前提: Step 1（admin-fs プラグイン）と Step 2（source loaders）が完了し、`/admin/debug/sources` で 80問 + 16メタが読み込み・書き戻しできる状態。
> 目的: 既存の TypeEditor / QuestionEditor / 一覧画面を、Firestore ではなくローカル .ts ファイル編集に対応させる。

---

## 0. ゴール

1. **TypeEditor** が `SourceTypeMeta` 全フィールドを編集可能にする（name, group, tagline, essence, strengths 配列, relationshipNote）
2. **QuestionEditor** が `SourceQuestion` 全フィールドを編集可能にする（content, optionA/B, format, difficulty, tags, active）
3. **一覧画面** (`TypeList`, `QuestionList`) を Firestore 経由ではなく `loadAll*` で読むように変更
4. **保存先** を Firestore から `.ts` ファイル直接書き戻しに変更
5. UI 文言エディタは**現状維持**（Firestore のまま、変更なし）
6. デバッグ画面 `/admin/debug/sources` を**削除**
7. 問題エディタは Step 1 で議論した「**回答カード 14文字制限と SmartText プレビュー**」を維持する

---

## 1. 設計方針

### 1.1 保存タイミング

タイプ・問題エディタは UI 文言エディタと違って **明示的な保存ボタンを持つ**。理由：

- `.ts` ファイル全体を書き戻すため、自動保存だと頻繁すぎる
- ファイル書き戻しは Vite HMR を発火させるので、入力中のたびにリロードがかかると編集体験が壊れる

タイプ・問題エディタの保存方式：

| エディタ | 保存方式 |
|---|---|
| UI 文言（既存） | 自動保存 (IndexedDB) → 公開ボタンで Firestore |
| タイプ説明（改造） | **明示的保存ボタン → 即時 .ts ファイル書き戻し** |
| 問題（改造） | **明示的保存ボタン → 即時 .ts ファイル書き戻し** |

### 1.2 保存ボタンの単位

- **タイプ説明**: 1 タイプ単位（保存すると `meta-ja.ts` と `meta-ko.ts` 全体が書き戻される。差分は対象タイプの部分のみ）
- **問題**: 1 問単位（保存すると軸ファイル `{axis}-pool.{locale}.ts` が両言語書き戻される）

ファイル全体が書き戻されるが、エディタは「自分が編集している 1 単位だけ」を意識すれば良い。`saveAllTypeMetas` / `saveQuestionsByAxis` の API がそれを吸収する。

### 1.3 Firestore 関連コードの扱い

`usePublish`, `PublishDialog`, `firestore-store`, `diff` など Firestore 系のコードは**消さない**。UI 文言エディタが今も使っているので保持。タイプ・問題エディタからは参照しなくする。

---

## 2. 実装

### 2.1 共通：保存フックの追加

`src/features/admin/sources/use-source-save.ts`（新規）

```ts
import { useCallback, useState } from 'react';
import { TsStoreError } from '../shared/ts-store';

export type SaveState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'saved'; at: number }
  | { status: 'error'; message: string };

/**
 * .ts ファイル書き戻し用の汎用保存フック。
 * 呼び出し側が saver 関数（例: () => saveQuestionsByAxis(axis, qs)）を提供する。
 */
export function useSourceSave() {
  const [state, setState] = useState<SaveState>({ status: 'idle' });

  const save = useCallback(async (saver: () => Promise<void>) => {
    setState({ status: 'saving' });
    try {
      await saver();
      setState({ status: 'saved', at: Date.now() });
      // 3 秒後に idle に戻す（ユーザーが保存完了を視認できる程度）
      window.setTimeout(() => {
        setState((prev) => (prev.status === 'saved' ? { status: 'idle' } : prev));
      }, 3000);
    } catch (e) {
      const message =
        e instanceof TsStoreError
          ? `保存失敗 (${e.status}): ${e.message}`
          : e instanceof Error
            ? e.message
            : '保存失敗';
      setState({ status: 'error', message });
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, save, reset };
}
```

### 2.2 共通：保存状態インジケータ拡張

`src/features/admin/editor/SaveIndicator.tsx` に新しい状態を追加。既存の export を維持しつつ、`SourceSaveIndicator` を新規追加：

```tsx
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SaveState } from '../sources/use-source-save';

// 既存の SaveIndicator はそのまま残す（UI 文言エディタが使っている）

type Props = {
  state: SaveState;
  className?: string;
};

/**
 * .ts ファイル保存用のインジケータ。
 * SaveState（idle/saving/saved/error）に対応。
 */
export function SourceSaveIndicator({ state, className }: Props) {
  if (state.status === 'idle') return null;

  if (state.status === 'saving') {
    return (
      <div className={cn('flex items-center gap-1.5 text-xs text-stone-500', className)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>保存中…</span>
      </div>
    );
  }

  if (state.status === 'saved') {
    return (
      <div className={cn('flex items-center gap-1.5 text-xs text-stone-500', className)}>
        <Check className="h-3.5 w-3.5 text-emerald-600" />
        <span>保存しました</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-start gap-1.5 text-xs text-red-600', className)}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      <span className="break-words">{state.message}</span>
    </div>
  );
}
```

---

### 2.3 タイプエディタの改造

`src/features/admin/types/TypeEditor.tsx` を全面改造。既存ファイルを置き換える。

```tsx
import { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LangTabs } from '../editor/LangTabs';
import { LocalizedField } from '../editor/LocalizedField';
import { EditorShell } from '../editor/EditorShell';
import { SourceSaveIndicator } from '../editor/SaveIndicator';
import { TypePreview } from './TypePreview';
import { StrengthsList } from './StrengthsList';
import { loadAllTypeMetas, saveAllTypeMetas } from '../sources/type-source';
import { useSourceSave } from '../sources/use-source-save';
import type { Locale } from '../shared/types';
import type { SourceTypeMeta, MbtiType } from '../shared/source-types';

type Props = {
  typeCode: MbtiType;
  onBack?: () => void;
};

export function TypeEditor({ typeCode, onBack }: Props) {
  // 16タイプ全部をメモリに保持。編集中の 1 タイプを差し替えて、保存時は全件書き戻し
  const [allMetas, setAllMetas] = useState<SourceTypeMeta[] | null>(null);
  const [lang, setLang] = useState<Locale>('ja');
  const [error, setError] = useState<string | null>(null);
  const { state: saveState, save } = useSourceSave();

  // 初回ロード
  useEffect(() => {
    let cancelled = false;
    loadAllTypeMetas()
      .then((metas) => {
        if (!cancelled) setAllMetas(metas);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => { cancelled = true; };
  }, []);

  // 編集中のタイプを抽出
  const currentMeta = useMemo(() => {
    return allMetas?.find((m) => m.code === typeCode) ?? null;
  }, [allMetas, typeCode]);

  const updateCurrent = (patch: Partial<SourceTypeMeta>) => {
    if (!allMetas || !currentMeta) return;
    const next = allMetas.map((m) =>
      m.code === typeCode ? { ...m, ...patch } : m,
    );
    setAllMetas(next);
  };

  const handleSave = () => {
    if (!allMetas) return;
    save(() => saveAllTypeMetas(allMetas));
  };

  // 翻訳欠損
  const missing = useMemo(() => {
    if (!currentMeta) return { ja: false, ko: false };
    const fields = [
      currentMeta.name,
      currentMeta.group,
      currentMeta.tagline,
      currentMeta.essence,
      currentMeta.relationshipNote,
      ...currentMeta.strengths,
    ];
    return {
      ja: fields.some((f) => !f.ja.trim()),
      ko: fields.some((f) => !f.ko.trim()),
    };
  }, [currentMeta]);

  if (error) {
    return (
      <div className="p-8 max-w-md text-sm">
        <p className="font-medium text-red-700 mb-2">読み込みエラー</p>
        <p className="text-stone-600">{error}</p>
      </div>
    );
  }

  if (!allMetas || !currentMeta) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        読み込み中…
      </div>
    );
  }

  return (
    <EditorShell
      title={`${typeCode} - ${currentMeta.name[lang] || '(未入力)'}`}
      subtitle={currentMeta.group[lang]}
      onBack={onBack}
      saveIndicator={<SourceSaveIndicator state={saveState} />}
      langTabs={<LangTabs value={lang} onChange={setLang} missing={missing} />}
      onPublish={handleSave}
      publishLabel={saveState.status === 'saving' ? '保存中…' : '保存'}
      publishDisabled={saveState.status === 'saving'}
      preview={<TypePreview meta={currentMeta} lang={lang} />}
    >
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">基本情報</h2>
        <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-4">
          <LocalizedField
            label="タイプ名"
            value={currentMeta.name}
            onChange={(name) => updateCurrent({ name })}
            lang={lang}
            kind="typeHeading"
            hint="例：建築家、論理学者"
          />
          <LocalizedField
            label="グループ名"
            value={currentMeta.group}
            onChange={(group) => updateCurrent({ group })}
            lang={lang}
            kind="typeHeading"
            hint="例：光の探究者たち"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">本質メッセージ</h2>
        <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-4">
          <LocalizedField
            label="タグライン"
            value={currentMeta.tagline}
            onChange={(tagline) => updateCurrent({ tagline })}
            lang={lang}
            kind="tagline"
            hint="タイプを一言で表すキャッチコピー"
          />
          <LocalizedField
            label="エッセンス"
            value={currentMeta.essence}
            onChange={(essence) => updateCurrent({ essence })}
            lang={lang}
            kind="typeHeading"
            hint="タイプの本質を 1 文で要約"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">強み</h2>
        <StrengthsList
          items={currentMeta.strengths}
          lang={lang}
          onChange={(strengths) => updateCurrent({ strengths })}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">関係性ノート</h2>
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <LocalizedField
            label="関係性での傾向"
            value={currentMeta.relationshipNote}
            onChange={(relationshipNote) => updateCurrent({ relationshipNote })}
            lang={lang}
            kind="typeBody"
            multiline
            rows={6}
            hint="他者との関わり方の説明（長文）"
          />
        </div>
      </section>
    </EditorShell>
  );
}
```

### 2.4 強み配列エディタ

`src/features/admin/types/StrengthsList.tsx`（新規）

```tsx
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocalizedField } from '../editor/LocalizedField';
import type { Locale, Localized } from '../shared/types';

type Props = {
  items: Localized[];
  lang: Locale;
  onChange: (next: Localized[]) => void;
};

export function StrengthsList({ items, lang, onChange }: Props) {
  const handleUpdate = (index: number, value: Localized) => {
    onChange(items.map((item, i) => (i === index ? value : item)));
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...items, { ja: '', ko: '' }]);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-stone-200 bg-white p-4 flex gap-3 items-start"
        >
          <span className="text-xs font-mono text-stone-400 tabular-nums w-6 mt-2.5 shrink-0">
            #{i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <LocalizedField
              label={`強み ${i + 1}`}
              value={item}
              onChange={(value) => handleUpdate(i, value)}
              lang={lang}
              kind="typeBody"
              multiline
              rows={2}
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="p-1.5 text-stone-400 hover:text-red-600 rounded mt-2 shrink-0"
            aria-label="削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-8 text-sm text-stone-500 border border-dashed border-stone-200 rounded-lg">
          強みが未登録です
        </div>
      )}

      <Button variant="outline" onClick={handleAdd} className="w-full">
        <Plus className="h-4 w-4 mr-1.5" />
        強みを追加
      </Button>
    </div>
  );
}
```

### 2.5 タイプ プレビュー更新

`src/features/admin/types/TypePreview.tsx` を `SourceTypeMeta` 対応に書き換え：

```tsx
import { SmartText } from '../shared/SmartText';
import type { Locale } from '../shared/types';
import type { SourceTypeMeta } from '../shared/source-types';

type Props = {
  meta: SourceTypeMeta;
  lang: Locale;
};

export function TypePreview({ meta, lang }: Props) {
  return (
    <div className="space-y-3">
      <div className="text-[10px] text-stone-400 px-1">375px (iPhone SE / 標準)</div>

      <div
        className="rounded-2xl bg-[#FAF9F6] shadow-sm border border-stone-200/50 overflow-hidden mx-auto"
        style={{ width: 375 }}
      >
        <div className="px-6 py-8 space-y-6">
          <div className="text-center">
            <p className="text-xs tracking-[0.3em] text-stone-500 mb-1">
              {meta.code}
            </p>
            <p className="text-xs text-stone-400 mb-3">
              {meta.group[lang] || '—'}
            </p>
            <SmartText
              text={meta.name[lang] || '(タイプ名未入力)'}
              lang={lang}
              className="font-serif text-2xl text-stone-800 leading-tight block mb-2"
            />
            <SmartText
              text={meta.tagline[lang] || '(タグライン未入力)'}
              lang={lang}
              className="text-sm text-stone-600 leading-relaxed"
            />
          </div>

          <div className="border-t border-stone-200/60" />

          {meta.essence[lang] && (
            <p className="text-[15px] text-stone-700 leading-[1.8] text-center">
              {meta.essence[lang]}
            </p>
          )}

          {meta.strengths.length > 0 && (
            <section className="space-y-2">
              <h3 className="font-serif text-base text-stone-800">あなたの強み</h3>
              <ul className="space-y-2">
                {meta.strengths.map((s, i) => {
                  const text = s[lang];
                  if (!text) return null;
                  return (
                    <li
                      key={i}
                      className="text-[15px] text-stone-700 leading-[1.8]"
                      style={{
                        wordBreak: 'normal',
                        overflowWrap: 'break-word',
                        // @ts-expect-error - text-wrap: pretty
                        textWrap: 'pretty',
                      }}
                    >
                      ・{text}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {meta.relationshipNote[lang] && (
            <section className="space-y-2">
              <h3 className="font-serif text-base text-stone-800">関係性</h3>
              <p
                className="text-[15px] text-stone-700 leading-[1.8] whitespace-pre-line"
                style={{
                  wordBreak: 'normal',
                  overflowWrap: 'break-word',
                  // @ts-expect-error - text-wrap: pretty
                  textWrap: 'pretty',
                }}
              >
                {meta.relationshipNote[lang]}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 2.6 問題エディタの改造

`src/features/admin/questions/QuestionEditor.tsx` を全面改造：

```tsx
import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LangTabs } from '../editor/LangTabs';
import { LocalizedField } from '../editor/LocalizedField';
import { EditorShell } from '../editor/EditorShell';
import { SourceSaveIndicator } from '../editor/SaveIndicator';
import { AxisSelector } from './AxisSelector';
import { FormatSelector } from './FormatSelector';
import { DifficultySelector } from './DifficultySelector';
import { TagsEditor } from './TagsEditor';
import { WeightSelector } from './WeightSelector';
import { QuestionPreview } from './QuestionPreview';
import { loadAllQuestions, saveQuestionsByAxis } from '../sources/question-source';
import { useSourceSave } from '../sources/use-source-save';
import type { Locale } from '../shared/types';
import type { SourceQuestion, Axis } from '../shared/source-types';

type Props = {
  questionId: string;
  onBack?: () => void;
};

export function QuestionEditor({ questionId, onBack }: Props) {
  const [allQuestions, setAllQuestions] = useState<SourceQuestion[] | null>(null);
  const [lang, setLang] = useState<Locale>('ja');
  const [error, setError] = useState<string | null>(null);
  const { state: saveState, save } = useSourceSave();

  useEffect(() => {
    let cancelled = false;
    loadAllQuestions()
      .then((qs) => {
        if (!cancelled) setAllQuestions(qs);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => { cancelled = true; };
  }, []);

  const currentQuestion = useMemo(() => {
    return allQuestions?.find((q) => q.id === questionId) ?? null;
  }, [allQuestions, questionId]);

  const updateCurrent = (patch: Partial<SourceQuestion>) => {
    if (!allQuestions || !currentQuestion) return;
    const next = allQuestions.map((q) =>
      q.id === questionId ? { ...q, ...patch } : q,
    );
    setAllQuestions(next);
  };

  const handleSave = () => {
    if (!allQuestions || !currentQuestion) return;
    // 該当軸のみ書き戻す
    const axisQuestions = allQuestions.filter((q) => q.axis === currentQuestion.axis);
    save(() => saveQuestionsByAxis(currentQuestion.axis, axisQuestions));
  };

  const missing = useMemo(() => {
    if (!currentQuestion) return { ja: false, ko: false };
    return {
      ja:
        !currentQuestion.content.ja.trim() ||
        !currentQuestion.optionA.text.ja.trim() ||
        !currentQuestion.optionB.text.ja.trim(),
      ko:
        !currentQuestion.content.ko.trim() ||
        !currentQuestion.optionA.text.ko.trim() ||
        !currentQuestion.optionB.text.ko.trim(),
    };
  }, [currentQuestion]);

  // 一覧での位置（プレビューのN/40表示用）
  const positionInfo = useMemo(() => {
    if (!allQuestions || !currentQuestion) return { index: 1, total: 80 };
    const total = allQuestions.length;
    const index = allQuestions.findIndex((q) => q.id === questionId) + 1;
    return { index, total };
  }, [allQuestions, currentQuestion, questionId]);

  if (error) {
    return (
      <div className="p-8 max-w-md text-sm">
        <p className="font-medium text-red-700 mb-2">読み込みエラー</p>
        <p className="text-stone-600">{error}</p>
      </div>
    );
  }

  if (!allQuestions || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        読み込み中…
      </div>
    );
  }

  return (
    <EditorShell
      title={`${currentQuestion.id} - ${currentQuestion.axis}軸`}
      subtitle={currentQuestion.format}
      onBack={onBack}
      saveIndicator={<SourceSaveIndicator state={saveState} />}
      langTabs={<LangTabs value={lang} onChange={setLang} missing={missing} />}
      onPublish={handleSave}
      publishLabel={saveState.status === 'saving' ? '保存中…' : '保存'}
      publishDisabled={saveState.status === 'saving'}
      preview={
        <QuestionPreview
          question={currentQuestion}
          lang={lang}
          index={positionInfo.index}
          total={positionInfo.total}
        />
      }
    >
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">基本属性</h2>
        <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-4">
          <div>
            <p className="text-sm text-stone-700 mb-2">軸</p>
            <AxisSelector
              value={currentQuestion.axis}
              onChange={(axis: Axis) => updateCurrent({ axis })}
            />
          </div>
          <div>
            <p className="text-sm text-stone-700 mb-2">形式</p>
            <FormatSelector
              value={currentQuestion.format}
              onChange={(format) => updateCurrent({ format })}
            />
          </div>
          <div>
            <p className="text-sm text-stone-700 mb-2">難易度</p>
            <DifficultySelector
              value={currentQuestion.difficulty}
              onChange={(difficulty) => updateCurrent({ difficulty })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active-toggle"
              checked={currentQuestion.active}
              onChange={(e) => updateCurrent({ active: e.target.checked })}
              className="rounded border-stone-300"
            />
            <label htmlFor="active-toggle" className="text-sm text-stone-700">
              この問題を出題対象にする (active)
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">問題文</h2>
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <LocalizedField
            label="状況"
            value={currentQuestion.content}
            onChange={(content) => updateCurrent({ content })}
            lang={lang}
            kind="questionBody"
            multiline
            rows={3}
            hint="改行は \n（Enter）で表現。プレビューで両言語の見え方を確認できます。"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">選択肢</h2>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          回答カードは <span className="font-mono">14文字以内（日）/ 12文字以内（韓）</span> 推奨。物理的に崩れるため超過時は警告表示。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* A */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
            <div className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              選択肢 A
            </div>
            <LocalizedField
              label="本文"
              value={currentQuestion.optionA.text}
              onChange={(text) =>
                updateCurrent({
                  optionA: { ...currentQuestion.optionA, text },
                })
              }
              lang={lang}
              kind="answerCard"
            />
            <WeightSelector
              value={currentQuestion.optionA.weight}
              onChange={(w) =>
                updateCurrent({
                  optionA: { ...currentQuestion.optionA, weight: w },
                })
              }
              poleLabel={`${currentQuestion.axis} の寄与度`}
            />
          </div>

          {/* B */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
            <div className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              選択肢 B
            </div>
            <LocalizedField
              label="本文"
              value={currentQuestion.optionB.text}
              onChange={(text) =>
                updateCurrent({
                  optionB: { ...currentQuestion.optionB, text },
                })
              }
              lang={lang}
              kind="answerCard"
            />
            <WeightSelector
              value={currentQuestion.optionB.weight}
              onChange={(w) =>
                updateCurrent({
                  optionB: { ...currentQuestion.optionB, weight: w },
                })
              }
              poleLabel={`${currentQuestion.axis} の寄与度`}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">タグ</h2>
        <TagsEditor
          tags={currentQuestion.tags}
          onChange={(tags) => updateCurrent({ tags })}
        />
      </section>
    </EditorShell>
  );
}
```

### 2.7 形式・難易度・タグ用の小コンポーネント

`src/features/admin/questions/FormatSelector.tsx`（新規）

```tsx
import { cn } from '@/lib/utils';
import type { QuestionFormat } from '../shared/source-types';

const FORMATS: { value: QuestionFormat; label: string; description: string }[] = [
  { value: 'situation', label: 'situation', description: '状況提示型' },
  { value: 'binary', label: 'binary', description: '二択型' },
  { value: 'likert', label: 'likert', description: 'Likert 尺度' },
];

type Props = {
  value: QuestionFormat;
  onChange: (next: QuestionFormat) => void;
};

export function FormatSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {FORMATS.map((f) => {
        const selected = value === f.value;
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            className={cn(
              'rounded-lg border px-3 py-2 text-left text-xs transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
              selected
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300',
            )}
          >
            <div className="font-mono">{f.label}</div>
            <div className={cn('mt-0.5', selected ? 'text-stone-300' : 'text-stone-500')}>
              {f.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

`src/features/admin/questions/DifficultySelector.tsx`（新規）

```tsx
import { cn } from '@/lib/utils';
import type { QuestionDifficulty } from '../shared/source-types';

const DIFFICULTIES: { value: QuestionDifficulty; label: string }[] = [
  { value: 'easy', label: '簡単 (easy)' },
  { value: 'medium', label: '中間 (medium)' },
  { value: 'hard', label: '難しい (hard)' },
];

type Props = {
  value: QuestionDifficulty;
  onChange: (next: QuestionDifficulty) => void;
};

export function DifficultySelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {DIFFICULTIES.map((d) => {
        const selected = value === d.value;
        return (
          <button
            key={d.value}
            type="button"
            onClick={() => onChange(d.value)}
            className={cn(
              'rounded-lg border px-3 py-2 text-center text-xs transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
              selected
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300',
            )}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}
```

`src/features/admin/questions/TagsEditor.tsx`（新規）

```tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Props = {
  tags: string[];
  onChange: (next: string[]) => void;
};

export function TagsEditor({ tags, onChange }: Props) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...tags, trimmed]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-stone-400 hover:text-red-600"
              aria-label={`${tag} を削除`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-stone-400">タグなし</span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="新しいタグを入力して Enter（例: career）"
          className="text-sm"
        />
      </div>
    </div>
  );
}
```

### 2.8 問題プレビュー更新

`src/features/admin/questions/QuestionPreview.tsx` を `SourceQuestion` 対応に：

```tsx
import { SmartText } from '../shared/SmartText';
import type { Locale } from '../shared/types';
import type { SourceQuestion } from '../shared/source-types';

type Props = {
  question: SourceQuestion;
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
                {question.id.toUpperCase()}
              </div>
              <h2 className="font-serif text-[22px] leading-[1.5] text-stone-800 whitespace-pre-line">
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

---

### 2.9 一覧画面の改造

`src/features/admin/lists/TypeList.tsx` を `loadAllTypeMetas` ベースに変更：

```tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBadge } from './shared-list/ProgressBadge';
import { loadAllTypeMetas } from '../sources/type-source';
import type { SourceTypeMeta, MbtiType } from '../shared/source-types';

const GROUPS: { label: string; tagline: string; codes: MbtiType[] }[] = [
  { label: 'Analysts',   tagline: '光の探究者たち', codes: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] },
  { label: 'Diplomats',  tagline: '光を編む人たち', codes: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] },
  { label: 'Sentinels',  tagline: '光の番人たち',   codes: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] },
  { label: 'Explorers',  tagline: '光の踊り手たち', codes: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] },
];

function calcCompleteness(meta: SourceTypeMeta): { ja: number; ko: number } {
  const fields = [
    meta.name, meta.group, meta.tagline, meta.essence, meta.relationshipNote,
    ...meta.strengths,
  ];
  if (fields.length === 0) return { ja: 0, ko: 0 };
  const ja = fields.filter((f) => f.ja.trim()).length / fields.length;
  const ko = fields.filter((f) => f.ko.trim()).length / fields.length;
  return { ja, ko };
}

export function TypeList() {
  const navigate = useNavigate();
  const [metas, setMetas] = useState<SourceTypeMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAllTypeMetas()
      .then((m) => { if (!cancelled) setMetas(m); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); });
    return () => { cancelled = true; };
  }, []);

  const metaByCode = useMemo(() => {
    if (!metas) return new Map<MbtiType, SourceTypeMeta>();
    return new Map(metas.map((m) => [m.code, m]));
  }, [metas]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-serif text-stone-900">タイプ説明</h1>
        <p className="text-sm text-stone-500 mt-1">
          16タイプ × 多言語のキャラクター説明
        </p>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          読み込みエラー: {error}
        </div>
      )}

      {!metas && !error && (
        <div className="flex items-center justify-center py-12 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          読み込み中…
        </div>
      )}

      {metas && (
        <div className="space-y-8">
          {GROUPS.map((group) => (
            <section key={group.label}>
              <header className="mb-3">
                <h2 className="text-sm font-medium text-stone-700">{group.label}</h2>
                <p className="text-xs text-stone-400">{group.tagline}</p>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {group.codes.map((code) => {
                  const meta = metaByCode.get(code);
                  const completeness = meta ? calcCompleteness(meta) : { ja: 0, ko: 0 };
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => navigate(`/admin/types/${code}`)}
                      className={cn(
                        'group text-left rounded-lg border border-stone-200 bg-white p-4 transition',
                        'hover:border-stone-400 hover:shadow-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="font-mono text-sm font-medium text-stone-900">{code}</div>
                          <div className="text-xs text-stone-500 mt-0.5">
                            {meta?.name.ja ?? '—'}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 transition mt-0.5" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <ProgressBadge lang="ja" progress={completeness.ja} />
                        <ProgressBadge lang="ko" progress={completeness.ko} />
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

`src/features/admin/lists/QuestionList.tsx` も同様に `loadAllQuestions` ベースに変更（軸別フィルタは維持）：

```tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBadge } from './shared-list/ProgressBadge';
import { loadAllQuestions } from '../sources/question-source';
import type { SourceQuestion, Axis } from '../shared/source-types';

const AXES: (Axis | 'all')[] = ['all', 'EI', 'SN', 'TF', 'JP'];

function calcCompleteness(q: SourceQuestion): { ja: number; ko: number } {
  const fields = [q.content, q.optionA.text, q.optionB.text];
  const ja = fields.filter((f) => f.ja.trim()).length / fields.length;
  const ko = fields.filter((f) => f.ko.trim()).length / fields.length;
  return { ja, ko };
}

export function QuestionList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Axis | 'all'>('all');
  const [questions, setQuestions] = useState<SourceQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAllQuestions()
      .then((qs) => { if (!cancelled) setQuestions(qs); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!questions) return [];
    if (filter === 'all') return questions;
    return questions.filter((q) => q.axis === filter);
  }, [questions, filter]);

  const counts = useMemo(() => {
    const c: Record<Axis, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };
    questions?.forEach((q) => { c[q.axis]++; });
    return c;
  }, [questions]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-serif text-stone-900">問題</h1>
        <p className="text-sm text-stone-500 mt-1">
          {questions?.length ?? 0}問 / 各軸 20 問の問題プール
        </p>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          読み込みエラー: {error}
        </div>
      )}

      <div className="flex gap-1 rounded-lg border border-stone-200 bg-white p-1 w-fit">
        {AXES.map((axis) => {
          const active = filter === axis;
          const count = axis === 'all'
            ? questions?.length ?? 0
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

      {!questions && !error && (
        <div className="flex items-center justify-center py-12 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          読み込み中…
        </div>
      )}

      {questions && filtered.length > 0 && (
        <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
          {filtered.map((q, i) => {
            const completeness = calcCompleteness(q);
            const preview = q.content.ja || q.content.ko || '(未入力)';
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
                <span className="text-xs font-mono text-stone-400 w-12 tabular-nums shrink-0">
                  {q.id}
                </span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 shrink-0">
                  {q.axis}
                </span>
                <span className="flex-1 min-w-0 truncate text-sm text-stone-700">
                  {preview}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <ProgressBadge lang="ja" progress={completeness.ja} />
                  <ProgressBadge lang="ko" progress={completeness.ko} />
                  {!q.active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-600">
                      inactive
                    </span>
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

### 2.10 ルートとデバッグ画面の整理

`src/features/admin/routes.tsx` の修正：

1. **`debug/sources` ルートを削除**
2. `TypeEditorPage` の Props 型を `MbtiType` に変更（`TypeCode` から）

```tsx
// 修正前
<Route path="debug/sources" element={<SourceTest />} />

// 修正後（このルートを削除）
```

```tsx
// 修正前
function TypeEditorPage() {
  const { typeCode } = useParams();
  return <TypeEditor typeCode={(typeCode ?? 'INTJ') as TypeCode} ... />;
}

// 修正後
import type { MbtiType } from './shared/source-types';

function TypeEditorPage() {
  const { typeCode } = useParams();
  return <TypeEditor typeCode={(typeCode ?? 'INTJ') as MbtiType} ... />;
}
```

`SourceTest.tsx` ファイルは**削除**：

```powershell
Remove-Item src\features\admin\debug\SourceTest.tsx
```

`debug/` ディレクトリが空になったら削除してもよい。

---

### 2.11 IndexedDB 下書きのリセット

タイプ・問題エディタの下書きが IndexedDB に残っていると挙動がおかしくなる可能性があるので、**ユーザーに動作確認時にクリアを促す**。コードでの自動削除は不要（UI 文言用の下書きは消したくないため）。

---

## 3. 動作確認手順

### 3.1 ビルド確認

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

すべて 0 errors で通ること。

### 3.2 必ず Git コミット

```powershell
git add -A
git commit -m "checkpoint before Step 3 testing"
```

### 3.3 ブラウザ動作確認

ユーザーが行う：

#### 3.3.1 タイプ説明エディタ

1. `/admin/types` で 16 タイプ一覧が表示される
2. 各カードに翻訳完了率バッジ（日: 100% / 韓: 100%）が表示される
3. 「INTJ」をクリック → エディタが開く
4. タイプ名・グループ名・タグライン・エッセンス・強み配列・関係性ノートがすべて表示される
5. プレビュー（375px）で実機相当の見え方が確認できる
6. 適当な箇所を編集 → 「保存」ボタンクリック → 「保存しました」表示
7. PowerShell で `git diff src/data/types/` で実際にファイルが書き換わったか確認
8. ブラウザを更新しても編集内容が反映されていること

#### 3.3.2 問題エディタ

1. `/admin/questions` で 80 問一覧が表示される
2. 軸フィルタ（EI/SN/TF/JP）で絞り込めること
3. `ei-001` をクリック → エディタが開く
4. 問題文・選択肢・形式・難易度・タグ・active がすべて表示される
5. 選択肢のプレビューで SmartText による意味単位改行が確認できる
6. 適当な選択肢を 14 文字超に編集 → プレビューで改行を実機確認
7. 「保存」ボタン → 該当軸のファイルが書き換わる
8. `git diff src/data/questions/ei-pool.ja.ts` で確認

#### 3.3.3 UI 文言エディタ（既存・変更なし確認）

`/admin/ui-strings/edit` を開き、これまで通り Firestore 公開フローが動作すること。**Step 3 で UI 文言エディタは触っていない**ので、回帰がないことの確認のみ。

#### 3.3.4 問題ページの実機確認（本来の目的）

1. 通常のユーザーフロー（`/` などのトップページ）から診断を開始
2. スクショで問題だった `ei-003`「自分が間違っていたと気づいたとき」を待つ
3. 回答カードに「立つ」「る」の孤立改行が出るか確認
4. 出たら、エディタで該当問題を開いて修正 → 保存 → リロードして再確認

### 3.4 デバッグ画面が消えていることを確認

`/admin/debug/sources` にアクセス → 404 か、ルート無しで一覧画面にリダイレクトされること。

---

## 4. 注意事項

### 4.1 保存時の HMR 挙動

`.ts` ファイルが書き換わると Vite の HMR が発火してページがリロードされる可能性がある。エディタは編集中の状態を IndexedDB に持たないので、保存ボタンを押した後にリロードされても編集内容は失われない（ファイルから再読み込みされるため）。

ただし、**保存ボタンを押す前にリロードされると編集が失われる**ので、注意喚起が必要。今回の実装では特別なガードは入れない（明示的保存ボタンなのでユーザーは意識して操作するはず）。

### 4.2 軸の変更について

問題エディタで `axis` を変更した場合、その問題は新しい軸のファイルに移動する必要がある。しかし、現実装では「現在の `axis` の軸ファイルを書き戻す」のみで、移動は行わない。これは MVP 段階では仕様として割り切る（軸変更は稀なはず）。

将来必要になったら、`saveQuestionsByAxis` を改修して両軸ファイルを書き戻すロジックに拡張する。

### 4.3 既存 Firestore データの扱い

これまで UI 文言で公開した Firestore のドキュメント（`content_published/ui_strings/items/main` 等）はそのまま残る。タイプ・問題は今後 Firestore に書き込まれない。**過去にテストで Firestore に書き込んだタイプ/問題のドキュメントがあれば**、Firebase Console から手動削除しても良い（必須ではない）。

---

## 5. 報告事項

### 新規ファイル
- [ ] `src/features/admin/sources/use-source-save.ts`
- [ ] `src/features/admin/types/StrengthsList.tsx`
- [ ] `src/features/admin/questions/FormatSelector.tsx`
- [ ] `src/features/admin/questions/DifficultySelector.tsx`
- [ ] `src/features/admin/questions/TagsEditor.tsx`

### 改造ファイル
- [ ] `src/features/admin/editor/SaveIndicator.tsx`（`SourceSaveIndicator` 追加）
- [ ] `src/features/admin/types/TypeEditor.tsx`（全面改造）
- [ ] `src/features/admin/types/TypePreview.tsx`（SourceTypeMeta 対応）
- [ ] `src/features/admin/questions/QuestionEditor.tsx`（全面改造）
- [ ] `src/features/admin/questions/QuestionPreview.tsx`（SourceQuestion 対応）
- [ ] `src/features/admin/lists/TypeList.tsx`（loadAllTypeMetas 化）
- [ ] `src/features/admin/lists/QuestionList.tsx`（loadAllQuestions 化）
- [ ] `src/features/admin/routes.tsx`（debug ルート削除、MbtiType 型修正）

### 削除ファイル
- [ ] `src/features/admin/debug/SourceTest.tsx`

### 検証
- [ ] `pnpm typecheck` 成功
- [ ] `pnpm lint` 成功
- [ ] `pnpm build` 成功
- [ ] `dist` に `__admin` 文字列が含まれないこと

ユーザーが行う動作確認:
1. /admin/types で一覧 → INTJ 編集 → 保存 → git diff で確認
2. /admin/questions で一覧 → ei-001 編集 → 保存 → git diff で確認
3. /admin/ui-strings/edit が引き続き動くこと（回帰テスト）
4. /admin/debug/sources が消えていること

---

**End of Document**
