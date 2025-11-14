/**
 * i18n Configuration
 * Internationalization setup using i18next and react-i18next
 */

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {Platform, NativeModules} from 'react-native';
import en from '../locales/en.json';

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = {
  en: {code: 'en', name: 'English', nativeName: 'English'},
  // Add more languages here as needed
  // es: {code: 'es', name: 'Spanish', nativeName: 'Español'},
  // fr: {code: 'fr', name: 'French', nativeName: 'Français'},
  // ar: {code: 'ar', name: 'Arabic', nativeName: 'العربية'},
} as const;

export type SupportedLanguageCode = keyof typeof SUPPORTED_LANGUAGES;

/**
 * Translation resources
 */
const resources = {
  en: {translation: en},
  // Add more language resources here
  // es: {translation: es},
  // fr: {translation: fr},
  // ar: {translation: ar},
};

/**
 * Get device language
 * Returns the device's current language code
 */
export const getDeviceLanguage = (): string => {
  let deviceLanguage = 'en';

  try {
    if (Platform.OS === 'ios') {
      const locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];
      if (locale) {
        deviceLanguage = locale.split('_')[0];
      }
    } else if (Platform.OS === 'android') {
      const locale = NativeModules.I18nManager?.localeIdentifier;
      if (locale) {
        deviceLanguage = locale.split('_')[0];
      }
    }
  } catch (error) {
    console.warn('[i18n] Error getting device language:', error);
  }

  // Return device language if supported, otherwise default to English
  return Object.keys(SUPPORTED_LANGUAGES).includes(deviceLanguage)
    ? deviceLanguage
    : 'en';
};

/**
 * Initialize i18n
 */
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    compatibilityJSON: 'v3', // Important for React Native
    resources,
    lng: getDeviceLanguage(), // Default language
    fallbackLng: 'en', // Fallback language if translation missing
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
    // Debug mode (disable in production)
    debug: __DEV__,
  });

export default i18n;
