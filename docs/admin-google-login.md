# 管理画面 Google ログイン実装指示書

> 前提: `docs/admin-editor-implementation.md` の実装が完了し、`/admin` 配下のエディタが動く状態。`AdminGate` が未ログインユーザーを `/login` にリダイレクトするが、`/login` 画面がまだ存在しない。

## 0. ゴール

1. **管理者用のログイン画面**を作る（`/admin/login`）
2. **Google ログイン**で本登録できるようにする
3. ログイン済みかつ admin クレーム付きのユーザーのみ `/admin` 配下にアクセス可能
4. 既存の匿名認証（一般ユーザー向け）は壊さない

---

## 1. 設計方針

### 1.1 既存の匿名認証との関係

CLAUDE.md §5.2 の通り、Animalume は一般ユーザーには匿名認証を使い、後からソーシャル連携でアップグレードする方針。**管理画面はこのフローと分離**する：

- 一般ユーザー: 診断画面で自動的に匿名サインイン → 後にアップグレード
- 管理者: `/admin/login` で **明示的に Google ログイン** → admin クレーム判定

### 1.2 ログインパスを `/admin/login` にする理由

`/login` だと一般ユーザーのソーシャル連携画面と紛らわしい。**管理者ログインは管理画面の一部**なので `/admin/login` 配下に置く。`AdminGate` の `loginPath` プロパティを `/admin/login` に変更する。

### 1.3 既に匿名サインイン済みの場合の扱い

ユーザーが `/admin/login` にアクセスした時点で既に**匿名サインイン状態の可能性が高い**（Animalume のトップページなどで自動的に匿名サインインが走るため）。Google ログインで上書きしても匿名アカウントは別エンティティとして残るが、admin 判定は「現在ログイン中のアカウント」のクレームで行うので問題なし。

---

## 2. 前提確認

実装着手前に以下を確認：

### 2.1 Firebase Console 側の準備（人間側のタスク）

これは Claude Code が直接できないため、**実装完了後にユーザーに依頼する手順**として指示書末尾に明記する。

- [ ] Firebase Console → Authentication → ログイン方法 → Google を有効化
- [ ] サポートメールを設定して保存

Claude Code はこれらが既に完了している前提でコード実装する。完了していない場合は実装後の動作確認時にエラーになる旨を伝える。

### 2.2 既存ファイルの確認

```bash
# 既存の Firebase 初期化を確認
cat src/lib/firebase.ts

# 既存の auth フックを確認
cat src/lib/auth.ts

# AdminGate の loginPath を確認
cat src/features/admin/auth/AdminGate.tsx | grep loginPath
```

`src/lib/firebase.ts` から `auth` がエクスポートされていること、`useAuth()` が `user` と `loading` を返すことを確認。

---

## 3. 実装

### 3.1 `src/features/admin/auth/AdminLogin.tsx` を新規作成

```tsx
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

/**
 * 管理者ログイン画面。
 * Google ログインを行い、role: 'admin' クレームを持つユーザーのみ /admin に進める。
 */
export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [signInLoading, setSignInLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ログイン後の遷移先（state.from があれば優先、なければ /admin）
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/admin';

  const handleGoogleLogin = async () => {
    setError(null);
    setSignInLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // 毎回アカウント選択を促す（ブラウザに保存された別アカウントで誤ログインを防ぐ）
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);

      // admin クレーム確認（force refresh で最新トークンを取得）
      const tokenResult = await result.user.getIdTokenResult(true);
      const role = (tokenResult.claims as { role?: string }).role;

      if (role !== 'admin') {
        // 管理者でなければサインアウトしてエラー表示
        await signOut(auth);
        setError(
          'このアカウントには管理者権限がありません。管理者からの権限付与が必要です。',
        );
        return;
      }

      navigate(redirectTo, { replace: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'ログインに失敗しました';
      // ユーザーがポップアップを閉じた場合はエラー表示しない
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

  // 既にログイン済みかつ匿名でない場合は admin 判定して遷移
  // （匿名ユーザーはログイン状態ではあるがここでは「未ログイン扱い」とする）
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
```

### 3.2 `src/features/admin/auth/AdminGate.tsx` を修正

既存の `AdminGate.tsx` を以下に置き換える。変更点：

- `loginPath` のデフォルトを `/admin/login` に変更
- 匿名ユーザーは「未ログイン扱い」にしてログイン画面へ誘導
- リダイレクト時に元の URL を `state.from` で渡す（ログイン後に元のページへ戻れるように）

