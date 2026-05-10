import { type ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { linkSocialProvider, type SocialProvider } from '../lib/socialAuth';

// Google ブランドカラーの公式 SVG ロゴ（Google Identity guidelines 準拠）
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

type ProviderConfig = {
  id: SocialProvider;
  label: string;
  icon: ReactNode;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function SignInModal({ isOpen, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 配列ベース構造: Phase 3.0.1 で apple/facebook を追加するだけで拡張できる
  const PROVIDERS: ProviderConfig[] = [
    { id: 'google', label: t('auth.continue_with_google'), icon: <GoogleIcon /> },
    // Phase 3.0.1 で apple, facebook を追加
  ];

  async function handleSignIn(provider: SocialProvider) {
    setError(null);
    setLoading(provider);
    try {
      await linkSocialProvider(provider);
      onSuccess?.();
      onClose();
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      // auth/operation-not-allowed: Firebase Console での Google プロバイダ未有効
      if (code === 'auth/operation-not-allowed') {
        setError('Firebase Console で Google サインインを有効化してください');
      } else if (code === 'auth/credential-already-in-use') {
        setError('このアカウントは既に別のユーザーと紐付いています');
      } else if (code === 'auth/popup-closed-by-user') {
        setError(null); // ユーザーが自分でキャンセルした場合はエラー扱いしない
      } else {
        setError(t('common.error'));
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* ボトムシート */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-bg rounded-t-3xl safe-bottom"
          >
            {/* ハンドルバー */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-10 h-1 rounded-full bg-border-strong" />
            </div>

            <div className="px-8 pt-6 pb-10">
              {/* 見出し */}
              <p className="text-[11px] tracking-[0.32em] text-ink-mute text-center mb-2">
                {t('auth.sign_in_title')}
              </p>
              <p className="text-sm text-ink-soft text-center leading-relaxed mb-8">
                {t('auth.sign_in_subtitle')}
              </p>

              {/* プロバイダボタン一覧 */}
              <div className="flex flex-col gap-3">
                {PROVIDERS.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={loading !== null}
                    onClick={() => handleSignIn(id)}
                    className="flex items-center justify-center gap-3 w-full py-3.5 rounded-full bg-white border border-border text-ink text-sm font-medium hover:bg-bg-subtle transition disabled:opacity-60"
                  >
                    {icon}
                    <span>{loading === id ? t('common.loading') : label}</span>
                  </button>
                ))}
              </div>

              {/* エラー表示 */}
              {error && (
                <p className="text-xs text-center text-red-500 mt-4">{error}</p>
              )}

              {/* 将来のプロバイダへの言及 */}
              <p className="text-xs text-ink-mute text-center mt-6">
                {t('auth.other_methods_coming_soon')}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
