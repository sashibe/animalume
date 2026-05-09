import { openDB, type IDBPDatabase } from 'idb';
import type { ContentType, DraftRecord } from './types';

const DB_NAME = 'animalume-admin';
const DB_VERSION = 1;
const STORE = 'drafts';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, {
            keyPath: ['contentType', 'contentId'],
          });
          store.createIndex('updatedAt', 'updatedAt');
          store.createIndex('contentType', 'contentType');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveDraft<T>(record: DraftRecord<T>): Promise<void> {
  const db = await getDB();
  await db.put(STORE, { ...record, updatedAt: Date.now() });
}

export async function getDraft<T>(
  contentType: ContentType,
  contentId: string,
): Promise<DraftRecord<T> | undefined> {
  const db = await getDB();
  return db.get(STORE, [contentType, contentId]);
}

export async function listDraftsByType(
  contentType: ContentType,
): Promise<DraftRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE, 'contentType', contentType);
}

export async function listAllDrafts(): Promise<DraftRecord[]> {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function deleteDraft(
  contentType: ContentType,
  contentId: string,
): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, [contentType, contentId]);
}
