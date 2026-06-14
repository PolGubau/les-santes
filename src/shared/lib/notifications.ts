/**
 * Notification utilities — local (favorites) + remote push token registration.
 *
 * expo-notifications is loaded lazily via dynamic import because its index.js
 * runs a module-level side effect (DevicePushTokenAutoRegistration.fx) that
 * calls addPushTokenListener() immediately, which throws on Android Expo Go
 * since SDK 53. A static import triggers that error before any guard runs.
 */
import type { Event } from "@/entities/event";
import { FESTIVAL_START } from "@/shared/constants/festival";
import { useEngagementStore } from "@/shared/hooks/useEngagementStore";
import { t } from "@/shared/i18n";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

const MINUTES_BEFORE = 30;

/**
 * True when running inside Expo Go.
 * `appOwnership === 'expo'` is the canonical detection used by Expo itself.
 */
export const isExpoGo =
	Constants.appOwnership === "expo" ||
	Constants.executionEnvironment === "storeClient";

/** Lazy singleton — only loaded once, only when NOT in Expo Go. */
let _notifications: typeof import("expo-notifications") | null = null;
async function getNotifications() {
	if (isExpoGo) return null;
	if (!_notifications) {
		_notifications = await import("expo-notifications");
		_notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: true,
				shouldShowBanner: true,
				shouldShowList: true,
				shouldPlaySound: true,
				shouldSetBadge: false,
			}),
		});
	}
	return _notifications;
}

/** Request notification permissions and setup local channels. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
	const N = await getNotifications(); // returns null in Expo Go
	if (!N || !Device.isDevice) return false;

	const { status: existing } = await N.getPermissionsAsync();
	let finalStatus = existing;

	if (existing !== "granted") {
		const { status } = await N.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== "granted") return false;

	if (Platform.OS === "android") {
		await N.setNotificationChannelAsync("default", {
			name: "Les Santes",
			importance: N.AndroidImportance.HIGH,
			vibrationPattern: [0, 250, 250, 250],
		});
	}

	return true;
}

/** Schedule a local notification 30 min before a favourite event starts. */
export async function scheduleEventNotification(event: Event): Promise<void> {
	const N = await getNotifications();
	if (!N) return;

	const triggerDate = new Date(
		new Date(event.start).getTime() - MINUTES_BEFORE * 60_000,
	);
	if (triggerDate <= new Date()) return; // Past or too soon

	await N.cancelScheduledNotificationAsync(`event-${event.id}`).catch(() => {});

	await N.scheduleNotificationAsync({
		identifier: `event-${event.id}`,
		content: {
			title: t("notification.eventStartingSoonTitle"),
			// i18n-js picks `.one` vs `.other` automatically based on `count`.
			body: t("notification.eventStartingSoonBody", {
				title: event.title,
				count: MINUTES_BEFORE,
			}),
			data: { eventId: event.id },
		},
		trigger: {
			type: N.SchedulableTriggerInputTypes.DATE,
			date: triggerDate,
		},
	});
}

/** Cancel the scheduled local notification for a favourite event. */
export async function cancelEventNotification(eventId: string): Promise<void> {
	const N = await getNotifications();
	await N?.cancelScheduledNotificationAsync(`event-${eventId}`).catch(() => {});
}

export interface ScheduledEventNotification {
	eventId: string;
	title: string;
	triggerDate: Date;
}

/** Returns all pending local notifications that belong to favourite events. */
export async function getScheduledEventNotifications(): Promise<
	ScheduledEventNotification[]
> {
	const N = await getNotifications();
	if (!N) return [];
	const all = await N.getAllScheduledNotificationsAsync().catch(
		() => [] as import("expo-notifications").NotificationRequest[],
	);
	return all
		.filter((n) => n.identifier.startsWith("event-"))
		.map((n) => {
			const trigger = n.trigger as { date?: number } | null;
			return {
				eventId: n.identifier.replace("event-", ""),
				title: n.content.body ?? n.identifier,
				triggerDate: trigger?.date ? new Date(trigger.date) : new Date(),
			};
		})
		.sort((a, b) => a.triggerDate.getTime() - b.triggerDate.getTime());
}

export const ENGAGEMENT_NOTIF_PREFIX = "engagement-";
const ENGAGEMENT_SLOTS = 14;
const ENGAGEMENT_HOUR = 11;
const TOTAL_BODY_VARIANTS = 14;

export interface EngagementSlot {
	/** 0-based slot index (used as notification identifier suffix). */
	slot: number;
	/** Identifier passed to expo-notifications. */
	identifier: string;
	/** Scheduled fire time. */
	triggerDate: Date;
	/** Which body${n} translation key to use (already wrapped-around 14). */
	bodyIndex: number;
}

