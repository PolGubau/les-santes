import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { ca } from './ca';
import { en } from './en';
import { es } from './es';

/**
 * Singleton i18n instance. Single source of truth for the active locale —
 * mutated only from the locale store (`useLocaleStore`).
 *
 * Supported: 'ca' (Catalan, primary), 'es' (Spanish), 'en' (English).
 * Anything else falls back to Catalan via `defaultLocale` + `enableFallback`.
 */
const i18n = new I18n({ ca, en, es });

export const SUPPORTED_LOCALES = ['ca', 'es', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: AppLocale = 'ca';

/**
 * Coerce any locale-like string to a supported AppLocale.
 * Accepts BCP-47 tags ('en-US', 'es-419'), bare codes ('en') and casing variants;
 * returns `null` when nothing maps to a shipped locale.
 */
export function normalizeLocale(input: string | null | undefined): AppLocale | null {
  if (!input) return null;
  const code = input.toLowerCase().split(/[-_]/)[0];
  return (SUPPORTED_LOCALES as readonly string[]).includes(code) ? (code as AppLocale) : null;
}

/**
 * Walk through the device's ordered list of preferred locales and pick the
 * first one we actually ship translations for. Falls back to Catalan when
 * none of the device's languages are supported (rather than blindly using
 * the top entry, which may be e.g. Catalan on a phone whose primary OS
 * language is Spanish).
 */
export function resolveDeviceLocale(): AppLocale {
  for (const loc of getLocales()) {
    const normalized = normalizeLocale(loc.languageCode ?? loc.languageTag);
    if (normalized) return normalized;
  }
  return DEFAULT_LOCALE;
}

i18n.defaultLocale = DEFAULT_LOCALE;
i18n.enableFallback = true;
// Bootstrap with the device locale so any `t()` call between module load and
// store hydration uses the right language. The store will reapply the
// persisted locale (if any) once AsyncStorage finishes loading.
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
