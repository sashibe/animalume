import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [signInLoading, setSignInLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/admin';

  const handleGoogleLogin = async () => {
    setError(null);
    setSignInLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);

      const tokenResult = await result.user.getIdTokenResult(true);
      const role = (tokenResult.claims as { role?: string }).role;

      if (role !== 'admin') {
        await signOut(auth);
        setError(
          'このアカウントには管理者権限がありません。管理者からの権限付与が必要です。',
        );
        return;
      }

      navigate(redirectTo, { replace: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'ログインに失敗しました';
      if (
        typeof message === 'string' &&
        (message.includes('popup-closed-by-user') ||
          message.includes('cancelled-popup-request'))
      ) {
        return;
      }
      setError(message);
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setError(null);
  };

  const isAuthenticatedNonAnonymous = user && !user.isAnonymous;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        読み込み中…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="font-serif text-2xl text-stone-900">Animalume</h1>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
            Admin
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {isAuthenticatedNonAnonymous ? (
            <>
              <div className="text-sm text-stone-700 space-y-1">
                <p>現在のログイン:</p>
                <p className="font-mono text-xs text-stone-500 break-all">
                  {user.email ?? user.uid}
                </p>
              </div>
              <p className="text-xs text-stone-500">
                権限が付与されていないか、別のアカウントでログインしてください。
              </p>
              <div className="space-y-2">
                <Button
                  onClick={handleGoogleLogin}
                  disabled={signInLoading}
                  className="w-full"
                >
                  {signInLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      確認中…
                    </>
                  ) : (
                    '別のアカウントでログイン'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  disabled={signInLoading}
                  className="w-full"
                >
                  ログアウト
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-stone-600 leading-relaxed">
                管理画面にアクセスするには Google アカウントでログインしてください。
              </p>
              <Button
                onClick={handleGoogleLogin}
                disabled={signInLoading}
                className="w-full"
              >
                {signInLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ログイン中…
                  </>
                ) : (
                  'Google でログイン'
                )}
              </Button>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-stone-400">
          管理者権限の付与は別途必要です
        </p>
      </div>
    </div>
  );
}
