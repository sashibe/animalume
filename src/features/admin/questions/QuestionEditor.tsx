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
        contentLabel={`問題 ${String(index).padStart(2, '0')} - ${data.axis}`}
        draft={pub.draft as Question}
        fetchPublished={pub.fetchPublished}
        onPublish={pub.publish}
        onClose={pub.close}
      />
    </>
  );
}
