import {
  doc, getDoc, setDoc, collection, addDoc, serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type {
  ContentType, TypeDescription, Question, UiStrings,
} from '../shared/types';

export type PublishedContent = TypeDescription | Question | UiStrings;

const COLLECTION_PATHS: Record<ContentType, string> = {
  type: 'content_published/types/items',
  question: 'content_published/questions/items',
  'ui-strings': 'content_published/ui_strings/items',
};

const HISTORY_PATH = 'content_history';

export class ContentStore {
  constructor(private db: Firestore, private currentUserId: string) {}

  async getPublished<T extends PublishedContent>(
    contentType: ContentType,
    contentId: string,
  ): Promise<T | null> {
    const ref = doc(this.db, COLLECTION_PATHS[contentType], contentId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as T) : null;
  }

  async publish<T extends PublishedContent>(
    contentType: ContentType,
    contentId: string,
    data: T,
    options?: { changeNote?: string },
  ): Promise<void> {
    const ref = doc(this.db, COLLECTION_PATHS[contentType], contentId);
    const before = await this.getPublished<T>(contentType, contentId);

    await setDoc(ref, {
      ...data,
      _meta: {
        publishedAt: serverTimestamp(),
        publishedBy: this.currentUserId,
      },
    });

    const historyRef = collection(
      this.db,
      `${HISTORY_PATH}/${contentType}/${contentId}`,
    );
    await addDoc(historyRef, {
      before,
      after: data,
      changeNote: options?.changeNote ?? '',
      changedAt: serverTimestamp(),
      changedBy: this.currentUserId,
    });
  }
}
