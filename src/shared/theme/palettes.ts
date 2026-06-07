import { Colors, type ColorKey } from "@/shared/constants";

/**
 * A theme palette has the exact same keys as the existing `Colors` object,
 * so any component can move from `Colors.x` to `colors.x` with a 1:1 rename.
 */
export type ThemePalette = Record<ColorKey, string>;

export type ColorScheme = "light" | "dark";

/**
 * Light palette = the current production colors (designed for sunlight
 * readability). Re-exported here so the theme layer is the single source of
 * truth once the migration to `useTheme()` happens.
 */
export const lightColors: ThemePalette = Colors;

/**
 * Dark palette — mirrors every key in `lightColors`.
 *
 * ⚠️ Values are a sensible first pass (warm dark surfaces + lightened accents
 * so brand/state colors keep WCAG-AA contrast on dark backgrounds). They MUST
 * be validated on-device by design before dark mode is activated.
 */
export const darkColors: ThemePalette = {
	primary: "#FF6B7D", // lightened Santes red for contrast on dark
	primaryLight: "#FF8A97",
	background: "#121110", // warm near-black
	surface: "#1E1B1A",
	surfaceHigh: "#2A2624", // pressed state, slightly lifted
	text: "#F5F1EC", // warm near-white — high contrast on background
	textMuted: "#B5ABA6", // ~7:1 on background
	textDim: "#8E827E", // tertiary/placeholder
	border: "#3A3431", // subtle warm divider

	// event states — lightened for contrast on dark surfaces
	stateNow: "#34D399",
	stateUpcoming: "#60A5FA",
	stateFinished: "#6B7280",
} as const;

export const palettes: Record<ColorScheme, ThemePalette> = {
	light: lightColors,
	dark: darkColors,
};
