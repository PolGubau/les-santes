import type { RoutePoint } from "@/entities/event";

/**
 * Interpolates a position along a route based on elapsed time.
 * Returns null if event hasn't started or has finished.
 */
export function interpolatePosition(
	route: RoutePoint[],
	startISO: string,
	durationMinutes: number,
): RoutePoint | null {
	if (route.length < 2) return route[0] ?? null;

	const now = Date.now();
	const start = new Date(startISO).getTime();
	const end = start + durationMinutes * 60 * 1000;

	if (now < start || now > end) return null;

	const progress = (now - start) / (end - start); // 0..1
	const totalSegments = route.length - 1;
	const segmentFloat = progress * totalSegments;
	const segmentIndex = Math.min(Math.floor(segmentFloat), totalSegments - 1);
	const segmentProgress = segmentFloat - segmentIndex;

	const from = route[segmentIndex];
	const to = route[segmentIndex + 1];

	return {
		lat: from.lat + (to.lat - from.lat) * segmentProgress,
		lng: from.lng + (to.lng - from.lng) * segmentProgress,
	};
}
