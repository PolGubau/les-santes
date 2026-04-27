import type { Event, RawEvent } from "@/entities/event";
import { withState } from "@/entities/event";
import { useNow } from "@/shared/hooks";
import { useMemo } from "react";

export interface NowEventsResult {
	now: Event[];
	upcoming: Event[];
}

export function useNowEvents(events: RawEvent[]): NowEventsResult {
	const now = useNow(15_000);

	return useMemo(() => {
		const withStates = events.map((e) => withState(e, now));
		return {
			now: withStates.filter((e) => e.state === "now"),
			upcoming: withStates.filter((e) => e.state === "upcoming").slice(0, 4),
		};
	}, [events, now]);
}
