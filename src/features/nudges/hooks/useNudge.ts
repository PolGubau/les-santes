import { track } from "@/features/analytics";
import { useEffect, useMemo, useRef } from "react";
import { getNudgeConfig } from "../lib/registry";
import type { NudgeId } from "../lib/types";
import { useNudgeStore } from "../store/useNudgeStore";

interface UseNudgeOptions {
	/**
	 * External trigger predicate. The nudge is only eligible while this is
	 * true. Recomputed on every render — keep it cheap.
	 */
	when?: boolean;
}

interface UseNudgeReturn {
	visible: boolean;
	dismiss: () => void;
	complete: () => void;
}

/**
 * Subscribe a component to a nudge by id. Returns whether it should render
 * plus the dismiss/complete actions for its CTA. Show‑count is recorded
 * exactly once per mount of an eligible nudge.
 *
 * Hard rules enforced here:
 *   - dismissed → never visible again
 *   - completed → never visible again
 *   - shownCount >= maxShows → not visible
 *   - within cooldown window → not visible
 *   - `when === false` → not visible
 */
export function useNudge(id: NudgeId, options: UseNudgeOptions = {}): UseNudgeReturn {
	const { when = true } = options;

	const state = useNudgeStore((s) => s.nudges[id]);
	const recordShown = useNudgeStore((s) => s.recordShown);
	const dismiss = useNudgeStore((s) => s.dismiss);
	const complete = useNudgeStore((s) => s.complete);

	// Latch: once the nudge has been recorded as shown in this mount, keep it
	// visible until the user explicitly dismisses/completes it or `when` turns
	// false. Without this, `recordShown` increments `shownCount` which makes
	// `shownCount >= maxShows` true on the very next render, causing the nudge
	// to unmount in the same frame it appeared (one-frame flash).
	const recordedRef = useRef(false);

	const visible = useMemo(() => {
		if (!when) return false;
		// Hard stops: user explicitly closed the nudge.
		if (state?.dismissed) return false;
		if (state?.completed) return false;
		// Once shown in this mount, stay visible (latch) — ignore show-count limits
		// until the component unmounts. This prevents the flash caused by
		// recordShown → shownCount bump → visible flips false in the same cycle.
		if (recordedRef.current) return true;
		// Pre-show eligibility checks.
		const config = getNudgeConfig(id);
		const shownCount = state?.shownCount ?? 0;
		const lastShownTs = state?.lastShownTs ?? 0;
		if (shownCount >= config.maxShows) return false;
		if (lastShownTs > 0 && Date.now() - lastShownTs < config.cooldownMs) return false;
		return true;
	}, [when, id, state]);

	useEffect(() => {
		if (visible && !recordedRef.current) {
			recordedRef.current = true;
			recordShown(id);
			track("nudge_shown", { nudge_id: id });
		}
	}, [visible, id, recordShown]);

	return useMemo(
		() => ({
			visible,
			dismiss: () => {
				track("nudge_dismissed", { nudge_id: id });
				dismiss(id);
			},
			complete: () => {
				track("nudge_completed", { nudge_id: id });
				complete(id);
			},
		}),
		[visible, id, dismiss, complete],
	);
}
