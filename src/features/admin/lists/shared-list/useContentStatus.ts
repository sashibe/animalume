import { useEffect, useState } from 'react';
import type { Firestore } from 'firebase/firestore';
import { ContentStore } from '../../publish/firestore-store';
import { listDraftsByType } from '../../shared/draft-store';
import { flatten as flattenStrings } from '../../ui-strings/string-helpers';
import type {
  TypeDescription, Question, UiStrings, Locale, Localized,
} from '../../shared/types';

export type ContentStatus = {
  contentId: string;
  hasPublished: boolean;
  hasDraft: boolean;
  progress: Record<Locale, number>;
};

function calcProgress(values: Localized[], lang: Locale): number {
  if (values.length === 0) return 0;
  const filled = values.filter(v => v[lang]?.trim()).length;
  return filled / values.length;
}

function collectTypeFields(d: TypeDescription | null): Localized[] {
  if (!d) return [];
  return [
    d.tagline,
    ...d.topics.flatMap(t => [t.heading, t.body]),
  ];
}

function collectQuestionFields(q: Question | null): Localized[] {
  if (!q) return [];
  return [q.content, q.optionA.text, q.optionB.text];
}

function collectUiStringFields(s: UiStrings | null): Localized[] {
  if (!s) return [];
  return flattenStrings(s).map(e => e.value);
}

export function useTypeStatuses(db: Firestore, userId: string, typeCodes: readonly string[]) {
  const [statuses, setStatuses] = useState<Record<string, ContentStatus>>({});
  const [loading, setLoading] = useState(true);
  const typeCodesKey = typeCodes.join(',');

  useEffect(() => {
    let cancelled = false;
    const store = new ContentStore(db, userId);

    (async () => {
      setLoading(true);
      const drafts = await listDraftsByType('type');
      const draftMap = new Map(drafts.map(d => [d.contentId, d.data as TypeDescription]));

      const entries = await Promise.all(
        typeCodes.map(async (code) => {
          const published = await store.getPublished<TypeDescription>('type', code);
          const draft = draftMap.get(code) ?? null;
          const source = draft ?? published;
          const fields = collectTypeFields(source);
          return [code, {
            contentId: code,
            hasPublished: !!published,
            hasDraft: !!draft,
            progress: {
              ja: calcProgress(fields, 'ja'),
              ko: calcProgress(fields, 'ko'),
            },
          }] as const;
        })
      );

      if (!cancelled) {
        setStatuses(Object.fromEntries(entries));
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, userId, typeCodesKey]);

  return { statuses, loading };
}

export function useQuestionStatuses(db: Firestore, userId: string, questionIds: readonly string[]) {
  const [statuses, setStatuses] = useState<Record<string, ContentStatus>>({});
  const [loading, setLoading] = useState(true);
  const questionIdsKey = questionIds.join(',');

  useEffect(() => {
    let cancelled = false;
    const store = new ContentStore(db, userId);

    (async () => {
      setLoading(true);
      const drafts = await listDraftsByType('question');
      const draftMap = new Map(drafts.map(d => [d.contentId, d.data as Question]));

      const entries = await Promise.all(
        questionIds.map(async (id) => {
          const published = await store.getPublished<Question>('question', id);
          const draft = draftMap.get(id) ?? null;
          const source = draft ?? published;
          const fields = collectQuestionFields(source);
          return [id, {
            contentId: id,
            hasPublished: !!published,
            hasDraft: !!draft,
            progress: {
              ja: calcProgress(fields, 'ja'),
              ko: calcProgress(fields, 'ko'),
            },
          }] as const;
        })
      );

      if (!cancelled) {
        setStatuses(Object.fromEntries(entries));
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, userId, questionIdsKey]);

  return { statuses, loading };
}

export function useUiStringsStatus(db: Firestore, userId: string) {
  const [status, setStatus] = useState<ContentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const store = new ContentStore(db, userId);

    (async () => {
      setLoading(true);
      const drafts = await listDraftsByType('ui-strings');
      const draft = drafts.find(d => d.contentId === 'main')?.data as UiStrings | undefined;
      const published = await store.getPublished<UiStrings>('ui-strings', 'main');
      const source = draft ?? published;
      const fields = collectUiStringFields(source ?? null);

      if (!cancelled) {
        setStatus({
          contentId: 'main',
          hasPublished: !!published,
          hasDraft: !!draft,
          progress: {
            ja: calcProgress(fields, 'ja'),
            ko: calcProgress(fields, 'ko'),
          },
        });
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [db, userId]);

  return { status, loading };
}
