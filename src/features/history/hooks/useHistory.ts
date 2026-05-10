import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { MbtiType, AxisScores } from '@/features/diagnosis/logic/types';

export interface HistoryItem {
  resultId: string;
  type: MbtiType;
  scores: AxisScores;
  strengths: AxisScores;
  confidence: number;
  takenAt: Date;
  readingNumber: number;
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'results'),
      where('userId', '==', user.uid),
      orderBy('takenAt', 'desc'),
    );

    getDocs(q)
      .then((snap) => {
        const results = snap.docs.map((d, idx) => {
          const data = d.data();
          return {
            resultId: d.id,
            type: data.type as MbtiType,
            scores: data.scores as AxisScores,
            strengths: data.strengths as AxisScores,
            confidence: data.confidence as number,
            takenAt: (data.takenAt as { toDate(): Date }).toDate(),
            // 最古を No.1 として降順配列から逆算
            readingNumber: snap.size - idx,
          } satisfies HistoryItem;
        });
        setItems(results);
      })
      .catch((e: Error) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}

/** ホーム画面用: limit(1) で履歴の有無だけ確認 */
export function useHasHistory() {
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'results'),
      where('userId', '==', user.uid),
      limit(1),
    );

    getDocs(q)
      .then((snap) => setHasHistory(!snap.empty))
      .catch(() => {});
  }, []);

  return hasHistory;
}
