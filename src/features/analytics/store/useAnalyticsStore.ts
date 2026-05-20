import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { uuidv4 } from "../lib/uuid";

interface AnalyticsStoreState {
	/** Stable per‑install identifier. Generated once, persisted forever. */
	installId: string;
	/** Memory‑only session id, regenerated on every cold start. */
	sessionId: string;
	/** Whether tracking is active. Users can opt‑out in settings. */
	isEnabled: boolean;
	/** Per‑process flag to avoid double‑firing duplicate events. */
	_seen: Record<string, true>;

	markSeen: (key: string) => boolean;
	setEnabled: (enabled: boolean) => void;
}

export const useAnalyticsStore = create<AnalyticsStoreState>()(
	persist(
		(set, get) => ({
			installId: uuidv4(),
			sessionId: uuidv4(),
			isEnabled: true,
			_seen: {},

			markSeen: (key) => {
				if (get()._seen[key]) return false;
				set((s) => ({ _seen: { ...s._seen, [key]: true } }));
				return true;
			},

			setEnabled: (isEnabled) => set({ isEnabled }),
		}),
		{
			name: "santes-analytics",
			storage: createJSONStorage(() => AsyncStorage),
			// Only installId and isEnabled survive across launches.
			partialize: (s) => ({
				installId: s.installId,
				isEnabled: s.isEnabled,
			}),
		},
	),
);
