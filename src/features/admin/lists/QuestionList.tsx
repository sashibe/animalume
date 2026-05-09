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
          {filtered.map((q) => {
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
