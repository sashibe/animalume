import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Props = {
  tags: string[];
  onChange: (next: string[]) => void;
};

export function TagsEditor({ tags, onChange }: Props) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...tags, trimmed]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-stone-400 hover:text-red-600"
              aria-label={`${tag} を削除`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-stone-400">タグなし</span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="新しいタグを入力して Enter（例: career）"
          className="text-sm"
        />
      </div>
    </div>
  );
}
