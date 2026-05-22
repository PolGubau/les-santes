import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DismissedAnnouncementsState {
	/** Stable list of dismissed announcement IDs. Persisted across launches. */
	dismissedIds: string[];

	isDismissed: (id: string) => boolean;
	dismiss: (id: string) => void;
	restore: (id: string) => void;
	restoreAll: () => void;
}

export const useDismissedAnnouncementsStore = create<DismissedAnnouncementsState>()(
	persist(
		(set, get) => ({
			dismissedIds: [],

			isDismissed: (id) => get().dismissedIds.includes(id),

			dismiss: (id) =>
				set((s) =>
					s.dismissedIds.includes(id)
						? s
						: { dismissedIds: [...s.dismissedIds, id] },
				),

			restore: (id) =>
				set((s) => ({ dismissedIds: s.dismissedIds.filter((x) => x !== id) })),

			restoreAll: () => set({ dismissedIds: [] }),
		}),
		{
			name: 'santes-dismissed-announcements',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (s) => ({ dismissedIds: s.dismissedIds }),
		},
	),
);
