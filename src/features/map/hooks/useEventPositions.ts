import type { Event, RoutePoint } from "@/entities/event";
import { useNow } from "@/shared/hooks";
import { interpolatePosition } from "@/shared/lib";
import { useMemo } from "react";

export interface MobilePosition {
	eventId: string;
	position: RoutePoint;
}

export function useEventPositions(events: Event[]): MobilePosition[] {
	useNow(5_000); // re-render every 5 s

	return useMemo(() => {
		return events
			.filter((e): e is Extract<typeof e, { kind: 'mobile' }> =>
				e.kind === "mobile" && e.route.length > 0,
			)
			.flatMap((e) => {
				const pos = interpolatePosition(e.route, e.start, e.end);
				if (!pos) return [];
				return [{ eventId: e.id, position: pos }];
			});
	}, [events]);
}
