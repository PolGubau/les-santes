import { track } from "@/features/analytics";
import * as StoreReview from "expo-store-review";
import { useCallback, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";

/**
 * Public listing URLs used as a graceful fallback when the native in‑app
 * review flow isn't available (e.g. sideloaded build, quota exhausted, or an
 * unsupported OS version). iOS is intentionally absent until the app ships on
 * the App Store and we have its numeric id.
 */
const STORE_URLS: Partial<Record<typeof Platform.OS, string>> = {
	android:
		"https://play.google.com/store/apps/details?id=com.polgubau.lessantes",
};

/** Where the review prompt was triggered from — kept for analytics. */
export type StoreReviewOrigin = "feedback_high_rating" | "settings";

/**
 * Thin, crash‑proof wrapper around `expo-store-review`.
 *
 * - `canRate` reflects whether *some* rating action is possible (native flow
 *   or a known store URL) so callers can hide affordances when neither is.
 * - `requestReview` is the opportunistic native prompt; it's best‑effort and
 *   silently no‑ops if the OS declines to show the dialog.
 * - `rateApp` is for explicit user intent (a button): it opens the public
 *   store listing directly. The native in‑app review flow is unsuitable here —
 *   Google throttles it and frequently shows nothing without erroring, which
 *   makes the button feel broken. The native flow is only used as a last
 *   resort on platforms without a known listing URL (e.g. iOS pre‑launch).
 *
 * None of these ever throw — a failed review must never break the caller.
 */
export function useStoreReview() {
	const [canRate, setCanRate] = useState(false);

	useEffect(() => {
		let active = true;
		StoreReview.hasAction()
			.then((has) => {
				if (active) setCanRate(has || Boolean(STORE_URLS[Platform.OS]));
			})
			.catch(() => {
				if (active) setCanRate(Boolean(STORE_URLS[Platform.OS]));
			});
		return () => {
			active = false;
		};
	}, []);

	const requestReview = useCallback(
		async (origin: StoreReviewOrigin): Promise<boolean> => {
			try {
				if (await StoreReview.isAvailableAsync()) {
					await StoreReview.requestReview();
					track("store_review_requested", { origin, surface: "native" });
					return true;
				}
			} catch {
				// Review prompts are opportunistic; never surface the error.
			}
			return false;
		},
		[],
	);

	const rateApp = useCallback(
		async (origin: StoreReviewOrigin): Promise<void> => {
			const url = STORE_URLS[Platform.OS];
			if (url) {
				try {
					await Linking.openURL(url);
					track("store_review_requested", { origin, surface: "store_url" });
					return;
				} catch {
					// Opening the store is best‑effort; fall through to the native flow.
				}
			}
			// No public listing for this platform yet (e.g. iOS pre‑launch): the
			// opportunistic native prompt is the only thing we can offer.
			await requestReview(origin);
		},
		[requestReview],
	);

	return { canRate, requestReview, rateApp };
}
