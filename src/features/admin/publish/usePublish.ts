import { useCallback, useState } from 'react';
import type { Firestore } from 'firebase/firestore';
import { ContentStore, type PublishedContent } from './firestore-store';
import { deleteDraft } from '../shared/draft-store';
import type { ContentType } from '../shared/types';

type Options = {
  db: Firestore;
  userId: string;
  contentType: ContentType;
  contentId: string;
  onPublished?: () => void;
};

export function usePublish<T extends PublishedContent>(options: Options) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<T | null>(null);

  const store = new ContentStore(options.db, options.userId);

  const open = useCallback((data: T) => {
    setDraft(data);
    setDialogOpen(true);
  }, []);

  const close = useCallback(() => {
    setDialogOpen(false);
    setDraft(null);
  }, []);

  const fetchPublished = useCallback(
    () => store.getPublished<T>(options.contentType, options.contentId) as Promise<T | null>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.contentType, options.contentId],
  );

  const publish = useCallback(async (changeNote: string) => {
    if (!draft) throw new Error('下書きがありません');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await store.publish(options.contentType, options.contentId, draft as any, { changeNote });
    await deleteDraft(options.contentType, options.contentId);
    options.onPublished?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, options.contentType, options.contentId]);

  return {
    dialogOpen,
    draft,
    open,
    close,
    fetchPublished,
    publish,
  };
}
