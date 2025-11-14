/**
 * Language Utilities
 * Helpers for managing app language and translations
 */

import i18n from '../config/i18n';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode,
  getDeviceLanguage,
} from '../config/i18n';
import {getAsyncItem, setAsyncItem} from './storage';

/**
 * Storage key for saved language preference
 */
const LANGUAGE_KEY = '@app:language';

/**
 * Get current language code
 */
export const getCurrentLanguage = (): SupportedLanguageCode => {
  return i18n.language as SupportedLanguageCode;
};

/**
 * Get current language info
 */
export const getCurrentLanguageInfo = () => {
  const code = getCurrentLanguage();
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES.en;
};

/**
 * Get all supported languages
 */
export const getSupportedLanguages = () => {
  return Object.values(SUPPORTED_LANGUAGES);
};

/**
 * Check if a language code is supported
 */
export const isLanguageSupported = (
  code: string,
): code is SupportedLanguageCode => {
  return code in SUPPORTED_LANGUAGES;
};

/**
 * Change app language
 */
export const changeLanguage = async (
  languageCode: SupportedLanguageCode,
): Promise<void> => {
  try {
    if (!isLanguageSupported(languageCode)) {
      console.warn(
        `[Language] Unsupported language: ${languageCode}, using English`,
      );
      languageCode = 'en';
    }

    await i18n.changeLanguage(languageCode);
    await setAsyncItem(LANGUAGE_KEY, languageCode);

    console.log(`[Language] Changed to: ${languageCode}`);
  } catch (error) {
    console.error('[Language] Error changing language:', error);
    throw error;
  }
};

/**
 * Load saved language preference
 */
export const loadSavedLanguage = async (): Promise<void> => {
  try {
    const savedLanguage = await getAsyncItem(LANGUAGE_KEY);

    if (savedLanguage && isLanguageSupported(savedLanguage)) {
      await i18n.changeLanguage(savedLanguage);
      console.log(`[Language] Loaded saved language: ${savedLanguage}`);
    } else {
      // Use device language if no saved preference
      const deviceLanguage = getDeviceLanguage();
      await i18n.changeLanguage(deviceLanguage);
      console.log(`[Language] Using device language: ${deviceLanguage}`);
    }
  } catch (error) {
    console.error('[Language] Error loading saved language:', error);
  }
};

/**
 * Reset to device language
 */
export const resetToDeviceLanguage = async (): Promise<void> => {
  try {
    const deviceLanguage = getDeviceLanguage();
    await changeLanguage(deviceLanguage as SupportedLanguageCode);
    console.log(`[Language] Reset to device language: ${deviceLanguage}`);
  } catch (error) {
    console.error('[Language] Error resetting to device language:', error);
    throw error;
  }
};

/**
 * Get translation with fallback
 * This is a wrapper around i18n.t() with better error handling
 */
export const translate = (
  key: string,
  options?: any,
  fallback?: string,
): string => {
  try {
    const translation = i18n.t(key, options);

    // If translation is the same as key, it means no translation was found
    if (translation === key && fallback) {
      return fallback;
    }

    return translation;
  } catch (error) {
    console.error(`[Language] Error translating key ${key}:`, error);
    return fallback || key;
  }
};

/**
 * Check if translation exists
 */
export const translationExists = (key: string): boolean => {
  return i18n.exists(key);
};

/**
 * Get all translations for current language
 */
export const getAllTranslations = () => {
  const language = getCurrentLanguage();
  return i18n.getResourceBundle(language, 'translation');
};

/**
 * Format date according to current language
 */
export const formatDate = (
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const language = getCurrentLanguage();
  return new Intl.DateTimeFormat(language, options).format(date);
};

/**
 * Format number according to current language
 */
export const formatNumber = (
  number: number,
  options?: Intl.NumberFormatOptions,
): string => {
  const language = getCurrentLanguage();
  return new Intl.NumberFormat(language, options).format(number);
};

/**
 * Format currency according to current language
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
): string => {
  const language = getCurrentLanguage();
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Get text direction for current language
 * Returns 'rtl' for right-to-left languages, 'ltr' for left-to-right
 */
export const getTextDirection = (): 'ltr' | 'rtl' => {
  const language = getCurrentLanguage();
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
};

/**
 * Check if current language is RTL
 */
export const isRTL = (): boolean => {
  return getTextDirection() === 'rtl';
};
