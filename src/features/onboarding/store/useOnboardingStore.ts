import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OnboardingState {
	hasSeenOnboarding: boolean;
	markSeen: () => void;
	/** Test/debug only. */
	reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
	persist(
		(set) => ({
			hasSeenOnboarding: false,
			markSeen: () => set({ hasSeenOnboarding: true }),
			reset: () => set({ hasSeenOnboarding: false }),
		}),
		{
			name: "santes-onboarding",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (s) => ({ hasSeenOnboarding: s.hasSeenOnboarding }),
		},
	),
);
