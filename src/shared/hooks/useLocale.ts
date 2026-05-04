import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';
import { i18n } from '@/shared/i18n';

export type AppLocale = 'ca' | 'en';

export const LOCALES: { code: AppLocale; label: string; flag: string }[] = [
  { code: 'ca', label: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
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
      locale: 'ca',
      hydrated: false,
      setLocale: (locale) => {
        i18n.locale = locale;
        set({ locale });
      },
    }),
    {
      name: 'app-locale',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          i18n.locale = state.locale;
          state.hydrated = true;
        }
      },
    },
  ),
);