```tsx
import { useEffect, useState, ReactNode } from 'react';
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
    // 匿名ユーザーは admin になり得ないので未ログイン扱い
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
```

### 3.3 `src/features/admin/routes.tsx` を修正

`/admin/login` ルートを追加。**重要**: ログイン画面は `AdminGate` の外に配置すること（ガード内に置くと無限リダイレクトする）。

修正前後の構造：

```tsx
// 修正前: AdminGate が全ルートをラップ
<AdminGate>
  <Routes>...</Routes>
</AdminGate>

// 修正後: /login だけ AdminGate の外、それ以外は中
<Routes>
  <Route path="login" element={<AdminLogin />} />
  <Route path="*" element={
    <AdminGate>
      <Routes>...</Routes>
    </AdminGate>
  } />
</Routes>
```

ファイル全体：

```tsx
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { AdminGate } from './auth/AdminGate';
import { AdminLogin } from './auth/AdminLogin';
import { AdminShell, AdminListContainer } from './layout/AdminShell';
import { TypeList } from './lists/TypeList';
import { QuestionList } from './lists/QuestionList';
import { UiStringsList } from './lists/UiStringsList';
import { TypeEditor } from './types/TypeEditor';
import { QuestionEditor } from './questions/QuestionEditor';
import { UiStringsEditor } from './ui-strings/UiStringsEditor';
import type { TypeCode } from './shared/types';

export function AdminRoutes() {
  return (
    <Routes>
      {/* ログイン画面はガードの外側 */}
      <Route path="login" element={<AdminLogin />} />

      {/* それ以外は AdminGate 配下 */}
      <Route path="*" element={<GuardedRoutes />} />
    </Routes>
  );
}

function GuardedRoutes() {
  return (
    <AdminGate>
      <Routes>
        <Route element={<AdminShell />}>
          <Route index element={<TypeListPage />} />
          <Route path="types" element={<TypeListPage />} />
          <Route path="questions" element={<QuestionListPage />} />
          <Route path="ui-strings" element={<UiStringsListPage />} />
          <Route path="types/:typeCode" element={<TypeEditorPage />} />
          <Route path="questions/:questionId" element={<QuestionEditorPage />} />
          <Route path="ui-strings/edit" element={<UiStringsEditorPage />} />
        </Route>
      </Routes>
    </AdminGate>
  );
}

function TypeListPage() {
  return (
    <AdminListContainer>
      <TypeList />
    </AdminListContainer>
  );
}
function QuestionListPage() {
  return (
    <AdminListContainer>
      <QuestionList />
    </AdminListContainer>
  );
}
function UiStringsListPage() {
  return (
    <AdminListContainer>
      <UiStringsList />
    </AdminListContainer>
  );
}

function TypeEditorPage() {
  const { typeCode } = useParams();
  const navigate = useNavigate();
  return (
    <TypeEditor
      typeCode={(typeCode ?? 'INTJ') as TypeCode}
      onBack={() => navigate('/admin/types')}
    />
  );
}

function QuestionEditorPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  return (
    <QuestionEditor
      questionId={questionId ?? ''}
      onBack={() => navigate('/admin/questions')}
    />
  );
}

function UiStringsEditorPage() {
  const navigate = useNavigate();
  return (
    <UiStringsEditor onBack={() => navigate('/admin/ui-strings')} />
  );
}
```

### 3.4 `AdminSidebar` にログアウトボタンを追加

`src/features/admin/layout/AdminSidebar.tsx` を以下に置き換え。サイドバー下部に現在のユーザーとログアウトボタンを配置：

```tsx
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, HelpCircle, Type, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

const ITEMS = [
  { to: '/admin/types', label: 'タイプ説明', icon: Users },
  { to: '/admin/questions', label: '問題', icon: HelpCircle },
  { to: '/admin/ui-strings', label: 'UI文言', icon: Type },
];

export function AdminSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login', { replace: true });
  };

  return (
    <nav className="w-56 border-r border-stone-200 bg-stone-50/50 flex flex-col">
      <div className="p-4 space-y-1 flex-1">
        <div className="px-3 py-2 mb-2">
          <div className="font-serif text-stone-900">Animalume</div>
          <div className="text-[10px] uppercase tracking-wider text-stone-400 mt-0.5">
            Admin
          </div>
        </div>
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition',
                isActive
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {user && !user.isAnonymous && (
        <div className="border-t border-stone-200 p-3 space-y-2">
          <div className="px-2 text-[11px] text-stone-500 truncate" title={user.email ?? user.uid}>
            {user.email ?? user.uid}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-stone-600 hover:bg-stone-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>ログアウト</span>
          </button>
        </div>
      )}
    </nav>
  );
}
```

