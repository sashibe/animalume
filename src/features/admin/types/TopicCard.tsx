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
