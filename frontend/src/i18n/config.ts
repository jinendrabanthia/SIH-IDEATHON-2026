import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import orLocale from './locales/or.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      or: { translation: orLocale },
    },
    fallbackLng: 'en',
    lng: 'en', // Default start language
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Prevent React Suspense blank screen
    },
  });

export default i18n;
