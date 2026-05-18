import { router } from 'expo-router';
import { useCallback, useRef } from 'react';

/**
 * Returns a `push(href)` that ignores calls within `guardMs` of the previous
 * one. Prevents duplicate screen pushes when users tap quickly or the
 * navigation transition hasn't started yet.
 *
 * Usage:
 *   const push = useNavPush();
 *   <Pressable onPress={() => push(`/event/${id}`)} />
 */
export function useNavPush(guardMs = 700) {
	const lastRef = useRef(0);

	return useCallback(
		(href: string) => {
			const now = Date.now();
			if (now - lastRef.current < guardMs) return;
			lastRef.current = now;
			router.push(href as never);
		},
		[guardMs],
	);
}
