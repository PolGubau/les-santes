import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { ca } from './ca';
import { en } from './en';

/**
 * Singleton i18n instance.
 * Locale is resolved once at startup from the device settings.
 * Only 'ca' (Catalan) and 'en' (English) are supported; everything else
 * falls back to Catalan as it is the primary language of the festival.
 */
const i18n = new I18n({ ca, en });

// Resolve locale from the device's preferred locales list
const deviceLocale = getLocales()[0]?.languageCode ?? 'ca';
i18n.locale = deviceLocale;

// Fall back to Catalan for any unsupported locale
i18n.defaultLocale = 'ca';
i18n.enableFallback = true;

/**
 * Translate a key using the current device locale.
 *
 * @example
 * t('tabs.ara')           // 'Ara' | 'Now'
 * t('agenda.eventsCount', { count: 5 })  // '5 actes' | '5 events'
 */
export const t = i18n.t.bind(i18n);

export { i18n };
export type { Translations } from './ca';
