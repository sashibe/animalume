import {
  DndContext, type DragEndEvent, KeyboardSensor, PointerSensor,
  closestCenter, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopicCard } from './TopicCard';
import { addTopic, removeTopic, reorderTopics, updateTopic } from './topic-helpers';
import type { Locale, TypeTopic } from '../shared/types';

type Props = {
  topics: TypeTopic[];
  lang: Locale;
  onChange: (next: TypeTopic[]) => void;
};

export function TopicList({ topics, lang, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onChange(reorderTopics(topics, String(active.id), String(over.id)));
  };

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={topics.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {topics.map((topic, i) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                index={i}
                lang={lang}
                onChange={(next) => onChange(updateTopic(topics, topic.id, next))}
                onDelete={() => onChange(removeTopic(topics, topic.id))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {topics.length === 0 && (
        <div className="text-center py-8 text-sm text-stone-500 border border-dashed border-stone-200 rounded-lg">
          まだトピックがありません
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => onChange(addTopic(topics))}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        トピックを追加
      </Button>
    </div>
  );
}
