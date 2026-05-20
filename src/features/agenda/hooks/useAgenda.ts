import type {
	Event,
	EventCategory,
	EventType,
	RawEvent,
} from "@/entities/event";
import { withState } from "@/entities/event";
import type { UserCoords } from "@/shared/hooks";
import { useNow } from "@/shared/hooks";
import { haversineDistance, toDateKey, toFestivalDayKey } from "@/shared/lib";
import { useMemo, useState } from "react";

function applyFilters(
	events: Event[],
	filters: AgendaFilters,
	userCoords: UserCoords | null | undefined,
	favoriteIds?: Set<string>,
): Event[] {
	const q = filters.search?.trim().toLowerCase();
	let result = events.filter((e) => {
		if (q && !e.title.toLowerCase().includes(q) && !(e.shortDescription?.toLowerCase().includes(q))) return false;
		if (filters.onlyFavorites && !favoriteIds?.has(e.id)) return false;
		if (filters.type && e.type !== filters.type) return false;
		if (filters.category && e.category !== filters.category) return false;
		if (filters.nearMe && userCoords && e.kind === "static" && e.location) {
			if (
				haversineDistance(
					userCoords.lat,
					userCoords.lng,
					e.location.lat,
					e.location.lng,
				) > NEAR_ME_RADIUS_M
			)
				return false;
		}
		return true;
	});

	if (filters.nearMe && userCoords) {
		result = result.sort((a, b) => {
			const d = (e: Event) =>
				e.kind === "static" && e.location
					? haversineDistance(
							userCoords.lat,
							userCoords.lng,
							e.location.lat,
							e.location.lng,
						)
					: Number.POSITIVE_INFINITY;
			return d(a) - d(b);
		});
	} else {
		result = result.sort(
			(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
		);
	}
	return result;
}

const NEAR_ME_RADIUS_M = 600;

export interface AgendaFilters {
	search?: string;
	type?: EventType;
	category?: EventCategory;
	nearMe?: boolean;
	onlyFavorites?: boolean;
}

export function useAgenda(
	events: RawEvent[],
	userCoords?: UserCoords | null,
	favoriteIds?: Set<string>,
) {
	const now = useNow();
	const nowKey = toFestivalDayKey(now);
	const [filters, setFilters] = useState<AgendaFilters>({});
	const [selectedDay, setDay] = useState<string>(nowKey);

	/** All days that have at least one event, sorted ascending */
	const availableDays = useMemo(() => {
		const keys = new Set(events.map((e) => toFestivalDayKey(new Date(e.start))));
		return Array.from(keys).sort();
	}, [events]);

	/**
	 * If the selected day has no events (e.g. before festival starts),
	 * fall back to the closest available day.
	 */
	const effectiveDay = useMemo(() => {
		if (availableDays.includes(selectedDay)) return selectedDay;
		if (availableDays.length === 0) return selectedDay;
		const nowMs = now.getTime();
		return availableDays.reduce((best, day) =>
			Math.abs(new Date(day).getTime() - nowMs) <
			Math.abs(new Date(best).getTime() - nowMs)
				? day
				: best,
		);
	}, [availableDays, selectedDay, now]);

	/** All events enriched with current state, not yet day-filtered */
	const withStates = useMemo(
		() => events.map((e) => withState(e, now)),
		[events, now],
	);

	/**
	 * Filtered events for the currently selected day only.
	 * Computing all days at once was wasteful — only the active day is rendered.
	 */
	const filtered = useMemo((): Event[] => {
		const forDay = withStates.filter(
			(e) => toFestivalDayKey(new Date(e.start)) === effectiveDay,
		);
		return applyFilters(forDay, filters, userCoords, favoriteIds);
	}, [withStates, effectiveDay, filters, userCoords, favoriteIds]);

	/**
	 * Full map (unfiltered) used by DayPicker counts and AgendaList pagination.
	 * Kept separate so switching days doesn't trigger a full filter recompute.
	 */
	const filteredByDay = useMemo((): Map<string, Event[]> => {
		const map = new Map<string, Event[]>();
		for (const day of availableDays) {
			const forDay = withStates.filter(
				(e) => toFestivalDayKey(new Date(e.start)) === day,
			);
			map.set(day, applyFilters(forDay, filters, userCoords, favoriteIds));
		}
		return map;
	}, [withStates, availableDays, filters, userCoords, favoriteIds]);

	/** Count of favorites in the currently selected day (ignores the onlyFavorites filter). */
	const dayFavoriteCount = useMemo(() => {
		if (!favoriteIds || favoriteIds.size === 0) return 0;
		return withStates.filter(
			(e) =>
				toFestivalDayKey(new Date(e.start)) === effectiveDay &&
				favoriteIds.has(e.id),
		).length;
	}, [withStates, effectiveDay, favoriteIds]);

	const setSearch = (search: string) => setFilters((f) => ({ ...f, search: search || undefined }));
	const setType = (type: EventType | undefined) => setFilters((f) => ({ ...f, type }));
	const setCategory = (category: EventCategory | undefined) => setFilters((f) => ({ ...f, category }));
	const toggleNearMe = () => setFilters((f) => ({ ...f, nearMe: !f.nearMe }));
	const toggleFavorites = () => setFilters((f) => ({ ...f, onlyFavorites: !f.onlyFavorites }));
	const clearFilters = () => setFilters({});

	return {
		filtered,
		filteredByDay,
		filters,
		selectedDay: effectiveDay,
		availableDays,
		todayKey: nowKey,
		dayFavoriteCount,
		setDay,
		setSearch,
		setType,
		setCategory,
		toggleNearMe,
		toggleFavorites,
		clearFilters,
	};
}
