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
	| "onboarding_skipped"
	| "store_review_requested";

const FESTIVAL_ID = process.env.EXPO_PUBLIC_FESTIVAL_ID ?? "les-santes-2026";
const APP_VERSION = Constants.expoConfig?.version ?? "0.0.0";

/** Single retry, 2s later, before dropping the event. */
const RETRY_DELAY_MS = 2_000;
const MAX_ATTEMPTS = 2;

interface TrackOptions {
	/** When true, the event will only fire once per cold start with this key. */
	once?: string;
}

interface AnalyticsRow {
	festival_id: string;
	event_name: AnalyticsEventName;
	properties: Record<string, unknown>;
	install_id: string;
	session_id: string;
	platform: typeof Platform.OS;
	app_version: string;
}

/**
 * Persist a single analytics row with one retry on failure.
 * Fully isolated from React lifecycle — safe to call from anywhere.
 */
function persistRow(row: AnalyticsRow, attempt = 1): void {
	try {
		const supabase = getSupabaseClient();
		void supabase
			.from("analytics_events")
			.insert(row as never)
			.then((res: { error?: { message?: string } | null }) => {
				if (!res?.error) return;
				if (attempt < MAX_ATTEMPTS) {
					setTimeout(() => persistRow(row, attempt + 1), RETRY_DELAY_MS);
				} else if (__DEV__) {
					// eslint-disable-next-line no-console
					console.warn(
						"[analytics] dropped event after retries:",
						row.event_name,
						res.error.message,
					);
				}
			});
	} catch (e) {
		// getSupabaseClient may throw if env is misconfigured — never crash.
		if (__DEV__) {
			// eslint-disable-next-line no-console
			console.warn("[analytics] persist threw:", e);
		}
	}
}

/**
 * Fire‑and‑forget analytics insert. Never throws, never blocks the UI thread,
 * and silently no‑ops when the user has opted out or Supabase is unconfigured.
 *
 * Reliability: failed inserts are retried once after RETRY_DELAY_MS. Beyond
 * that the event is dropped (we don't queue across launches to keep storage
 * footprint and complexity small).
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

		persistRow({
			festival_id: FESTIVAL_ID,
			event_name: eventName,
			properties,
			install_id: installId,
			session_id: sessionId,
			platform: Platform.OS,
			app_version: APP_VERSION,
		});
	} catch {
		// Analytics must never break the app.
	}
}
