import { track } from "@/features/analytics";
import { useEffect } from "react";
import { useNudgeStore } from "../store/useNudgeStore";

/**
 * Imperative accessors for incrementing behaviour counters. Use the
 * `useTrack*OnMount` variants below for the typical "fire once on screen
 * entry" pattern.
 */
export function useTrackBehavior() {
	return {
		bumpAppOpen: useNudgeStore.getState().bumpAppOpen,
		bumpEventView: useNudgeStore.getState().bumpEventView,
		bumpMapVisit: useNudgeStore.getState().bumpMapVisit,
		bumpAgendaVisit: useNudgeStore.getState().bumpAgendaVisit,
	};
}

/**
 * Run exactly once per mount. Reads the bump action and fires the analytics
 * event imperatively to avoid subscribing the host component to the store
 * (which would re-run the effect on every counter change and loop forever).
 */
function useBumpOnMount(
	bump: (s: ReturnType<typeof useNudgeStore.getState>) => () => void,
	fire: () => void,
) {
	useEffect(() => {
		bump(useNudgeStore.getState())();
		fire();
		// Mount-only: deps intentionally empty.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
}

export function useTrackAppOpenOnMount() {
	useBumpOnMount(
		(s) => s.bumpAppOpen,
		// Once per cold start (session). The store auto‑resets `_seen` on launch.
		() => track("app_open", {}, { once: "session" }),
	);
}

/**
 * Record a view of a specific event. Dedupes per session per `eventId`, so
 * revisiting the same detail screen multiple times in one cold start produces
 * a single analytics row while still bumping the local behaviour counter for
 * nudge gating.
 */
export function useTrackEventViewOnMount(eventId: string | undefined) {
	useEffect(() => {
		if (!eventId) return;
		useNudgeStore.getState().bumpEventView();
		track("event_view", { event_id: eventId }, { once: eventId });
	}, [eventId]);
}

export function useTrackMapVisitOnMount() {
	useBumpOnMount(
		(s) => s.bumpMapVisit,
		// Dedupe per session: switching tabs back and forth must not spam.
		() => track("screen_view", { screen: "map" }, { once: "map" }),
	);
}

export function useTrackAgendaVisitOnMount() {
	useBumpOnMount(
		(s) => s.bumpAgendaVisit,
		() => track("screen_view", { screen: "agenda" }, { once: "agenda" }),
	);
}
