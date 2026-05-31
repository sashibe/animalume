import {
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
  signInWithCredential,
  type AuthProvider,
  type AuthError,
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
  let uid: string;

  try {
    const result = user.isAnonymous
      ? await linkWithPopup(user, authProvider)    // 匿名 → ソーシャル昇格
      : await signInWithPopup(auth, authProvider); // 既ログイン → 追加連携
    uid = result.user.uid;
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;

    // credential-already-in-use:
    //   同じ Google アカウントが過去の匿名セッションに既に紐付け済み。
    //   エラーを出すのではなく、そのクレデンシャルで既存アカウントに自動サインインする。
    if (code === 'auth/credential-already-in-use') {
      const credential = GoogleAuthProvider.credentialFromError(e as AuthError);
      if (!credential) throw e; // credential が取れない場合は上位に伝播
      const result = await signInWithCredential(auth, credential);
      uid = result.user.uid;
    } else {
      throw e; // popup-closed / operation-not-allowed 等は呼び出し元に伝播
    }
  }

  await setDoc(
    doc(db, 'users', uid),
    {
      isAnonymous: false,
      linkedProviders: arrayUnion(provider),
      lastActiveAt: serverTimestamp(),
    },
    { merge: true },
  );
}
