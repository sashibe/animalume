import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type Props = {
  children: ReactNode;
  loginPath?: string;
};

export function AdminGate({ children, loginPath = '/admin/login' }: Props) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.isAnonymous) {
      setIsAdmin(false);
      return;
    }
    user
      .getIdTokenResult()
      .then((result) => {
        const role = (result.claims as { role?: string }).role;
        setIsAdmin(role === 'admin');
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, [user, authLoading]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        認証確認中…
      </div>
    );
  }

  if (!user || user.isAnonymous) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-lg font-medium text-stone-800">
            アクセス権限がありません
          </h1>
          <p className="text-sm text-stone-500">
            このアカウント（{user.email ?? user.uid}）には
            管理者権限が付与されていません。
          </p>
          <p className="text-xs text-stone-400">
            別のアカウントでログインするには{' '}
            <a
              href={loginPath}
              className="underline hover:text-stone-600"
            >
              ログイン画面
            </a>
            へ。
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
