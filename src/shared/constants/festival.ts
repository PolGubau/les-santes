/**
 * Festival identity — resolved at build time via EXPO_PUBLIC_FESTIVAL_ID.
 *
 * Each festival build (or EAS profile) sets this variable:
 *   EXPO_PUBLIC_FESTIVAL_ID=les-santes-2026   → Les Santes 2026
 *   EXPO_PUBLIC_FESTIVAL_ID=les-santes-2027   → Les Santes 2027
 *   EXPO_PUBLIC_FESTIVAL_ID=granollers-2027   → any other festival
 *
 * Metro inlines EXPO_PUBLIC_* at bundle time, so the value is
 * baked into the binary — no runtime network call needed.
 */

declare const process: { env: Record<string, string | undefined> };

export const FESTIVAL_ID: string =
  process.env.EXPO_PUBLIC_FESTIVAL_ID ?? 'les-santes-2026';

/** Les Santes 2026 official dates (Mataró) */
export const FESTIVAL_START = new Date('2026-07-24T00:00:00');
export const FESTIVAL_END   = new Date('2026-07-29T23:59:59');
