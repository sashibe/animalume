import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShareCardPreview } from './ShareCardPreview';
import { ShareButtonGroup } from './ShareButtonGroup';
import type { MbtiType } from '@/features/diagnosis/logic/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: MbtiType;
  name: string;
  tagline: string;
  locale: 'ja' | 'ko';
}

export function ShareModal({ isOpen, onClose, type, name, tagline, locale }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
          />

          {/* Sheet / Modal */}
          <motion.div
            key="modal"
            className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 pointer-events-none"
            aria-modal="true"
            role="dialog"
            aria-label={t('share.title')}
          >
            <motion.div
              className="pointer-events-auto w-full sm:max-w-sm mx-auto bg-bg rounded-t-3xl sm:rounded-3xl p-6 pb-safe shadow-editorial-lg"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ maxHeight: '92dvh', overflowY: 'auto' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] tracking-[0.32em] text-ink-mute uppercase">
                  — {t('share.title')} —
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-ink-mute hover:text-ink transition p-1 -mr-1"
                  aria-label={t('common.close')}
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Card preview */}
              <div className="mb-5">
                <ShareCardPreview type={type} locale={locale} />
              </div>

              {/* Where to share label */}
              <p className="text-xs text-ink-mute text-center mb-4 tracking-wide">
                {t('share.where_to_share')}
              </p>

              {/* Buttons */}
              <ShareButtonGroup
                type={type}
                name={name}
                tagline={tagline}
                locale={locale}
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
