/**
 * track() must be fire-and-forget: never throw, respect opt-out, and retry
 * once before dropping the event.
 */

// Mock the Supabase getter BEFORE importing track so the module picks it up.
// Jest only allows variables prefixed with `mock` inside jest.mock() factories.
const mockInsert = jest.fn();
jest.mock('@/shared/lib/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: () => ({ insert: mockInsert }),
  })),
}));

import { track } from '@/features/analytics/lib/track';
import { useAnalyticsStore } from '@/features/analytics/store/useAnalyticsStore';
import { getSupabaseClient } from '@/shared/lib/supabase';

const mockedGetClient = getSupabaseClient as jest.MockedFunction<
  typeof getSupabaseClient
>;

describe('analytics track()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockInsert.mockReset();
    mockedGetClient.mockImplementation(
      () =>
        ({
          from: () => ({ insert: mockInsert }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any,
    );
    // Reset opt-out flag and dedupe set between tests
    useAnalyticsStore.setState({ isEnabled: true, _seen: {} });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('no-ops when the user has opted out', () => {
    useAnalyticsStore.setState({ isEnabled: false });
    mockInsert.mockResolvedValue({ error: null });

    track('app_open');

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('fires an insert with the expected row shape when enabled', () => {
    mockInsert.mockResolvedValue({ error: null });

    track('event_view', { id: 'e1' });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    const row = mockInsert.mock.calls[0][0];
    expect(row).toMatchObject({
      event_name: 'event_view',
      properties: { id: 'e1' },
    });
    expect(row.install_id).toEqual(expect.any(String));
    expect(row.session_id).toEqual(expect.any(String));
    expect(row.festival_id).toEqual(expect.any(String));
  });

  it('dedupes when the same `once` key is used twice', () => {
    mockInsert.mockResolvedValue({ error: null });

    track('nudge_shown', {}, { once: 'rating' });
    track('nudge_shown', {}, { once: 'rating' });

    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('retries once after RETRY_DELAY_MS when supabase returns an error', async () => {
    mockInsert
      .mockResolvedValueOnce({ error: { message: 'network' } })
      .mockResolvedValueOnce({ error: null });

    track('app_open');
    // First attempt fires synchronously
    expect(mockInsert).toHaveBeenCalledTimes(1);

    // Flush microtasks for the first .then() to schedule the retry
    await Promise.resolve();
    await Promise.resolve();
    jest.advanceTimersByTime(2_000);

    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it('does not throw when getSupabaseClient blows up', () => {
    mockedGetClient.mockImplementationOnce(() => {
      throw new Error('env missing');
    });

    expect(() => track('app_open')).not.toThrow();
  });
});
