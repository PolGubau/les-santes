/**
 * Tracks the system "Reduce motion" accessibility setting.
 *
 * Returns `true` when the user has requested reduced motion (iOS Accessibility
 * → Motion → Reduce Motion / Android Accessibility → Remove animations).
 * Components should disable repeating, scaling, or large-displacement
 * animations and prefer instant transitions when this is `true`.
 *
 * The initial value is read synchronously on mount; subsequent OS changes are
 * picked up via `AccessibilityInfo`'s `reduceMotionChanged` event.
 */
import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useReducedMotion(): boolean {
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		let cancelled = false;

		AccessibilityInfo.isReduceMotionEnabled()
			.then((value) => {
				if (!cancelled) setReduced(value);
			})
			.catch(() => {
				// Some platforms (web, older Android) may reject — keep default.
			});

		const sub = AccessibilityInfo.addEventListener(
			"reduceMotionChanged",
			(value) => setReduced(value),
		);

		return () => {
			cancelled = true;
			sub.remove();
		};
	}, []);

	return reduced;
}
