import { getSupabaseClient } from "@/shared/lib/supabase";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useAnalyticsStore } from "../store/useAnalyticsStore";

/**
 * Analytics event names. Keep this list explicit so the admin can rely on a
 * known vocabulary and we never accidentally collect free‑form strings.
 */
export type AnalyticsEventName =
	| "app_open"
	| "screen_view"
	| "event_view"
	| "favorite_added"
	| "favorite_removed"
	| "nudge_shown"
	| "nudge_dismissed"
	| "nudge_completed"
	| "onboarding_started"
	| "onboarding_step_skipped"
	| "onboarding_completed"
	| "onboarding_skipped";

const FESTIVAL_ID = process.env.EXPO_PUBLIC_FESTIVAL_ID ?? "les-santes-2026";
const APP_VERSION = Constants.expoConfig?.version ?? "0.0.0";

interface TrackOptions {
	/** When true, the event will only fire once per cold start with this key. */
	once?: string;
}

/**
 * Fire‑and‑forget analytics insert. Never throws, never blocks the UI thread,
 * and silently no‑ops when Supabase is unconfigured (e.g. preview builds).
 */
export function track(
	eventName: AnalyticsEventName,
	properties: Record<string, unknown> = {},
	options: TrackOptions = {},
): void {
	try {
		const { installId, sessionId, isEnabled, markSeen } =
			useAnalyticsStore.getState();

		if (!isEnabled) return;
		if (options.once && !markSeen(`${eventName}:${options.once}`)) return;

		const supabase = getSupabaseClient();

		void supabase
			.from("analytics_events")
			.insert({
				festival_id: FESTIVAL_ID,
				event_name: eventName,
				properties,
				install_id: installId,
				session_id: sessionId,
				platform: Platform.OS,
				app_version: APP_VERSION,
			} as never)
			.then(() => {
				// best‑effort; ignore errors
			});
	} catch {
		// Analytics must never break the app.
	}
}
