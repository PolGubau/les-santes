import type {
	Event,
	EventCategory,
	EventType,
	RawEvent,
} from "@/entities/event";
import { withState } from "@/entities/event";
import type { UserCoords } from "@/shared/hooks";
import { useNow } from "@/shared/hooks";
import { haversineDistance, toDateKey } from "@/shared/lib";
import { useMemo, useState } from "react";

function applyFilters(
	events: Event[],
	filters: AgendaFilters,
	userCoords: UserCoords | null | undefined,
	favoriteIds?: Set<string>,
): Event[] {
	let result = events.filter((e) => {
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
	const nowKey = toDateKey(now);
	const [filters, setFilters] = useState<AgendaFilters>({});
	const [selectedDay, setDay] = useState<string>(nowKey);

	/** All days that have at least one event, sorted ascending */
	const availableDays = useMemo(() => {
		const keys = new Set(events.map((e) => toDateKey(new Date(e.start))));
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

	/** Events grouped by day key, with type/nearMe filters applied */
	const filteredByDay = useMemo((): Map<string, Event[]> => {
		const map = new Map<string, Event[]>();
		for (const day of availableDays) {
			const forDay = withStates.filter(
				(e) => toDateKey(new Date(e.start)) === day,
			);
			map.set(day, applyFilters(forDay, filters, userCoords, favoriteIds));
		}
		return map;
	}, [withStates, availableDays, filters, userCoords, favoriteIds]);

	const filtered = useMemo(
		() => filteredByDay.get(effectiveDay) ?? [],
		[filteredByDay, effectiveDay],
	);

	const setType = (type: EventType | undefined) =>
		setFilters((f) => ({ ...f, type }));

	const setCategory = (category: EventCategory | undefined) =>
		setFilters((f) => ({ ...f, category }));

	const toggleNearMe = () => setFilters((f) => ({ ...f, nearMe: !f.nearMe }));

	const toggleFavorites = () =>
		setFilters((f) => ({ ...f, onlyFavorites: !f.onlyFavorites }));

	const clearFilters = () => setFilters({});

	return {
		filtered,
		filteredByDay,
		filters,
		selectedDay: effectiveDay,
		availableDays,
		todayKey: nowKey,
		setDay,
		setType,
		setCategory,
		toggleNearMe,
		toggleFavorites,
		clearFilters,
	};
}
