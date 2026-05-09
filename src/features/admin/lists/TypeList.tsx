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
