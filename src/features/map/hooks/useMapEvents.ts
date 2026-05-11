import type { RawEvent } from "@/entities/event";
import { useAgenda } from "@/features/agenda";
import { useMemo } from "react";

/**
 * Map-specific event hook.
 * - mapEvents:    all events of the selected day (finished ones render dimmed)
 * - drawerEvents: same set used in the list drawer
 * - liveCount:    mobile events currently happening (badge on header)
 * - rest:         day navigation from useAgenda
 */
export function useMapEvents(events: RawEvent[]) {
	const agenda = useAgenda(events);

	const mapEvents = useMemo(() => agenda.filtered, [agenda.filtered]);

	const liveCount = useMemo(
		() => mapEvents.filter((e) => e.kind === 'mobile' && e.state === 'now').length,
		[mapEvents],
	);

	return {
		...agenda,
		mapEvents,
		drawerEvents: agenda.filtered,
		liveCount,
	};
}
