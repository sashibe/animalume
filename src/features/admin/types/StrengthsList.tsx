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
