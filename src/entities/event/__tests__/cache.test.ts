import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CACHE_MAX_AGE_MS,
  readEventCache,
  writeEventCache,
} from '@/entities/event/cache';
import type { RawEvent } from '@/entities/event/types';

const CACHE_KEY = '@les-santes/events-v1';

// Minimal RawEvent fixture; only id/title are asserted on, the rest is
// shape-only to keep the cache test independent of the entity schema.
const sample: RawEvent[] = [
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { id: 'e1', title: 'Cercavila', start_at: '2026-07-27T18:00:00Z' } as any,
];

describe('event cache', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.restoreAllMocks();
  });

  it('returns null when nothing is cached', async () => {
    expect(await readEventCache()).toBeNull();
  });

  it('round-trips data through writeEventCache / readEventCache', async () => {
    await writeEventCache(sample);
    const cached = await readEventCache();
    expect(cached).not.toBeNull();
    expect(cached?.data).toEqual(sample);
    expect(typeof cached?.timestamp).toBe('number');
    expect(cached?.isStale).toBe(false);
  });

  it('marks payload as stale once older than CACHE_MAX_AGE_MS', async () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    await writeEventCache(sample);

    // Advance "now" past the TTL
    jest.spyOn(Date, 'now').mockReturnValue(now + CACHE_MAX_AGE_MS + 1);
    const cached = await readEventCache();
    expect(cached?.isStale).toBe(true);
    // Stale data must still be returned so the UI can fall back to it offline
    expect(cached?.data).toEqual(sample);
  });

  it('returns null on corrupt JSON', async () => {
    await AsyncStorage.setItem(CACHE_KEY, '{not valid json');
    expect(await readEventCache()).toBeNull();
  });

  it('returns null on payload with wrong shape', async () => {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: 'not-an-array', timestamp: Date.now() }),
    );
    expect(await readEventCache()).toBeNull();
  });

  it('returns null when timestamp is missing', async () => {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data: sample }));
    expect(await readEventCache()).toBeNull();
  });

  it('writeEventCache swallows storage errors silently', async () => {
    jest
      .spyOn(AsyncStorage, 'setItem')
      .mockRejectedValueOnce(new Error('disk full'));
    await expect(writeEventCache(sample)).resolves.toBeUndefined();
  });
});
