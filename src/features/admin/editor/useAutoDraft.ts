import { useEffect, useRef } from 'react';
import { saveDraft, getDraft } from '../shared/draft-store';
import type { ContentType } from '../shared/types';

type Options = {
  debounceMs?: number;
  enabled?: boolean;
  onSaved?: () => void;
};

export function useAutoDraft<T>(
  contentType: ContentType,
  contentId: string,
  data: T,
  options: Options = {},
) {
  const { debounceMs = 1000, enabled = true, onSaved } = options;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string>('');

  // onSaved は ref で保持して依存配列から外す
  const onSavedRef = useRef(onSaved);
  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  useEffect(() => {
    if (!enabled) return;
    const serialized = JSON.stringify(data);
    if (serialized === lastSaved.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await saveDraft({ contentType, contentId, data, updatedAt: Date.now() });
        lastSaved.current = serialized;
        onSavedRef.current?.();
      } catch (error) {
        console.error('[useAutoDraft] saveDraft failed:', error);
      }
    }, debounceMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [contentType, contentId, data, debounceMs, enabled]);
}

export async function loadDraftOrFallback<T>(
  contentType: ContentType,
  contentId: string,
  fallback: T,
): Promise<T> {
  const record = await getDraft<T>(contentType, contentId);
  return record?.data ?? fallback;
}
