import { useCallback, useState } from 'react';
import { TsStoreError } from '../shared/ts-store';

export type SaveState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'saved'; at: number }
  | { status: 'error'; message: string };

export function useSourceSave() {
  const [state, setState] = useState<SaveState>({ status: 'idle' });

  const save = useCallback(async (saver: () => Promise<void>) => {
    setState({ status: 'saving' });
    try {
      await saver();
      setState({ status: 'saved', at: Date.now() });
      window.setTimeout(() => {
        setState((prev) => (prev.status === 'saved' ? { status: 'idle' } : prev));
      }, 3000);
    } catch (e) {
      const message =
        e instanceof TsStoreError
          ? `保存失敗 (${e.status}): ${e.message}`
          : e instanceof Error
            ? e.message
            : '保存失敗';
      setState({ status: 'error', message });
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, save, reset };
}
