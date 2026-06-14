import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Cadence at which pre-festival engagement notifications fire.
 * 0 = disabled (never), 2 = every 2 days.
 */
export type EngagementFrequencyDays = 0 | 2;

interface EngagementStoreState {
	frequencyDays: EngagementFrequencyDays;
	setFrequencyDays: (days: EngagementFrequencyDays) => void;
}

/**
 * User preference for the daily engagement reminder cadence. Read by
 * `scheduleEngagementNotifications` whenever it (re)builds the queue.
 *
 * Defaults to every 2 days — non-intrusive while still keeping the app
 * present during the closed-testing window.
 */
export const useEngagementStore = create<EngagementStoreState>()(
	persist(
		(set) => ({
			frequencyDays: 2,
			setFrequencyDays: (days) => set({ frequencyDays: days }),
		}),
		{
			name: "santes-engagement",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (s) => ({ frequencyDays: s.frequencyDays }),
		},
	),
);
