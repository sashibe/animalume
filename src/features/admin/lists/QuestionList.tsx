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
