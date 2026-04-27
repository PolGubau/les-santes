import type { RawEvent } from "@/entities/event";
import { useAgenda } from "@/features/agenda";
import { useMemo } from "react";

/**
 * Map-specific event hook.
 * - mapEvents:    all events of the selected day — 'finished' ones shown dimmed
 * - drawerEvents: all events of the selected day (including 'finished') — shown in list
 * - rest:         day navigation from useAgenda
 */
export function useMapEvents(events: RawEvent[]) {
	const agenda = useAgenda(events);

	// Include finished events so the map is never empty — they render with reduced opacity
	const mapEvents = useMemo(() => agenda.filtered, [agenda.filtered]);

	return {
		...agenda,
		mapEvents,
		drawerEvents: agenda.filtered,
	};
}
