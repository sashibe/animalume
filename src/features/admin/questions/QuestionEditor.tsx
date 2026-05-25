import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
              multiline
              rows={3}
              hint="改行は \n（Enter）で表現。プレビューで実機の見え方を確認できます。"
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
              multiline
              rows={3}
              hint="改行は \n（Enter）で表現。プレビューで実機の見え方を確認できます。"
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
