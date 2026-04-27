import type { Event } from '@/entities/event';
import {
  cancelEventNotification,
  scheduleEventNotification,
} from '@/shared/lib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FavoritesState {
  /** eventId → scheduled notification ID */
  favorites: Record<string, string | null>;
  isFavorite: (eventId: string) => boolean;
  toggleFavorite: (event: Event) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: {},

      isFavorite: (eventId) => eventId in get().favorites,

      toggleFavorite: async (event) => {
        const { favorites } = get();

        if (event.id in favorites) {
          // Remove favorite and cancel notification
          const notifId = favorites[event.id];
          if (notifId) await cancelEventNotification(notifId);
          set((s) => {
            const next = { ...s.favorites };
            delete next[event.id];
            return { favorites: next };
          });
        } else {
          // Add favorite and schedule notification
          const notifId = await scheduleEventNotification(event);
          set((s) => ({
            favorites: { ...s.favorites, [event.id]: notifId },
          }));
        }
      },
    }),
    {
      name: 'santes-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
