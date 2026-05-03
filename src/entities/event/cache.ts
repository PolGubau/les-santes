/**
 * Local persistence for event data.
 * Stores RawEvent[] so state can be recomputed with the current clock on restore.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RawEvent } from './types';

const CACHE_KEY = '@les-santes/events-v1';

interface CachePayload {
  data: RawEvent[];
  timestamp: number;
}

export async function readEventCache(): Promise<CachePayload | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachePayload;
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
