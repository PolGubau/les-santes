/**
 * buildSections decides the order in which the agenda lays out events.
 * The contract is: only non-empty groups, always in NOW → UPCOMING →
 * FINISHED order. UI assumes this — getting it wrong shuffles the list.
 */
import { buildSections } from '@/features/agenda/lib/sections';
import type { Event } from '@/entities/event';

function ev(id: string, state: Event['state']): Event {
  return {
    id,
    title: id,
    type: 'altres',
    category: 'cultural',
    kind: 'static',
    shortDescription: '',
    start: '2026-07-27T18:00:00Z',
    end: '2026-07-27T20:00:00Z',
    location: { lat: 0, lng: 0 },
    state,
  } as Event;
}

describe('buildSections', () => {
  it('returns an empty array when there are no events', () => {
    expect(buildSections([])).toEqual([]);
  });

  it('only emits sections that have at least one event', () => {
    const sections = buildSections([ev('a', 'upcoming'), ev('b', 'upcoming')]);
    expect(sections).toHaveLength(1);
    expect(sections[0].state).toBe('upcoming');
    expect(sections[0].data.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('orders sections as now → upcoming → finished regardless of input order', () => {
    const sections = buildSections([
      ev('f', 'finished'),
      ev('u', 'upcoming'),
      ev('n', 'now'),
    ]);
    expect(sections.map((s) => s.state)).toEqual([
      'now',
      'upcoming',
      'finished',
    ]);
  });

  it('preserves the original order of events within each section', () => {
    const sections = buildSections([
      ev('u1', 'upcoming'),
      ev('u2', 'upcoming'),
      ev('u3', 'upcoming'),
    ]);
    expect(sections[0].data.map((e) => e.id)).toEqual(['u1', 'u2', 'u3']);
  });

  it('skips the now section when there are no live events', () => {
    const sections = buildSections([ev('f', 'finished'), ev('u', 'upcoming')]);
    expect(sections.map((s) => s.state)).toEqual(['upcoming', 'finished']);
  });
});
