/**
 * useAgenda orchestrates every agenda filter in the app: search, type,
 * category, favorites, near-me radius + sort, and the day fallback when
 * the picked day has no events. Each branch is exercised here so a copy/
 * paste bug or a flipped boolean doesn't ship silently.
 *
 * `useNow` is frozen in dev mode to 2026-07-27T19:00:00 (see useNow.ts),
 * so all sample events live on that festival day unless noted.
 */
import { act, renderHook } from '@testing-library/react-native';
import { useAgenda } from '@/features/agenda/hooks/useAgenda';
import type { RawEvent } from '@/entities/event';

// Plaça de l'Ajuntament (Mataró) — used as user location for near-me tests.
const USER = { lat: 41.5388, lng: 2.4448 };
// ~50 m away, well inside the 600 m radius.
const NEAR = { lat: 41.5392, lng: 2.4452 };
// ~5 km away, far outside.
const FAR = { lat: 41.58, lng: 2.5 };

function ev(partial: Partial<RawEvent> & { id: string }): RawEvent {
  return {
    id: partial.id,
    title: partial.title ?? partial.id,
    type: partial.type ?? 'altres',
    category: partial.category ?? 'cultural',
    kind: 'static',
    shortDescription: partial.shortDescription ?? '',
    start: partial.start ?? '2026-07-27T18:00:00Z',
    end: partial.end ?? '2026-07-27T20:00:00Z',
    location: partial.location ?? NEAR,
    ...partial,
  } as RawEvent;
}

describe('useAgenda — search filter', () => {
  it('matches against title (case-insensitive) and trims input', () => {
    const events = [
      ev({ id: 'a', title: 'Cercavila Petita' }),
      ev({ id: 'b', title: 'Correfoc' }),
    ];
    const { result } = renderHook(() => useAgenda(events));

    act(() => result.current.setSearch('  CERCAvila  '));
    expect(result.current.filtered.map((e) => e.id)).toEqual(['a']);
  });

  it('also matches against shortDescription', () => {
    const events = [
      ev({ id: 'a', title: 'A', shortDescription: 'fest with foc' }),
      ev({ id: 'b', title: 'B', shortDescription: 'nothing' }),
    ];
    const { result } = renderHook(() => useAgenda(events));
    act(() => result.current.setSearch('foc'));
    expect(result.current.filtered.map((e) => e.id)).toEqual(['a']);
  });

  it('clears when set to empty string', () => {
    const events = [ev({ id: 'a' }), ev({ id: 'b' })];
    const { result } = renderHook(() => useAgenda(events));
    act(() => result.current.setSearch('xyz'));
    expect(result.current.filtered).toHaveLength(0);
    act(() => result.current.setSearch(''));
    expect(result.current.filtered).toHaveLength(2);
  });
});

describe('useAgenda — type & category filters', () => {
  it('filters by exact type', () => {
    const events = [
      ev({ id: 'a', type: 'cercavila' }),
      ev({ id: 'b', type: 'concert' }),
    ];
    const { result } = renderHook(() => useAgenda(events));
    act(() => result.current.setType('concert'));
    expect(result.current.filtered.map((e) => e.id)).toEqual(['b']);
  });

  it('filters by exact category and AND-combines with type', () => {
    const events = [
      ev({ id: 'a', type: 'cercavila', category: 'tradicional' }),
      ev({ id: 'b', type: 'cercavila', category: 'cultural' }),
      ev({ id: 'c', type: 'concert', category: 'cultural' }),
    ];
    const { result } = renderHook(() => useAgenda(events));
    act(() => {
      result.current.setType('cercavila');
      result.current.setCategory('cultural');
    });
    expect(result.current.filtered.map((e) => e.id)).toEqual(['b']);
  });

  it('clearFilters resets every active filter', () => {
    const events = [ev({ id: 'a' }), ev({ id: 'b' })];
    const { result } = renderHook(() => useAgenda(events));
    act(() => {
      result.current.setSearch('something');
      result.current.setType('concert');
    });
    expect(result.current.filtered).toHaveLength(0);
    act(() => result.current.clearFilters());
    expect(result.current.filters).toEqual({});
    expect(result.current.filtered).toHaveLength(2);
  });
});

describe('useAgenda — near-me radius & sort', () => {
  it('drops static events farther than 600 m and sorts the rest by distance', () => {
    const events = [
      ev({ id: 'far', location: FAR }),
      ev({ id: 'near', location: NEAR }),
    ];
    const { result } = renderHook(() => useAgenda(events, USER));
    act(() => result.current.toggleNearMe());
    expect(result.current.filtered.map((e) => e.id)).toEqual(['near']);
  });

  it('default ordering (without near-me) is chronological by start', () => {
    const events = [
      ev({ id: 'late', start: '2026-07-27T22:00:00Z' }),
      ev({ id: 'early', start: '2026-07-27T10:00:00Z' }),
    ];
    const { result } = renderHook(() => useAgenda(events));
    expect(result.current.filtered.map((e) => e.id)).toEqual(['early', 'late']);
  });
});

describe('useAgenda — favorites filter', () => {
  it('only emits events in the favoriteIds set when onlyFavorites is on', () => {
    const events = [ev({ id: 'a' }), ev({ id: 'b' }), ev({ id: 'c' })];
    const favoriteIds = new Set(['b']);
    const { result } = renderHook(() => useAgenda(events, null, favoriteIds));
    act(() => result.current.toggleFavorites());
    expect(result.current.filtered.map((e) => e.id)).toEqual(['b']);
  });

  it('dayFavoriteCount counts favorites in the current day regardless of filter', () => {
    const events = [ev({ id: 'a' }), ev({ id: 'b' }), ev({ id: 'c' })];
    const favoriteIds = new Set(['a', 'c']);
    const { result } = renderHook(() => useAgenda(events, null, favoriteIds));
    expect(result.current.dayFavoriteCount).toBe(2);
  });
});

describe('useAgenda — day fallback', () => {
  it('falls back to the closest available day when selected has no events', () => {
    // Single event on a later day than the frozen now (2026-07-27).
    const events = [ev({ id: 'a', start: '2026-07-28T18:00:00Z' })];
    const { result } = renderHook(() => useAgenda(events));
    // selectedDay (festival-key) for the frozen now is 2026-07-27.
    // No events on 2026-07-27 → effectiveDay falls to 2026-07-28.
    expect(result.current.selectedDay).toBe('2026-07-28');
    expect(result.current.filtered.map((e) => e.id)).toEqual(['a']);
  });

  it('availableDays is sorted ascending and de-duplicated', () => {
    const events = [
      ev({ id: 'a', start: '2026-07-29T18:00:00Z' }),
      ev({ id: 'b', start: '2026-07-27T18:00:00Z' }),
      ev({ id: 'c', start: '2026-07-27T20:00:00Z' }),
    ];
    const { result } = renderHook(() => useAgenda(events));
    expect(result.current.availableDays).toEqual(['2026-07-27', '2026-07-29']);
  });
});
