import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * User theme preference.
 *  - `light` / `dark`: explicit override.
 *  - `system`: follow the OS appearance (resolved at render via useColorScheme).
 */
export type ThemeMode = "light" | "dark" | "system";

const VALID_MODES: readonly ThemeMode[] = ["light", "dark", "system"];

function normalizeMode(value: unknown): ThemeMode {
	return VALID_MODES.includes(value as ThemeMode) ? (value as ThemeMode) : "light";
}

interface ThemeStore {
	mode: ThemeMode;
	hydrated: boolean;
	setMode: (mode: ThemeMode) => void;
}

/**
 * Persisted theme preference. Defaults to `light` so the app keeps its current
 * appearance until dark mode is activated (flip the default to `system` once
 * the `Colors.*` → `useTheme()` migration is complete).
 */
export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			mode: "light",
			hydrated: false,
			setMode: (mode) => set({ mode: normalizeMode(mode) }),
		}),
		{
			name: "santes-theme",
			storage: createJSONStorage(() => AsyncStorage),
			// Only persist the user's choice; `hydrated` is runtime-only.
			partialize: (s) => ({ mode: s.mode }),
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					if (__DEV__) console.warn("[theme] rehydrate failed", error);
				} else if (state) {
					// Guard against corrupted/legacy values in AsyncStorage.
					const safe = normalizeMode(state.mode);
					if (safe !== state.mode) state.mode = safe;
				}
				useThemeStore.setState({ hydrated: true });
			},
		},
	),
);
