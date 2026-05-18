import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { readEventCache, writeEventCache } from "../cache";
import { eventRepository } from "../repository";
import { withState } from "../state";
import type { Event, RawEvent } from "../types";

/** How often (ms) to auto-refresh events while the app is in foreground. */
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export interface UseEventsResult {
	events: Event[];
	loading: boolean;
	error: Error | null;
	/** True when the last network fetch failed and data comes from cache. */
	isOffline: boolean;
	/** True while a manual refresh fetch is in progress. */
	isRefreshing: boolean;
	/** Timestamp (ms) of the last successful cache write, or null if no cache. */
	cacheTimestamp: number | null;
	refresh: () => void;
}

/**
 * Stale-while-revalidate events hook.
 *
 * 1. Immediately restore cached events (no loading spinner if cache hits).
 * 2. Fetch fresh data in the background; update cache on success.
 * 3. If fetch fails, keep cached data and mark `isOffline = true`.
 * 4. `refresh()` forces a new fetch (pull-to-refresh).
 */
export function useEvents(): UseEventsResult {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [isOffline, setIsOffline] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(null);
	const [tick, setTick] = useState(0);
	// Track whether we already have data so we can skip loading spinner on refresh
	const hasCachedData = useRef(false);

	// Restore cache once on mount (independent of tick)
	useEffect(() => {
		readEventCache().then((cached) => {
			if (!cached || hasCachedData.current) return;
			hasCachedData.current = true;
			const now = new Date();
			setEvents(cached.data.map((e) => withState(e, now)));
			setCacheTimestamp(cached.timestamp);
			setLoading(false);
		});
	}, []);

	// Network fetch — re-runs on every tick (manual refresh)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		let cancelled = false;
		if (!hasCachedData.current) {
			setLoading(true);
		} else {
			// Manual refresh with cached data: show refreshing spinner
			setIsRefreshing(true);
		}
		setError(null);

		eventRepository
			.getAll()
			.then((data) => {
				if (cancelled) return;
				hasCachedData.current = true;
				setEvents(data);
				setIsOffline(false);
				setLoading(false);
				setIsRefreshing(false);
				const rawEvents: RawEvent[] = data.map(
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					({ state: _state, ...rest }) => rest as RawEvent,
				);
				writeEventCache(rawEvents).then(() => {
					setCacheTimestamp(Date.now());
				});
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				const e = err instanceof Error ? err : new Error(String(err));
				setError(e);
				setIsOffline(hasCachedData.current);
				setLoading(false);
				setIsRefreshing(false);
			});

		return () => {
			cancelled = true;
		};
	}, [tick]);

	const refresh = () => setTick((t) => t + 1);

	// Auto-refresh every AUTO_REFRESH_INTERVAL_MS while in foreground
	useEffect(() => {
		const intervalId = setInterval(() => {
			if (AppState.currentState === 'active') {
				setTick((t) => t + 1);
			}
		}, AUTO_REFRESH_INTERVAL_MS);

		// Also refresh when the app comes back to foreground after being backgrounded
		const handleAppStateChange = (nextState: AppStateStatus) => {
			if (nextState === 'active') {
				setTick((t) => t + 1);
			}
		};
		const subscription = AppState.addEventListener('change', handleAppStateChange);

		return () => {
			clearInterval(intervalId);
			subscription.remove();
		};
	}, []);

	return { events, loading, error, isOffline, isRefreshing, cacheTimestamp, refresh };
}
