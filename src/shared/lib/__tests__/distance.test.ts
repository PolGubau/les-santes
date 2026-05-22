/**
 * Distance helpers power the "near me" filter on the agenda and the map.
 * A regression here either hides nearby events or shows far-away ones —
 * both silent UX bugs that QA wouldn't catch easily.
 */
import { formatDistance, haversineDistance } from '@/shared/lib/distance';

// Known reference points around Mataró (festival venue) — coords from OSM.
const PLACA_AJUNTAMENT = { lat: 41.5388, lng: 2.4448 };
const PLACA_SANTA_ANNA = { lat: 41.5397, lng: 2.4445 };

describe('haversineDistance', () => {
  it('returns 0 for identical points', () => {
    const d = haversineDistance(
      PLACA_AJUNTAMENT.lat,
      PLACA_AJUNTAMENT.lng,
      PLACA_AJUNTAMENT.lat,
      PLACA_AJUNTAMENT.lng,
    );
    expect(d).toBe(0);
  });

  it('matches the known ~100 m distance between two adjacent squares', () => {
    const d = haversineDistance(
      PLACA_AJUNTAMENT.lat,
      PLACA_AJUNTAMENT.lng,
      PLACA_SANTA_ANNA.lat,
      PLACA_SANTA_ANNA.lng,
    );
    // Tolerance generous enough that any algorithmic regression breaks it,
    // but small enough to catch a bad earth-radius constant.
    expect(d).toBeGreaterThan(80);
    expect(d).toBeLessThan(150);
  });

  it('is symmetric', () => {
    const a = haversineDistance(41.5, 2.4, 41.6, 2.5);
    const b = haversineDistance(41.6, 2.5, 41.5, 2.4);
    expect(a).toBeCloseTo(b, 6);
  });

  it('returns a positive number for any non-identical pair', () => {
    expect(haversineDistance(0, 0, 1, 1)).toBeGreaterThan(0);
    expect(haversineDistance(41, 2, -41, -2)).toBeGreaterThan(0);
  });
});

describe('formatDistance', () => {
  it('uses metres below 1 km, rounded to integer', () => {
    expect(formatDistance(0)).toBe('0 m');
    expect(formatDistance(123.6)).toBe('124 m');
    expect(formatDistance(999)).toBe('999 m');
  });

  it('switches to km with one decimal at 1000 m and beyond', () => {
    expect(formatDistance(1000)).toBe('1.0 km');
    expect(formatDistance(1500)).toBe('1.5 km');
    expect(formatDistance(12_345)).toBe('12.3 km');
  });
});
