import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
// useAuth() を再利用して onAuthStateChanged の購読を共有する（DRY）
// auth.currentUser の同期参照は SDK の非同期セッション復元完了前に null を返すため使わない
import { useAuth } from '@/lib/auth';
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
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // auth 復元中は待機（loading:true のまま）
    if (authLoading) return;

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
  }, [user, authLoading]);

  return { items, loading, error };
}

/** 比較ビュー用: 最新2件を返す */
export function useComparison(): {
  current: HistoryItem | null;
  previous: HistoryItem | null;
  loading: boolean;
} {
  const { items, loading } = useHistory();

  if (loading || items.length < 2) {
    return { current: null, previous: null, loading };
  }

  return {
    current: items[0],  // 最新（降順1番目）
    previous: items[1], // 1つ前
    loading: false,
  };
}

/** ホーム画面用: limit(1) で履歴の有無だけ確認 */
export function useHasHistory() {
  const { user, loading: authLoading } = useAuth();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    const q = query(
      collection(db, 'results'),
      where('userId', '==', user.uid),
      limit(1),
    );

    getDocs(q)
      .then((snap) => setHasHistory(!snap.empty))
      .catch(() => {});
  }, [user, authLoading]);

  return hasHistory;
}
