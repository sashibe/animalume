import {
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
  type AuthProvider,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Phase 3.0.1 で 'apple' | 'facebook' を追加予定
// Phase 5 で 'line' | 'kakao' を追加予定（Cloud Functions + Custom Token 経由）
export type SocialProvider = 'google';

function getProvider(provider: SocialProvider): AuthProvider {
  switch (provider) {
    case 'google':
      return new GoogleAuthProvider();
    // case 'apple': Phase 3.0.1
    // case 'facebook': Phase 3.0.1
  }
}

export async function linkSocialProvider(provider: SocialProvider): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No current user');

  const authProvider = getProvider(provider);
  const result = user.isAnonymous
    ? await linkWithPopup(user, authProvider)   // 匿名→ソーシャル昇格
    : await signInWithPopup(auth, authProvider); // 既ログイン→追加連携

  await setDoc(
    doc(db, 'users', result.user.uid),
    {
      isAnonymous: false,
      linkedProviders: arrayUnion(provider),
      lastActiveAt: serverTimestamp(),
    },
    { merge: true },
  );
}
