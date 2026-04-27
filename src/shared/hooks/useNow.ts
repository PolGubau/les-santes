import { useEffect, useState } from "react";

// Expo inlines EXPO_PUBLIC_* variables at build time via Metro bundler
declare const process: { env: Record<string, string | undefined> };

// Mid-Les Santes 2026 - used when no EXPO_PUBLIC_DEV_DATE is set in dev
const DEV_DEFAULT = "2026-07-27T19:30:00";

function getInitialNow(): Date {
	if (__DEV__) {
		const override = process.env.EXPO_PUBLIC_DEV_DATE ?? DEV_DEFAULT;
		return new Date(override);
	}
	return new Date();
}

/**
 * Returns current Date, updated every `intervalMs` milliseconds.
 * In DEV mode, defaults to a simulated festival date (2026-07-27T20:30).
 * Override via EXPO_PUBLIC_DEV_DATE env variable.
 * In production, always uses the real clock.
 */
export function useNow(intervalMs = 10_000): Date {
	const [now, setNow] = useState(getInitialNow);

	useEffect(() => {
		if (__DEV__) return; // frozen in dev
		const id = setInterval(() => setNow(new Date()), intervalMs);
		return () => clearInterval(id);
	}, [intervalMs]);

	return now;
}
