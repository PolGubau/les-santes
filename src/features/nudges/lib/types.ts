/**
 * Identifiers for every nudge in the app. Add a new entry here and in
 * `registry.ts` to introduce a new nudge — nothing else changes.
 */
export type NudgeId =
	| "agenda.emptyFiltered.now"
	| "agenda.emptyFavorites.explore"
	| "map.firstVisit.movement"
	| "ara.suggestAgenda"
	| "event.suggestMap"
	| "event.suggestFavorite"
	| "feedback.askEngaged";

/**
 * Per‑nudge configuration. The registry is purely declarative; the engine
 * decides when to show based on these fields plus the persisted state.
 */
export interface NudgeConfig {
	id: NudgeId;
	/** Max times this nudge can ever be shown to the same user. */
	maxShows: number;
	/** Minimum delay between two successive shows (ms). */
	cooldownMs: number;
	/** Higher = shown first when several are eligible on the same screen. */
	priority: number;
	/** Short human description — only for documentation/debugging. */
	description: string;
}

/** Persisted state for a single nudge. */
export interface NudgeState {
	shownCount: number;
	lastShownTs: number;
	dismissed: boolean;
	completed: boolean;
}

export const DEFAULT_NUDGE_STATE: NudgeState = {
	shownCount: 0,
	lastShownTs: 0,
	dismissed: false,
	completed: false,
};
