import { useEffect, useMemo, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DiffView } from './DiffView';
import { diffLocalizedTree, summarize } from './diff';
type Props<T> = {
  open: boolean;
  contentLabel: string;
  draft: T;
  fetchPublished: () => Promise<T | null>;
  onPublish: (changeNote: string) => Promise<void>;
  onClose: () => void;
};

type Phase = 'loading' | 'review' | 'publishing' | 'done' | 'error';

export function PublishDialog<T>({
  open, contentLabel,
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
