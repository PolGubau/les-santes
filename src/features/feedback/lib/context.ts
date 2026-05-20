import { useFavoritesStore } from "@/features/favorites";
import { useNudgeStore } from "@/features/nudges";
import type { FeedbackContext } from "./types";

/**
 * App-wide session start. Set on module load (first JS evaluation), which
 * for Expo apps coincides with app launch. Not persisted on purpose — every
 * cold start resets the timer.
 */
const SESSION_START = Date.now();

/**
 * Build the runtime context attached to every feedback submission. Reads
 * counters directly from the existing nudges/favorites stores so there is
 * no double-bookkeeping.
 */
export function buildFeedbackContext(route?: string): FeedbackContext {
	const behavior = useNudgeStore.getState().behavior;
	const favorites = useFavoritesStore.getState().favorites;
	return {
		route,
		sessionSeconds: Math.max(0, Math.floor((Date.now() - SESSION_START) / 1000)),
		favoritesCount: Object.keys(favorites).length,
		appOpens: behavior.appOpens,
		eventViews: behavior.eventViews,
		mapVisits: behavior.mapVisits,
		agendaVisits: behavior.agendaVisits,
	};
}
