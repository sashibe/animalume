import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useHistory } from '../hooks/useHistory';
import { DigestModal } from './DigestModal';
import { SignInModal } from '@/features/auth/components/SignInModal';
import { getTypeMeta } from '@/data/types';
import { useAuth } from '@/lib/auth';
import type { QuestionLocale } from '@/data/questions/types';
import type { HistoryItem } from '../hooks/useHistory';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language.startsWith('ko') ? 'ko' : 'ja') as QuestionLocale;
  const { items, loading } = useHistory();
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>{t('history.title')} | Animalume</title>
      </Helmet>

      <main className="min-h-full safe-top safe-bottom flex flex-col">
        <div className="container-app flex-1 flex flex-col py-8">

          {/* ── 見出し ── */}
          <header className="text-center mb-10 pt-2">
            <p className="text-[11px] tracking-[0.32em] text-ink-mute mb-2 uppercase">
              {t('history.section_label')}
            </p>
            <h1 className="font-serif text-3xl text-ink">{t('history.title')}</h1>
            <p className="text-sm text-ink-mute mt-2">{t('history.subtitle')}</p>
          </header>

          {/* ── サインイン誘導バナー ── */}
          {user?.isAnonymous && items.length >= 2 && (
            <div className="bg-bg-subtle rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-ink-mute leading-snug">
                {t('auth.history_save_banner')}
              </p>
              <button
                type="button"
                onClick={() => setIsSignInOpen(true)}
                className="shrink-0 px-4 py-1.5 rounded-full bg-ink text-bg text-xs font-medium"
              >
                {t('auth.history_save_cta')}
              </button>
            </div>
          )}

          {/* ── リスト本体 ── */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-ink-mute">{t('common.loading')}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <p className="font-serif text-xl text-ink-mute mb-6">
                {t('history.empty')}
              </p>
              <Link
                to="/"
                className="px-6 py-3 rounded-full border border-border text-ink text-sm hover:bg-bg-subtle transition"
              >
                {t('history.empty_cta')}
              </Link>
            </div>
          ) : (
            <div className="flex-1">
              {items.map((item) => {
                const meta = getTypeMeta(item.type, locale);
                return (
                  <button
                    key={item.resultId}
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="w-full text-left py-6 border-b border-border-subtle hover:bg-bg-subtle transition"
                  >
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-sm text-ink-mute tabular-nums">
                        {formatDate(item.takenAt)}
                      </span>
                      <span className="text-xs text-ink-mute tracking-widest">
                        — Reading No.{String(item.readingNumber).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl text-ink mb-1">
                      {item.type}・{meta.nameJa}
                    </h3>
                    <p className="text-sm text-ink-mute leading-relaxed">
                      {meta.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── ホームへの戻り ── */}
          <div className="text-center pt-8 pb-4">
            <Link to="/" className="text-xs text-ink-mute hover:text-ink transition">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </main>

      <DigestModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
    </>
  );
}
