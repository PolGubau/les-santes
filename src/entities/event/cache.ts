/**
 * Local persistence for event data.
 * Stores RawEvent[] so state can be recomputed with the current clock on restore.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RawEvent } from './types';

const CACHE_KEY = '@les-santes/events-v1';

/**
 * Cache considered stale (but still usable) past this age.
 * 24h is comfortable for a festival app: data rarely changes mid-day, and
 * the network fetch fires anyway on every mount / foreground / interval.
 */
export const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface CachePayload {
  data: RawEvent[];
  timestamp: number;
}

export interface CacheReadResult extends CachePayload {
  /** True when the payload is older than CACHE_MAX_AGE_MS. */
  isStale: boolean;
}

export async function readEventCache(): Promise<CacheReadResult | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachePayload;
    if (!parsed || !Array.isArray(parsed.data) || typeof parsed.timestamp !== 'number') {
      return null;
    }
    return {
      ...parsed,
      isStale: Date.now() - parsed.timestamp > CACHE_MAX_AGE_MS,
    };
  } catch {
    return null;
  }
}

export async function writeEventCache(events: RawEvent[]): Promise<void> {
  try {
    const payload: CachePayload = { data: events, timestamp: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Non-fatal — cache write failure should never crash the app
  }
}
