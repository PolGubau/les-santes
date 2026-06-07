import { Text as RNText, type TextProps } from "react-native";

/**
 * Largest font scale we allow before single-line titles and compact layouts
 * start to break with Dynamic Type / "Display size".
 *
 * React 19 dropped `defaultProps` on function components and the Fabric
 * renderer no longer exposes `Text.render`, so the classic global override
 * hacks no longer work. A shared wrapper is the only reliable way to cap font
 * scaling app-wide: import `Text` from `@/shared/ui` (or `./Text` inside this
 * folder) instead of from `react-native`.
 *
 * A per-instance `maxFontSizeMultiplier` still wins, so individual nodes can
 * opt into a tighter cap when needed.
 */
export const MAX_FONT_SCALE = 1.5;

export function Text({
  maxFontSizeMultiplier = MAX_FONT_SCALE,
  ...props
}: TextProps) {
  return <RNText maxFontSizeMultiplier={maxFontSizeMultiplier} {...props} />;
}
