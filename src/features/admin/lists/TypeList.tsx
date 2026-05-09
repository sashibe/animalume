import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBadge } from './shared-list/ProgressBadge';
import { loadAllTypeMetas } from '../sources/type-source';
import type { SourceTypeMeta, MbtiType } from '../shared/source-types';

const GROUPS: { label: string; tagline: string; codes: MbtiType[] }[] = [
  { label: 'Analysts',  tagline: '光の探究者たち', codes: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] },
  { label: 'Diplomats', tagline: '光を編む人たち', codes: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] },
  { label: 'Sentinels', tagline: '光の番人たち',   codes: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] },
  { label: 'Explorers', tagline: '光の踊り手たち', codes: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] },
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
