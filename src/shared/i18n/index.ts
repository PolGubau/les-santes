import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { ca } from './ca';
import { en } from './en';
import { es } from './es';

/**
 * Singleton i18n instance.
 * Locale is resolved once at startup from the device settings.
 * Only 'ca' (Catalan), 'en' (English) and 'es' (Spanish) are supported;
 * everything else falls back to Catalan as it is the primary language of the festival.
 */
const i18n = new I18n({ ca, en, es });

const SUPPORTED_LOCALES = ['ca', 'es', 'en'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Walk through the device's ordered list of preferred locales and pick the
 * first one we actually ship translations for. Falls back to Catalan when
 * none of the device's languages are supported (rather than blindly using
 * the top entry, which may be e.g. Catalan on a phone whose primary OS
 * language is Spanish).
 */
function resolveDeviceLocale(): SupportedLocale {
  const locales = getLocales();
  for (const loc of locales) {
    const code = loc.languageCode?.toLowerCase();
    if (code && (SUPPORTED_LOCALES as readonly string[]).includes(code)) {
      return code as SupportedLocale;
    }
  }
  return 'ca';
}

i18n.defaultLocale = 'ca';
i18n.enableFallback = true;
i18n.locale = resolveDeviceLocale();

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
