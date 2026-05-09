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
