import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';
import { i18n, normalizeLocale, resolveDeviceLocale, type AppLocale } from '@/shared/i18n';

export type { AppLocale };

export const LOCALES: { code: AppLocale; label: string; flag: string }[] = [
  { code: 'ca', label: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

interface LocaleStore {
  locale: AppLocale;
  hydrated: boolean;
  setLocale: (locale: AppLocale) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      // Initial value = device locale. On first launch (no persisted value)
      // the rehydration step preserves this; on later launches it gets
      // overwritten by the user's saved choice.
      locale: resolveDeviceLocale(),
      hydrated: false,
      setLocale: (locale) => {
        const safe = normalizeLocale(locale) ?? resolveDeviceLocale();
        i18n.locale = safe;
        set({ locale: safe });
      },
    }),
    {
      name: 'app-locale',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the user's choice; `hydrated` is runtime-only.
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          if (__DEV__) console.warn('[locale] rehydrate failed', error);
        } else if (state) {
          // Guard against corrupted/legacy values in AsyncStorage.
          const safe = normalizeLocale(state.locale) ?? resolveDeviceLocale();
          i18n.locale = safe;
          if (safe !== state.locale) state.locale = safe;
        }
        // Use the store API so subscribers (e.g. gates) react to hydration.
        useLocaleStore.setState({ hydrated: true });
      },
    },
  ),
);
