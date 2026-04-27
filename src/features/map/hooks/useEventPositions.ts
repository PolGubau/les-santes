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
			.filter(
				(e) =>
					e.kind === "mobile" && Array.isArray(e.route) && e.route.length > 0,
			)
			.flatMap((e) => {
				// route existence guaranteed by filter above
				const pos = interpolatePosition(
					e.route as NonNullable<typeof e.route>,
					e.start,
					e.end,
				);
				if (!pos) return [];
				return [{ eventId: e.id, position: pos }];
			});
	}, [events]);
}
