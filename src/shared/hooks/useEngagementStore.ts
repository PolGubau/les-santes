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
 * Defaults to 0 (disabled) — the app is published, so periodic engagement
 * nudges are off by default. Only the fixed festival reminders fire.
 */
export const useEngagementStore = create<EngagementStoreState>()(
	persist(
		(set) => ({
			frequencyDays: 0,
			setFrequencyDays: (days) => set({ frequencyDays: days }),
		}),
		{
			name: "santes-engagement",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (s) => ({ frequencyDays: s.frequencyDays }),
		},
	),
);
