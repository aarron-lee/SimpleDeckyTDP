import * as ko from '../../defaults/i18n/ko.json';
import * as ja from '../../defaults/i18n/ja.json';

export const LANGS: {
  [key: string]: {
    name: string;
    strings: {
      [key: string]: string;
    };
  };
} = {
  ko: {
    name: '한국어',
    strings: ko,
  },
  ja: {
    name: '日本語',
    strings: ja,
  },
};

let cachedLang: string | undefined;

export const getCurrentLanguage = (): string => {
  if (cachedLang) return cachedLang;

  const lang = window.LocalizationManager.m_rgLocalesToUse[0];
  cachedLang = lang;
  return lang;
};

export const getLanguageName = (lang?: string): string => {
  const targetLang = lang || getCurrentLanguage();
  return LANGS[targetLang]?.name || targetLang;
};

/**
 * Translate a key to the current language
 *
 * @param key - Translation key
 * @param originalString - Original text (fallback)
 * @returns Translated string or original text if translation not found
 *
 * @example
 * t('TDP_PROFILE_ENABLE_DESKTOP', 'Enable Desktop Profile')
 */
const t = (key: string, originalString: string): string => {
  const lang = getCurrentLanguage();

  // English always returns the original text
  if (lang === 'en') return originalString;

  // Return translation if exists, otherwise return original text
  return LANGS[lang]?.strings?.[key] ?? originalString;
};

export default t;
