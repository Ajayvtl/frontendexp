// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file configures i18next for multilingual support.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from '../locales/en/translation.json';
import esTranslation from '../locales/es/translation.json';

const resources = {
    en: {
        translation: enTranslation,
    },
    es: {
        translation: esTranslation,
    },
};

i18n
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass i18n instance to react-i18next
    .init({
        resources,
        fallbackLng: 'en', // Fallback language if detection fails
        debug: true, // Enable debug mode for development

        interpolation: {
            escapeValue: false, // React already escapes by default
        },
    });

export default i18n;
