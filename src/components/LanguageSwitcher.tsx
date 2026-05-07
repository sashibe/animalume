import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isJa = i18n.language === 'ja';

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(isJa ? 'ko' : 'ja')}
      className="text-sm text-ink-soft hover:text-ink transition px-2 py-1"
      aria-label="言語を切り替える / 언어 전환"
    >
      {isJa ? '한국어' : '日本語'}
    </button>
  );
}
