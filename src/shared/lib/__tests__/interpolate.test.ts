/**
 * interpolatePosition powers the moving-event dot on the map (cercaviles,
 * correfocs). Edge cases matter: before-start / after-end must be null so
 * the marker disappears; mid-run must land on the right segment so the dot
 * doesn't teleport ahead of the parade.
 */
import { interpolatePosition } from '@/shared/lib/interpolate';
import type { RoutePoint } from '@/entities/event';

const ROUTE: RoutePoint[] = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 10 },
  { lat: 0, lng: 20 },
];

const start = '2026-07-27T18:00:00.000Z';
const end = '2026-07-27T20:00:00.000Z';

function freezeNow(iso: string): jest.SpyInstance {
  return jest.spyOn(Date, 'now').mockReturnValue(new Date(iso).getTime());
}

describe('interpolatePosition', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns null before the event starts', () => {
    freezeNow('2026-07-27T17:59:59Z');
    expect(interpolatePosition(ROUTE, start, end)).toBeNull();
  });

  it('returns null after the event ends', () => {
    freezeNow('2026-07-27T20:00:01Z');
    expect(interpolatePosition(ROUTE, start, end)).toBeNull();
  });

  it('returns the first point at start', () => {
    freezeNow(start);
    const p = interpolatePosition(ROUTE, start, end);
    expect(p).toEqual({ lat: 0, lng: 0 });
  });

  it('lands on the segment boundary at half-progress for a 2-segment route', () => {
    // Halfway through a 2-segment route → end of segment 0 / start of segment 1
    freezeNow('2026-07-27T19:00:00Z');
    const p = interpolatePosition(ROUTE, start, end);
    expect(p?.lng).toBeCloseTo(10, 5);
    expect(p?.lat).toBeCloseTo(0, 5);
  });

  it('interpolates linearly inside the first segment at 25% progress', () => {
    // 30 min in / 120 min total = 0.25 → segmentFloat = 0.5, segment 0, t=0.5
    freezeNow('2026-07-27T18:30:00Z');
    const p = interpolatePosition(ROUTE, start, end);
    expect(p?.lng).toBeCloseTo(5, 5);
  });

  it('clamps to the last segment near end so the dot never overshoots', () => {
    // 99% progress → segmentFloat = 1.98, but Math.min keeps it in segment 1
    freezeNow('2026-07-27T19:58:48Z');
    const p = interpolatePosition(ROUTE, start, end);
    expect(p).not.toBeNull();
    expect(p?.lng).toBeGreaterThan(15);
    expect(p?.lng).toBeLessThanOrEqual(20);
  });

  it('returns the only point for a single-point route', () => {
    freezeNow('2026-07-27T19:00:00Z');
    const single: RoutePoint[] = [{ lat: 1, lng: 2 }];
    expect(interpolatePosition(single, start, end)).toEqual({ lat: 1, lng: 2 });
  });

  it('returns null for an empty route', () => {
    freezeNow('2026-07-27T19:00:00Z');
    expect(interpolatePosition([], start, end)).toBeNull();
  });
});
