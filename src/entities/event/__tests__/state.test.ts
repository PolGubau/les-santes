/**
 * computeEventState / withState — single source of truth for the "now /
 * upcoming / finished" classification that drives badges, sections, the
 * Ara tab, and the map. Any regression here ripples across the whole app.
 */
import { computeEventState, withState } from '@/entities/event/state';
import type { RawEvent } from '@/entities/event';

const baseStatic = {
  id: 'e1',
  title: 'Cercavila',
  type: 'cercavila',
  category: 'tradicional',
  shortDescription: '',
  kind: 'static',
  location: { lat: 41.53, lng: 2.45 },
} as const;

function staticAt(startISO: string, endISO: string): RawEvent {
  return { ...baseStatic, start: startISO, end: endISO } as RawEvent;
}

describe('computeEventState', () => {
  const start = '2026-07-27T18:00:00.000Z';
  const end = '2026-07-27T20:00:00.000Z';

  it('marks events strictly before start as upcoming', () => {
    const now = new Date('2026-07-27T17:59:59.999Z');
    expect(computeEventState({ start, end }, now)).toBe('upcoming');
  });

  it('marks events strictly after end as finished', () => {
    const now = new Date('2026-07-27T20:00:00.001Z');
    expect(computeEventState({ start, end }, now)).toBe('finished');
  });

  it('marks events inside [start, end] as now', () => {
    expect(computeEventState({ start, end }, new Date(start))).toBe('now');
    expect(computeEventState({ start, end }, new Date(end))).toBe('now');
    expect(
      computeEventState({ start, end }, new Date('2026-07-27T19:00:00Z')),
    ).toBe('now');
  });

  it('handles zero-length events (start === end) as a single instant', () => {
    const instant = '2026-07-27T18:00:00.000Z';
    expect(
      computeEventState(
        { start: instant, end: instant },
        new Date(instant),
      ),
    ).toBe('now');
    expect(
      computeEventState(
        { start: instant, end: instant },
        new Date('2026-07-27T18:00:00.001Z'),
      ),
    ).toBe('finished');
  });
});

describe('withState', () => {
  it('preserves the discriminant kind and all original fields', () => {
    const e = staticAt('2026-07-27T18:00:00Z', '2026-07-27T20:00:00Z');
    const result = withState(e, new Date('2026-07-27T19:00:00Z'));
    expect(result.kind).toBe('static');
    expect(result.id).toBe('e1');
    expect(result.state).toBe('now');
  });

  it('does not mutate the input event', () => {
    const e = staticAt('2026-07-27T18:00:00Z', '2026-07-27T20:00:00Z');
    const snapshot = JSON.stringify(e);
    withState(e, new Date('2026-07-27T19:00:00Z'));
    expect(JSON.stringify(e)).toBe(snapshot);
  });
});
