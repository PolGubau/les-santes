import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Number of favorites the user must add before we prompt for a review. */
const REVIEW_THRESHOLD = 3;
/** How many days must pass before we can ask again (safety net). */
const REVIEW_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

interface FavoritesState {
	favorites: Record<string, true>;
	/** Total count of favorites ever added (never decrements). */
	totalAdded: number;
	/** Timestamp of the last review request, or 0 if never asked. */
	lastReviewTs: number;
	isFavorite: (eventId: string) => boolean;
	toggleFavorite: (eventId: string) => void;
}

async function maybeRequestReview(totalAdded: number, lastReviewTs: number): Promise<boolean> {
	if (totalAdded < REVIEW_THRESHOLD) return false;
	if (Date.now() - lastReviewTs < REVIEW_COOLDOWN_MS) return false;
	const isAvailable = await StoreReview.isAvailableAsync();
	if (isAvailable) {
		await StoreReview.requestReview();
		return true;
	}
	return false;
}

export const useFavoritesStore = create<FavoritesState>()(
	persist(
		(set, get) => ({
			favorites: {},
			totalAdded: 0,
			lastReviewTs: 0,

			isFavorite: (eventId) => eventId in get().favorites,

			toggleFavorite: (eventId) => {
				set((s) => {
					const next = { ...s.favorites };
					const isAdding = !(eventId in next);

					if (isAdding) {
						next[eventId] = true;
					} else {
						delete next[eventId];
					}

					const totalAdded = isAdding ? s.totalAdded + 1 : s.totalAdded;
					const lastReviewTs = s.lastReviewTs;

					if (isAdding) {
						maybeRequestReview(totalAdded, lastReviewTs)
							.then((requested) => {
								if (requested) useFavoritesStore.setState({ lastReviewTs: Date.now() });
							})
							.catch(() => {
								// Review prompts are opportunistic; never break favorite toggling.
							});
					}

					return { favorites: next, totalAdded };
				});
			},
		}),
		{
			name: "santes-favorites",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (s) => ({
				favorites: s.favorites,
				totalAdded: s.totalAdded,
				lastReviewTs: s.lastReviewTs,
			}),
		},
	),
);
