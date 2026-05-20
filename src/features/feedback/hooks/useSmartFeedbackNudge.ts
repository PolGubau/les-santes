import { useFavoritesStore } from "@/features/favorites";
import { useNudge, useNudgeStore } from "@/features/nudges";
import { useEffect } from "react";
import { useFeedbackStore } from "../store/useFeedbackStore";

/** Minimum sessions before an engaged user is eligible. */
const MIN_APP_OPENS = 4;
/** Minimum favorites before we consider the user has explored. */
const MIN_FAVORITES = 1;
/** Hard cooldown after a submission, regardless of nudge state. */
const POST_SUBMIT_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;
/** Delay before auto-opening so the modal doesn't fight a cold start. */
const OPEN_DELAY_MS = 4_000;

interface Options {
	/**
	 * When `false`, the nudge stays silent (e.g. while onboarding is showing
	 * or another modal owns the screen).
	 */
	enabled?: boolean;
}

/**
 * Behaviour-driven trigger that opens the feedback modal once a user has
 * shown signs of engagement (multiple sessions + at least one favourite)
 * and hasn't given feedback recently. Mounted once at the root layout.
 */
export function useSmartFeedbackNudge({ enabled = true }: Options = {}) {
	const appOpens = useNudgeStore((s) => s.behavior.appOpens);
	const favoritesCount = useFavoritesStore(
		(s) => Object.keys(s.favorites).length,
	);
	const lastSubmittedAt = useFeedbackStore((s) => s.lastSubmittedAt);
	const isOpen = useFeedbackStore((s) => s.isOpen);
	const open = useFeedbackStore((s) => s.open);

	const recentlySubmitted =
		lastSubmittedAt > 0 &&
		Date.now() - lastSubmittedAt < POST_SUBMIT_COOLDOWN_MS;

	const { visible, complete } = useNudge("feedback.askEngaged", {
		when:
			enabled &&
			!isOpen &&
			!recentlySubmitted &&
			appOpens >= MIN_APP_OPENS &&
			favoritesCount >= MIN_FAVORITES,
	});

	useEffect(() => {
		if (!visible) return;
		const timer = setTimeout(() => {
			open();
			complete();
		}, OPEN_DELAY_MS);
		return () => clearTimeout(timer);
	}, [visible, open, complete]);
}