---

## 4. Firestore Security Rules の確認

既存の `firestore.rules` で `request.auth.token.role == 'admin'` を判定しているはずです。**変更不要**。ただし、匿名ユーザーが万が一 admin クレームを偽装することを防ぐため、念のため auth プロバイダもチェックしたい場合は以下のように厳密化できます（**任意**）：

```
match /content_published/{type}/items/{id} {
  allow read: if true;
  allow write: if request.auth != null
    && request.auth.token.role == 'admin'
    && request.auth.token.firebase.sign_in_provider != 'anonymous';
}
```

`grant-admin.mjs` で匿名ユーザーに admin を付けない運用なら不要。MVP ではこの追加は省略可。

---

## 5. 検証

### 5.1 ビルド確認

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

すべて 0 errors / 0 problems で通ることを確認。

### 5.2 動作確認の手順

ビルドが通ったら、以下の確認手順を**実装後にユーザーに伝える**：

#### 動作確認チェックリスト

1. **Firebase Console で Google ログインを有効化**（人間側のタスク）
   - Firebase Console → Authentication → ログイン方法
   - Google を有効化、サポートメールを設定して保存

2. **`pnpm dev` でアプリ起動**

3. **`/admin` にアクセス**
   - 自動的に `/admin/login` にリダイレクトされること
   - 「Google でログイン」ボタンが表示されること

4. **Google でログイン**
   - ポップアップが開いてアカウント選択画面が出ること
   - ログイン後、「アクセス権限がありません」画面が表示されること（まだ admin クレーム未付与のため）

5. **Firebase Console でメールアドレス付きユーザーを確認**
   - Authentication → Users
   - 自分の Gmail アドレスが表示されているはず
   - その行の **UID をコピー**

6. **管理者権限を付与**
   ```powershell
   node scripts/grant-admin.mjs <コピーしたUID>
   ```

7. **ブラウザで一度ログアウト → 再ログイン**（クレーム反映のため必須）
   - サイドバー下部の「ログアウト」ボタン or `/admin/login` で直接ログアウト

8. **再度 `/admin` にアクセス → タイプ説明一覧が表示されること**

---

## 6. 注意事項

### 6.1 ログイン後にトークンがすぐ反映されない場合

Firebase の custom claim は ID トークンに含まれており、トークンの有効期限（1時間）内はキャッシュされます。`grant-admin.mjs` 実行直後に `/admin` にアクセスしても権限が反映されない場合は：

- **ログアウト → 再ログイン**で強制的にトークンを再取得（推奨）
- もしくは `AdminLogin.tsx` で `getIdTokenResult(true)` の `true` 引数で force refresh しているので、Google ログインフロー経由なら新規ログイン時は問題なし

### 6.2 既存の匿名ユーザーアカウントの扱い

過去に作成された 17 個の匿名アカウントは Firestore のテストデータとして残ります。本格運用前に削除したい場合は Firebase Console の Authentication → Users から個別削除可能。MVP 段階では放置で問題なし。

### 6.3 セッション持続性

Firebase Auth はデフォルトで `localStorage` ベースのセッション持続なので、ブラウザを閉じても再アクセス時はログイン状態が維持されます。明示的なログアウトのみで状態が解除されます。

---

## 7. 修正完了後の報告

以下を報告してください：

- [ ] `src/features/admin/auth/AdminLogin.tsx` を新規作成
- [ ] `src/features/admin/auth/AdminGate.tsx` を修正（loginPath 変更、匿名ユーザー扱い、state.from）
- [ ] `src/features/admin/routes.tsx` を修正（`/login` をガード外に配置）
- [ ] `src/features/admin/layout/AdminSidebar.tsx` にログアウトボタン追加
- [ ] `pnpm typecheck` 成功（0 errors）
- [ ] `pnpm lint` 成功（0 problems）
- [ ] `pnpm build` 成功
- [ ] **ユーザーに以下を伝える**:
  - Firebase Console で Google プロバイダの有効化が必要であること
  - 動作確認手順（§5.2）

---

**End of Document**
