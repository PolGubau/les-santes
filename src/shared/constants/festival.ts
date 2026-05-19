/**
 * Festival identity — resolved at build time via EXPO_PUBLIC_* env vars.
 *
 * Each festival build (or EAS profile) sets these variables:
 *   EXPO_PUBLIC_FESTIVAL_ID=les-santes-2026   → Les Santes 2026
 *   EXPO_PUBLIC_FESTIVAL_ID=les-santes-2025   → Les Santes 2025 (arxiu)
 *   EXPO_PUBLIC_FESTIVAL_ID=granollers-2027   → any other festival
 *
 * Metro inlines EXPO_PUBLIC_* at bundle time, so the value is
 * baked into the binary — no runtime network call needed.
 *
 * Per veure una edició passada (p. ex. 2025) només cal fer un build amb:
 *   EXPO_PUBLIC_FESTIVAL_ID=les-santes-2025
 *   EXPO_PUBLIC_FESTIVAL_START=2025-07-24
 *   EXPO_PUBLIC_FESTIVAL_END=2025-07-29
 */

declare const process: { env: Record<string, string | undefined> };

export const FESTIVAL_ID: string =
  process.env.EXPO_PUBLIC_FESTIVAL_ID ?? 'les-santes-2026';

/**
 * Dates oficials del festival actual (per defecte: Les Santes 2026, Mataró).
 * Configurables via env per poder reconstruir builds d'edicions anteriors.
 */
export const FESTIVAL_START = new Date(
  `${process.env.EXPO_PUBLIC_FESTIVAL_START ?? '2026-07-24'}T00:00:00`,
);
export const FESTIVAL_END = new Date(
  `${process.env.EXPO_PUBLIC_FESTIVAL_END ?? '2026-07-29'}T23:59:59`,
);
