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

const NEAR_ME_RADIUS_M = 600;

export interface AgendaFilters {
	type?: EventType;
	category?: EventCategory;
	nearMe?: boolean;
}

export function useAgenda(events: RawEvent[], userCoords?: UserCoords | null) {
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

	const filtered = useMemo((): Event[] => {
		const withStates = events.map((e) => withState(e, now));

		let result = withStates.filter((e) => {
			if (toDateKey(new Date(e.start)) !== effectiveDay) return false;
			if (filters.type && e.type !== filters.type) return false;
			if (filters.category && e.category !== filters.category) return false;
			if (filters.nearMe && userCoords && e.kind === "static" && e.location) {
				const d = haversineDistance(
					userCoords.lat,
					userCoords.lng,
					e.location.lat,
					e.location.lng,
				);
				if (d > NEAR_ME_RADIUS_M) return false;
			}
			return true;
		});

		if (filters.nearMe && userCoords) {
			result = result.sort((a, b) => {
				const distA =
					a.kind === "static" && a.location
						? haversineDistance(
								userCoords.lat,
								userCoords.lng,
								a.location.lat,
								a.location.lng,
							)
						: Number.POSITIVE_INFINITY;
				const distB =
					b.kind === "static" && b.location
						? haversineDistance(
								userCoords.lat,
								userCoords.lng,
								b.location.lat,
								b.location.lng,
							)
						: Number.POSITIVE_INFINITY;
				return distA - distB;
			});
		} else {
			result = result.sort(
				(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
			);
		}

		return result;
	}, [events, filters, now, effectiveDay, userCoords]);

	const setType = (type: EventType | undefined) =>
		setFilters((f) => ({ ...f, type }));

	const setCategory = (category: EventCategory | undefined) =>
		setFilters((f) => ({ ...f, category }));

	const toggleNearMe = () => setFilters((f) => ({ ...f, nearMe: !f.nearMe }));

	const clearFilters = () => setFilters({});

	return {
		filtered,
		filters,
		selectedDay: effectiveDay,
		availableDays,
		todayKey: nowKey,
		setDay,
		setType,
		setCategory,
		toggleNearMe,
		clearFilters,
	};
}
