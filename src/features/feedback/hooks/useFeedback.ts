import { useCallback } from "react";
import { submitFeedback } from "../lib/api";
import type { FeedbackInput } from "../lib/types";
import { useFeedbackStore } from "../store/useFeedbackStore";

/**
 * Single entry point for any component that needs to open the global
 * feedback modal or submit feedback programmatically.
 */
export function useFeedback() {
	const isOpen = useFeedbackStore((s) => s.isOpen);
	const open = useFeedbackStore((s) => s.open);
	const close = useFeedbackStore((s) => s.close);
	const markSubmitted = useFeedbackStore((s) => s.markSubmitted);

	const submit = useCallback(
		async (input: FeedbackInput, route?: string) => {
			await submitFeedback(input, route);
			markSubmitted();
		},
		[markSubmitted],
	);

	return { isOpen, open, close, submit };
}