/**
 * Pure function — no side-effects, no async, no module dependencies.
 *
 * Computes the list of engagement notification slots given the scheduling
 * parameters. The caller is responsible for actually scheduling them.
 *
 * @param now         Reference "current" time (injectable for tests).
 * @param frequencyDays  Gap between consecutive notifications (1 or 2).
 * @param festivalStart  Upper bound — slots on/after this date are omitted.
 * @param slots       Maximum number of notifications to plan (default 14).
 */
export function buildEngagementSchedule(
	now: Date,
	frequencyDays: number,
	festivalStart: Date,
	slots = ENGAGEMENT_SLOTS,
): EngagementSlot[] {
	if (now >= festivalStart) return [];

	const result: EngagementSlot[] = [];

	for (let i = 0; i < slots; i++) {
		const triggerDate = new Date(now);
		triggerDate.setDate(now.getDate() + (i + 1) * frequencyDays);
		triggerDate.setHours(ENGAGEMENT_HOUR, 0, 0, 0);
		triggerDate.setMinutes(0, 0, 0);

		if (triggerDate >= festivalStart) break;

		result.push({
			slot: i,
			identifier: `${ENGAGEMENT_NOTIF_PREFIX}${i}`,
			triggerDate,
			bodyIndex: i % TOTAL_BODY_VARIANTS,
		});
	}

	return result;
}

/**
 * Schedule a rolling window of local notifications to keep testers engaged
 * before the festival starts. Cadence (every 1 or 2 days) is read from
 * `useEngagementStore` so users can throttle them from Settings.
 *
 * Idempotent: clears previous engagement notifications before rescheduling.
 * Stops automatically once the trigger date would fall on/after the festival.
 */
export async function scheduleEngagementNotifications(): Promise<void> {
	const N = await getNotifications();
	if (!N) return;

	const now = new Date();
	const frequencyDays = useEngagementStore.getState().frequencyDays;

	// Clear existing engagement notifications to be idempotent
	const all = await N.getAllScheduledNotificationsAsync().catch(() => []);
	for (const n of all) {
		if (n.identifier.startsWith(ENGAGEMENT_NOTIF_PREFIX)) {
			await N.cancelScheduledNotificationAsync(n.identifier).catch(() => {});
		}
	}

	// frequencyDays === 0 means the user opted out — nothing to schedule.
	if (frequencyDays === 0) return;

	const schedule = buildEngagementSchedule(now, frequencyDays, FESTIVAL_START);

	for (const { identifier, triggerDate, bodyIndex } of schedule) {
		await N.scheduleNotificationAsync({
			identifier,
			content: {
				title: t("engagement.title"),
				body: t(`engagement.body${bodyIndex}` as any),
				data: { type: "engagement" },
			},
			trigger: {
				type: N.SchedulableTriggerInputTypes.DATE,
				date: triggerDate,
			},
		});
	}
}

/**
 * Loads expo-notifications via static `require()` so Metro bundles it.
 * Dynamic `await import()` fails in Expo Go ("unknown module") because
 * Metro can't resolve it at runtime. Wrapped in try/catch since the
 * native module may still throw on Android Expo Go (SDK 53 limitation).
 */
function requireNotifications(): typeof import("expo-notifications") | null {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		return require("expo-notifications");
	} catch {
		return null;
	}
}

/**
 * Fires a single local notification after `delaySeconds` for manual QA.
 *
 * Bypasses the `isExpoGo` guard on purpose: local scheduled notifications
 * work in iOS Expo Go. Returns a human-readable status string so the caller
 * can surface success/failure to the user.
 */
export async function fireTestNotification(
	delaySeconds: number,
): Promise<string> {
	const N = requireNotifications();
	if (!N) {
		return "❌ expo-notifications no disponible en este entorno.";
	}

	try {
		const { status: existing } = await N.getPermissionsAsync();
		let finalStatus = existing;
		if (existing !== "granted") {
			const { status } = await N.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") {
			return "❌ Permisos de notificación denegados.";
		}
	} catch (e) {
		return `❌ Error de permisos:\n${String(e)}`;
	}

	const fireAt = new Date(Date.now() + delaySeconds * 1000);

	try {
		const id = await N.scheduleNotificationAsync({
			identifier: `debug-test-${Date.now()}`,
			content: {
				title: "🎆 Les Santes Mataró — TEST",
				body: `Notificación de prueba programada ${delaySeconds}s. Si la ves, ¡funciona!`,
				data: { type: "debug" },
			},
			trigger: {
				type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
				seconds: delaySeconds,
			},
		});
		return `✅ Programada (id: ${id})\nSaldrá a las ${fireAt.toLocaleTimeString()}`;
	} catch (e) {
		return `❌ Error al programar:\n${String(e)}`;
	}
}
