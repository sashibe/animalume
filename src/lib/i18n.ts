import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import jaCommon from '@/locales/ja/common.json';
import koCommon from '@/locales/ko/common.json';

export const SUPPORTED_LANGUAGES = ['ja', 'ko'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'ja';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    defaultNS: 'common',
    ns: ['common'],
    resources: {
      ja: { common: jaCommon },
      ko: { common: koCommon },
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'animalume.lang',
    },
  });

export default i18n;
