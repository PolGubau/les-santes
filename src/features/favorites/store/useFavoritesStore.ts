import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface FavoritesState {
	favorites: Record<string, true>;
	isFavorite: (eventId: string) => boolean;
	toggleFavorite: (eventId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
	persist(
		(set, get) => ({
			favorites: {},

			isFavorite: (eventId) => eventId in get().favorites,

			toggleFavorite: (eventId) => {
				set((s) => {
					const next = { ...s.favorites };
					if (eventId in next) {
						delete next[eventId];
					} else {
						next[eventId] = true;
					}
					return { favorites: next };
				});
			},
		}),
		{
			name: "santes-favorites",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
