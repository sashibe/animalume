import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CharacterImage } from '@/components/character/CharacterImage';
import { getTypeMeta } from '@/data/types';
import type { QuestionLocale } from '@/data/questions/types';
import type { HistoryItem } from '../hooks/useHistory';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

type Props = {
  item: HistoryItem | null;
  onClose: () => void;
};

export function DigestModal({ item, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language.startsWith('ko') ? 'ko' : 'ja') as QuestionLocale;

  return (
    <AnimatePresence>
      {item && (
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
            className="fixed inset-x-0 bottom-0 z-50 bg-bg rounded-t-3xl safe-bottom overflow-y-auto max-h-[90dvh]"
          >
            {/* ハンドルバー */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-10 h-1 rounded-full bg-border-strong" />
            </div>

            <div className="px-8 pb-10">
              {/* YOUR TYPE WAS */}
              <p className="text-[11px] tracking-[0.32em] text-ink-mute text-center pt-6">
                {t('history.digest.your_type_was')}
              </p>

              {/* タイプコード */}
              <h2
                className="font-serif text-5xl text-ink text-center mt-4"
                style={{ letterSpacing: '0.18em' }}
              >
                {item.type}
              </h2>

              {/* タイプ名 */}
              <p className="text-center mt-2 text-ink-mute">
                — {getTypeMeta(item.type, locale).nameJa} —
              </p>

              {/* タグライン */}
              <p className="text-center mt-4 px-4 text-ink leading-relaxed text-sm whitespace-pre-line">
                {getTypeMeta(item.type, locale).tagline}
              </p>

              {/* キャラ画像 */}
              <div className="mx-auto my-6 w-40">
                <CharacterImage
                  type={item.type}
                  confidence={item.confidence}
                  locale={locale}
                  className="w-full"
                />
              </div>

              {/* 日付 + Reading番号 */}
              <div className="text-center text-sm text-ink-mute tabular-nums">
                {formatDate(item.takenAt)}
                {' '}—{' '}
                Reading No.{String(item.readingNumber).padStart(2, '0')}
              </div>

              {/* 4軸数値 */}
              <div className="grid grid-cols-4 gap-2 mt-6 text-xs text-ink-mute">
                <div className="text-center">
                  <span className="block tabular-nums text-ink font-medium">
                    {Math.abs(item.scores.EI)}%
                  </span>
                  <span>{item.scores.EI < 0 ? 'I' : 'E'}</span>
                </div>
                <div className="text-center">
                  <span className="block tabular-nums text-ink font-medium">
                    {Math.abs(item.scores.SN)}%
                  </span>
                  <span>{item.scores.SN < 0 ? 'S' : 'N'}</span>
                </div>
                <div className="text-center">
                  <span className="block tabular-nums text-ink font-medium">
                    {Math.abs(item.scores.TF)}%
                  </span>
                  <span>{item.scores.TF < 0 ? 'T' : 'F'}</span>
                </div>
                <div className="text-center">
                  <span className="block tabular-nums text-ink font-medium">
                    {Math.abs(item.scores.JP)}%
                  </span>
                  <span>{item.scores.JP < 0 ? 'J' : 'P'}</span>
                </div>
              </div>

              {/* セパレーター */}
              <div className="border-t border-border-subtle mx-0 my-6" />

              {/* 「このReadingを開く」ボタン */}
              <Link
                to={`/result/${item.resultId}`}
                state={{ resultId: item.resultId }}
                onClick={onClose}
                className="block text-center py-3 border border-border rounded-full text-ink text-sm hover:bg-bg-subtle transition"
              >
                {t('history.digest.open_reading')}
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
