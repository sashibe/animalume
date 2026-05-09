import type { TypeTopic, Localized } from '../shared/types';

const emptyLoc = (): Localized => ({ ja: '', ko: '' });

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function newTopic(): TypeTopic {
  return { id: generateId(), heading: emptyLoc(), body: emptyLoc() };
}

export function addTopic(topics: TypeTopic[]): TypeTopic[] {
  return [...topics, newTopic()];
}

export function removeTopic(topics: TypeTopic[], id: string): TypeTopic[] {
  return topics.filter(t => t.id !== id);
}

export function updateTopic(
  topics: TypeTopic[],
  id: string,
  patch: Partial<TypeTopic>,
): TypeTopic[] {
  return topics.map(t => (t.id === id ? { ...t, ...patch } : t));
}

export function reorderTopics(
  topics: TypeTopic[],
  fromId: string,
  toId: string,
): TypeTopic[] {
  const fromIdx = topics.findIndex(t => t.id === fromId);
  const toIdx = topics.findIndex(t => t.id === toId);
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return topics;
  const next = [...topics];
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);
  return next;
}
