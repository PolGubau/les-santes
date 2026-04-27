import type {
	Event,
	EventCategory,
	EventType,
	RawEvent,
} from "@/entities/event";
import { withState } from "@/entities/event";
import { useNow } from "@/shared/hooks";
import { toDateKey } from "@/shared/lib";
import { useMemo, useState } from "react";

export interface AgendaFilters {
	type?: EventType;
	category?: EventCategory;
}

export function useAgenda(events: RawEvent[]) {
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
		return events
			.map((e) => withState(e, now))
			.filter((e) => {
				if (toDateKey(new Date(e.start)) !== effectiveDay) return false;
				if (filters.type && e.type !== filters.type) return false;
				if (filters.category && e.category !== filters.category) return false;
				return true;
			})
			.sort(
				(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
			);
	}, [events, filters, now, effectiveDay]);

	const setType = (type: EventType | undefined) =>
		setFilters((f) => ({ ...f, type }));

	const setCategory = (category: EventCategory | undefined) =>
		setFilters((f) => ({ ...f, category }));

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
		clearFilters,
	};
}
