/**
 * useEvents is the single entry point for event data across the whole app.
 * Its three responsibilities are the ones most likely to regress silently:
 *
 *   1. Stale-while-revalidate — render cached events instantly on cold start.
 *   2. Offline fallback — keep cached data + flag isOffline when fetch fails.
 *   3. Race-safety — only the latest in-flight request may commit state.
 *
 * Long loadings (no cache + slow network) and offline mode are explicitly
 * exercised here.
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockGetAll = jest.fn();
jest.mock('@/entities/event/repository', () => ({
  eventRepository: {
    getAll: () => mockGetAll(),
    getById: jest.fn(),
  },
}));

import { useEvents } from '@/entities/event/hooks/useEvents';
import { writeEventCache } from '@/entities/event/cache';
import type { RawEvent } from '@/entities/event/types';

const sample = (id: string): RawEvent =>
  ({
    id,
    title: id,
    type: 'altres',
    category: 'cultural',
    kind: 'static',
    shortDescription: '',
    start: '2026-07-27T18:00:00Z',
    end: '2026-07-27T20:00:00Z',
    location: { lat: 0, lng: 0 },
  }) as RawEvent;

beforeEach(async () => {
  await AsyncStorage.clear();
  mockGetAll.mockReset();
});

describe('useEvents — happy path', () => {
  it('shows loading on cold start with no cache, then commits fresh data', async () => {
    mockGetAll.mockResolvedValue([sample('e1')]);

    const { result } = renderHook(() => useEvents());

    // Initial state: loading, empty list, no offline flag.
    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);
    expect(result.current.isOffline).toBe(false);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].id).toBe('e1');
    expect(result.current.error).toBeNull();
    expect(result.current.isOffline).toBe(false);
  });

  it('hydrates from cache before the network resolves (no spinner)', async () => {
    await writeEventCache([sample('cached')]);
    let resolve!: (v: RawEvent[]) => void;
    mockGetAll.mockReturnValue(
      new Promise<RawEvent[]>((res) => {
        resolve = res;
      }),
    );

    const { result } = renderHook(() => useEvents());

    // Cache hydration kicks off after mount — wait for it.
    await waitFor(() => expect(result.current.events).toHaveLength(1));
    expect(result.current.loading).toBe(false);
    expect(result.current.events[0].id).toBe('cached');

    // Resolve the network and ensure it replaces the cache.
    await act(async () => {
      resolve([sample('fresh')]);
    });
    await waitFor(() => expect(result.current.events[0].id).toBe('fresh'));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useEvents — offline & errors', () => {
  it('keeps cached data and flags isOffline when fetch fails after cache hydration', async () => {
    await writeEventCache([sample('cached')]);

    // Delay the network failure long enough for the cache read to commit
    // first — this mirrors the realistic order (AsyncStorage is faster than
    // the network, and the offline flag only makes sense when there's
    // something to fall back to).
    mockGetAll.mockImplementation(
      () =>
        new Promise<RawEvent[]>((_, reject) =>
          setTimeout(() => reject(new Error('network down')), 20),
        ),
    );

    const { result } = renderHook(() => useEvents());
    await waitFor(() => expect(result.current.events).toHaveLength(1));
    await waitFor(() => expect(result.current.isOffline).toBe(true));
    expect(result.current.events[0].id).toBe('cached');
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('does NOT flag isOffline when fetch fails with no cache (cold + no network)', async () => {
    mockGetAll.mockRejectedValue(new Error('no net + no cache'));

    const { result } = renderHook(() => useEvents());

    await waitFor(() => expect(result.current.error).not.toBeNull());
    // With no cached data, we don't have anything to fall back to — so
    // isOffline stays false (the UI shows an error empty-state instead).
    expect(result.current.isOffline).toBe(false);
    expect(result.current.events).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('clears the error flag on a successful refresh', async () => {
    mockGetAll.mockRejectedValueOnce(new Error('flaky'));
    mockGetAll.mockResolvedValueOnce([sample('recovered')]);

    const { result } = renderHook(() => useEvents());
    await waitFor(() => expect(result.current.error).not.toBeNull());

    await act(async () => {
      result.current.refresh();
    });
    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.events[0].id).toBe('recovered');
    expect(result.current.isOffline).toBe(false);
  });
});

describe('useEvents — race safety', () => {
  it('only the latest refresh wins when two fetches overlap', async () => {
    // Initial cache so the hook is past loading and we can refresh.
    await writeEventCache([sample('cached')]);

    let resolveFirst!: (v: RawEvent[]) => void;
    let resolveSecond!: (v: RawEvent[]) => void;
    mockGetAll
      .mockReturnValueOnce(
        new Promise<RawEvent[]>((res) => {
          resolveFirst = res;
        }),
      )
      .mockReturnValueOnce(
        new Promise<RawEvent[]>((res) => {
          resolveSecond = res;
        }),
      );

    const { result } = renderHook(() => useEvents());
    await waitFor(() => expect(result.current.events).toHaveLength(1));

    // Trigger a second fetch while the first is still pending.
    await act(async () => {
      result.current.refresh();
    });

    // Resolve second first, then the (now-stale) first. The first must NOT
    // overwrite the second's state.
    await act(async () => {
      resolveSecond([sample('second')]);
    });
    await act(async () => {
      resolveFirst([sample('first')]);
    });

    await waitFor(() => expect(result.current.isRefreshing).toBe(false));
    expect(result.current.events[0].id).toBe('second');
  });
});
