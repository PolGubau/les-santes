import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { palettes, type ColorScheme, type ThemePalette } from "./palettes";
import { useThemeStore, type ThemeMode } from "./useThemeStore";

interface ThemeContextValue {
	/** Stored preference: `light` | `dark` | `system`. */
	mode: ThemeMode;
	/** Resolved scheme actually in effect (`system` collapsed to light/dark). */
	scheme: ColorScheme;
	/** Active palette — use this instead of the static `Colors`. */
	colors: ThemePalette;
	setMode: (mode: ThemeMode) => void;
}

/**
 * Default value resolves to the light palette so `useTheme()` is safe even
 * outside a provider (isolated tests, not-yet-wrapped trees). The provider
 * overrides it with the live, store-driven value.
 */
const ThemeContext = createContext<ThemeContextValue>({
	mode: "light",
	scheme: "light",
	colors: palettes.light,
	setMode: () => {},
});

function resolveScheme(mode: ThemeMode, system: ColorScheme | null | undefined): ColorScheme {
	if (mode === "system") return system === "dark" ? "dark" : "light";
	return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const mode = useThemeStore((s) => s.mode);
	const setMode = useThemeStore((s) => s.setMode);
	const system = useColorScheme();

	const value = useMemo<ThemeContextValue>(() => {
		const scheme = resolveScheme(mode, system);
		return { mode, scheme, colors: palettes[scheme], setMode };
	}, [mode, system, setMode]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Access the active theme (palette + preference controls). */
export function useTheme(): ThemeContextValue {
	return useContext(ThemeContext);
}

/**
 * Build theme-aware styles. Makes migrating a component mechanical:
 *
 *   // before — static, light-only
 *   const styles = StyleSheet.create({ root: { backgroundColor: Colors.background } });
 *
 *   // after — reacts to the active theme
 *   const styles = useThemedStyles((c) =>
 *     StyleSheet.create({ root: { backgroundColor: c.background } }),
 *   );
 */
export function useThemedStyles<T>(factory: (colors: ThemePalette) => T): T {
	const { colors } = useTheme();
	return useMemo(() => factory(colors), [colors]);
}
