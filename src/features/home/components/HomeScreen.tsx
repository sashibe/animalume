import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ensureAnonymousAuth } from '@/lib/firebase';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useDiagnosisStore } from '@/features/diagnosis/store';
import { useHasHistory } from '@/features/history/hooks/useHistory';

export function HomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reset = useDiagnosisStore((s) => s.reset);
  const [authError, setAuthError] = useState<string | null>(null);
  const hasHistory = useHasHistory();

  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) return;
    ensureAnonymousAuth().catch((e) => setAuthError(String(e)));
  }, []);

  function handleStart() {
    reset();
    navigate('/diagnosis');
  }

  return (
    <main className="min-h-full safe-top safe-bottom flex flex-col">
      <div className="container-app flex-1 flex flex-col py-12">
        <header className="flex items-center justify-end mb-12">
          <LanguageSwitcher />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 animate-slide-up">
          <div className="space-y-3">
            <h1 className="text-display font-serif">Animalume</h1>
            <p className="text-ink-soft">{t('app.tagline')}</p>
          </div>

          <p className="text-sm text-ink-soft leading-relaxed max-w-xs">
            {t('home.intro')}
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="px-8 py-3.5 rounded-xl bg-ink text-bg font-medium transition hover:opacity-90 active:scale-[0.98]"
          >
            {t('home.cta_start')}
          </button>

          {hasHistory && (
            <Link
              to="/history"
              className="text-sm text-ink-mute hover:text-ink transition"
            >
              {t('history.link_from_home')}
            </Link>
          )}

          {authError && (
            <p className="text-xs text-ink-mute">Firebase未設定（.env未投入）</p>
          )}
        </div>

        <footer className="text-xs text-ink-mute text-center pt-12">
          <p className="leading-relaxed max-w-xs mx-auto">
            {t('home.philosophy_body')}
          </p>
        </footer>
      </div>
    </main>
  );
}
