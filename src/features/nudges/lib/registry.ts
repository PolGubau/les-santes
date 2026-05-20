import type { NudgeConfig, NudgeId } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Declarative catalog of every nudge. Order doesn't matter — `priority`
 * is used to break ties when multiple nudges are eligible at once.
 */
export const NUDGE_REGISTRY: Record<NudgeId, NudgeConfig> = {
	"agenda.emptyFiltered.now": {
		id: "agenda.emptyFiltered.now",
		maxShows: 5,
		cooldownMs: 0,
		priority: 50,
		description: "Empty agenda with filters → suggest going to Ara tab.",
	},
	"agenda.emptyFavorites.explore": {
		id: "agenda.emptyFavorites.explore",
		maxShows: 5,
		cooldownMs: 0,
		priority: 50,
		description: "Favorites filter on with zero favorites → suggest exploring.",
	},
	"map.firstVisit.movement": {
		id: "map.firstVisit.movement",
		maxShows: 1,
		cooldownMs: 0,
		priority: 80,
		description: "First map visit → tooltip explaining interaction.",
	},
	"ara.suggestAgenda": {
		id: "ara.suggestAgenda",
		maxShows: 2,
		cooldownMs: 2 * DAY_MS,
		priority: 40,
		description: "After 2 opens with no favorites → suggest exploring agenda.",
	},
	"event.suggestMap": {
		id: "event.suggestMap",
		maxShows: 1,
		cooldownMs: 0,
		priority: 60,
		description: "First event detail view → suggest opening the map.",
	},
	"event.suggestFavorite": {
		id: "event.suggestFavorite",
		maxShows: 2,
		cooldownMs: DAY_MS,
		priority: 70,
		description: "Several event views with no favorites → suggest favoriting.",
	},
	"feedback.askEngaged": {
		id: "feedback.askEngaged",
		maxShows: 2,
		cooldownMs: 14 * DAY_MS,
		priority: 30,
		description: "Engaged user (multiple sessions + favorites) → ask for feedback.",
	},
};

export function getNudgeConfig(id: NudgeId): NudgeConfig {
	return NUDGE_REGISTRY[id];
}
