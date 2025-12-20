import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import el from '@/locales/el.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  el: { translation: el },
};

// Initialize i18n synchronously without React binding first
i18n
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

// Bind to React after initialization
i18n.use(initReactI18next);

export default i18n;
