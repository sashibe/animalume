import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import i18n from '@/lib/i18n';
import { db, ensureAnonymousAuth } from '@/lib/firebase';
import type { DiagnosisResult, Answer } from '../logic/types';

export async function saveResult(
  result: DiagnosisResult,
  answers: Answer[],
  questionIds: string[],
  durationSec: number,
): Promise<string | null> {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    return null;
  }

  try {
    const user = await ensureAnonymousAuth();
    const locale = i18n.language.startsWith('ko') ? 'ko' : 'ja';

    const docRef = await addDoc(collection(db, 'results'), {
      userId: user.uid,
      takenAt: serverTimestamp(),
      locale,
      type: result.type,
      scores: result.scores,
      strengths: result.strengths,
      confidence: result.confidence,
      duration: durationSec,
      quality: { flagged: false },
      answers: answers.map((a) => ({
        questionId: a.questionId,
        axis: a.axis,
        selectedOption: a.selectedOption,
        weight: a.weight,
        responseTimeMs: a.responseTimeMs,
      })),
      questionIds,
    });

    return docRef.id;
  } catch {
    return null;
  }
}
