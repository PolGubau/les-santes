import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { readEventCache, writeEventCache } from "../cache";
import { eventRepository } from "../repository";
import { withState } from "../state";
import type { Event, RawEvent } from "../types";

/** How often (ms) to auto-refresh events while the app is in foreground. */
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export interface UseEventsResult {
	events: Event[];
	/** True only during the initial fetch when no cache is available. */
	loading: boolean;
	/** Last fetch error, if any. Cleared on next successful fetch. */
	error: Error | null;
	/** True when the last fetch failed and data is being served from cache. */
	isOffline: boolean;
	/** True while a non-initial fetch (manual refresh, interval, foreground) is in flight. */
	isRefreshing: boolean;
	/** True when cached data is older than CACHE_MAX_AGE_MS (still usable, but flagged). */
	isStale: boolean;
	/** Timestamp (ms) of the last successful cache write, or null if no cache yet. */
	cacheTimestamp: number | null;
	refresh: () => void;
}

/**
 * Stale-while-revalidate events hook.
 *
 * 1. Immediately restore cached events (no loading spinner when cache hits).
 * 2. Fetch fresh data in the background; update cache on success.
 * 3. If fetch fails, keep cached data and mark `isOffline = true`.
 * 4. `refresh()` forces a new fetch (pull-to-refresh).
 *
 * Concurrency: a monotonically increasing `requestId` deduplicates overlapping
 * fetches — only the most recent in-flight request is allowed to commit state.
 * This prevents stale responses from clobbering newer ones if the user pulls
 * to refresh while a previous fetch is still pending.
 */
export function useEvents(): UseEventsResult {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [isOffline, setIsOffline] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isStale, setIsStale] = useState(false);
	const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(null);
	const [tick, setTick] = useState(0);

	// Refs are read inside async callbacks without triggering re-renders or stale closures.
	const hasCachedData = useRef(false);
	const latestRequestId = useRef(0);
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	// Restore cache once on mount (independent of tick).
	useEffect(() => {
		readEventCache().then((cached) => {
			if (!isMounted.current || !cached || hasCachedData.current) return;
			hasCachedData.current = true;
			const now = new Date();
			setEvents(cached.data.map((e) => withState(e, now)));
			setCacheTimestamp(cached.timestamp);
			setIsStale(cached.isStale);
			setLoading(false);
		});
	}, []);

	// Network fetch — re-runs on every tick (initial mount + manual refresh + interval + foreground).
	useEffect(() => {
		const requestId = ++latestRequestId.current;
		const isLatest = () => isMounted.current && latestRequestId.current === requestId;

		if (!hasCachedData.current) {
			setLoading(true);
		} else {
			setIsRefreshing(true);
		}
		setError(null);

		eventRepository
			.getAll()
			.then((data) => {
				if (!isLatest()) return;
				hasCachedData.current = true;
				setEvents(data);
				setIsOffline(false);
				setIsStale(false);
				setLoading(false);
				setIsRefreshing(false);
				const rawEvents: RawEvent[] = data.map(
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					({ state: _state, ...rest }) => rest as RawEvent,
				);
				writeEventCache(rawEvents).then(() => {
					if (isLatest()) setCacheTimestamp(Date.now());
				});
			})
			.catch((err: unknown) => {
				if (!isLatest()) return;
				const e = err instanceof Error ? err : new Error(String(err));
				setError(e);
				setIsOffline(hasCachedData.current);
				setLoading(false);
				setIsRefreshing(false);
			});
	}, [tick]);

	const refresh = useCallback(() => setTick((t) => t + 1), []);

	// Auto-refresh every AUTO_REFRESH_INTERVAL_MS while in foreground + on foreground transitions.
	useEffect(() => {
		const intervalId = setInterval(() => {
			if (AppState.currentState === 'active') {
				setTick((t) => t + 1);
			}
		}, AUTO_REFRESH_INTERVAL_MS);

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

	return { events, loading, error, isOffline, isRefreshing, isStale, cacheTimestamp, refresh };
}
