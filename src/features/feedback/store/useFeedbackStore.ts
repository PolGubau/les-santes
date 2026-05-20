import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Global UI/state for the feedback modal.
 *
 *  - `isOpen` is ephemeral (never persisted) — it controls the singleton
 *    modal mounted at the root layout.
 *  - `lastSubmittedAt` is persisted so future smart-trigger logic can avoid
 *    re-prompting users who already gave feedback recently.
 */
interface FeedbackStoreState {
	isOpen: boolean;
	lastSubmittedAt: number;
	open: () => void;
	close: () => void;
	markSubmitted: () => void;
}

export const useFeedbackStore = create<FeedbackStoreState>()(
	persist(
		(set) => ({
			isOpen: false,
			lastSubmittedAt: 0,
			open: () => set({ isOpen: true }),
			close: () => set({ isOpen: false }),
			markSubmitted: () =>
				set({ lastSubmittedAt: Date.now(), isOpen: false }),
		}),
		{
			name: "santes-feedback",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (s) => ({ lastSubmittedAt: s.lastSubmittedAt }),
		},
	),
);
