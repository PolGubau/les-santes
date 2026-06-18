/**
 * Notification utilities — local (favorites) + remote push token registration.
 *
 * expo-notifications is loaded lazily (via require() at call time, see
 * loadNotificationsModule) because its index.js runs a module-level side effect
 * (DevicePushTokenAutoRegistration.fx) that calls addPushTokenListener()
 * immediately, which throws on Android Expo Go since SDK 53. A static top-level
 * import would trigger that error before any guard runs.
 */
import type { Event } from "@/entities/event";
import { readEventCache } from "@/entities/event/cache";
import { FESTIVAL_START } from "@/shared/constants/festival";
import { useEngagementStore } from "@/shared/hooks/useEngagementStore";
import { t } from "@/shared/i18n";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { dateFromKey, toFestivalDayKey } from "./time";

const MINUTES_BEFORE = 30;

/**
 * True when running inside Expo Go.
 * `executionEnvironment === 'storeClient'` is the non-deprecated detection
 * (replaces the deprecated `Constants.appOwnership === 'expo'`).
 */
export const isExpoGo = Constants.executionEnvironment === "storeClient";

/** Alias for the lazily-loaded expo-notifications module type. */
type NotificationsModule = typeof import("expo-notifications");

/**
 * Loads expo-notifications lazily via require() so its module-level side effect
 * (DevicePushTokenAutoRegistration.fx → addPushTokenListener) runs only when we
 * first ask for it — never at this module's load time, which throws on Android
 * Expo Go (SDK 53+). require() is preferred over `await import()` because the
 * latter is unresolvable at runtime in Expo Go ("unknown module"). Being
 * synchronous, there is no await gap, so concurrent callers can never
 * double-install the notification handler.
 */
let _notifications: typeof import("expo-notifications") | null = null;
let _handlerInstalled = false;

function loadNotificationsModule(): typeof import("expo-notifications") | null {
	if (_notifications) return _notifications;
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require("expo-notifications") as NotificationsModule;
		if (!_handlerInstalled) {
			mod.setNotificationHandler({
				handleNotification: async () => ({
					shouldShowBanner: true,
					shouldShowList: true,
					shouldPlaySound: true,
					shouldSetBadge: false,
				}),
			});
			_handlerInstalled = true;
		}
		_notifications = mod;
		return mod;
	} catch {
		return null;
	}
}

/**
 * Lazy module accessor for the regular scheduling paths. Returns null in Expo
 * Go, where scheduled/push notifications are not supported for our use cases.
 */
async function getNotifications(): Promise<
	typeof import("expo-notifications") | null
> {
	if (isExpoGo) return null;
	return loadNotificationsModule();
}

/** Creates the Android notification channel used by every local notification. */
async function ensureAndroidChannel(
	N: typeof import("expo-notifications"),
): Promise<void> {
	if (Platform.OS !== "android") return;
	await N.setNotificationChannelAsync("default", {
		name: "Les Santes",
		importance: N.AndroidImportance.HIGH,
		vibrationPattern: [0, 250, 250, 250],
	});
}

/** Cancels every scheduled notification whose identifier starts with `prefix`. */
async function cancelScheduledByPrefix(
	N: typeof import("expo-notifications"),
	prefix: string,
): Promise<void> {
	const all = await N.getAllScheduledNotificationsAsync().catch(() => []);
	for (const n of all) {
		if (n.identifier.startsWith(prefix)) {
			await N.cancelScheduledNotificationAsync(n.identifier).catch(() => {});
		}
	}
}

/**
 * Serializes scheduling operations into a single chain. Each scheduler reads
 * all pending notifications, cancels its own and re-adds them; running two
 * concurrently (e.g. the root layout and a Settings toggle) could interleave
 * those steps, so we queue them instead.
 */
let _scheduleQueue: Promise<unknown> = Promise.resolve();
function serialize<T>(task: () => Promise<T>): Promise<T> {
	const run = _scheduleQueue.then(task, task);
	_scheduleQueue = run.catch(() => {});
	return run;
}

/** Public scheduler entry points — serialized to avoid interleaving. */
export function scheduleEngagementNotifications(): Promise<void> {
	return serialize(scheduleEngagementNotificationsImpl);
}
export function scheduleDailyAgendaNotifications(): Promise<void> {
	return serialize(scheduleDailyAgendaNotificationsImpl);
}
export function scheduleFestivalReminders(): Promise<void> {
	return serialize(scheduleFestivalRemindersImpl);
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

	await ensureAndroidChannel(N);

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

/**
 * Extracts the fire time (ms since epoch) from a scheduled notification's
 * trigger without unsafe casts. Only DATE triggers carry a `date` field; for
 * anything else we return null and the caller falls back gracefully.
 */
function triggerDateMs(
	trigger: import("expo-notifications").NotificationTrigger | null,
): number | null {
	if (trigger && "date" in trigger && trigger.date != null) {
		const d = trigger.date;
		return typeof d === "number" ? d : new Date(d).getTime();
	}
	return null;
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
			const ms = triggerDateMs(n.trigger);
			return {
				eventId: n.identifier.replace("event-", ""),
				title: n.content.body ?? n.identifier,
				triggerDate: ms != null ? new Date(ms) : new Date(),
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
async function scheduleEngagementNotificationsImpl(): Promise<void> {
	const N = await getNotifications();
	if (!N) return;

	const now = new Date();
	const frequencyDays = useEngagementStore.getState().frequencyDays;

	// Clear existing engagement notifications to be idempotent.
	await cancelScheduledByPrefix(N, ENGAGEMENT_NOTIF_PREFIX);

	// frequencyDays === 0 means the user opted out — nothing to schedule.
	if (frequencyDays === 0) return;

	const schedule = buildEngagementSchedule(now, frequencyDays, FESTIVAL_START);

	for (const { identifier, triggerDate, bodyIndex } of schedule) {
		await N.scheduleNotificationAsync({
			identifier,
			content: {
				title: t("engagement.title"),
				body: t(`engagement.body${bodyIndex}`),
				data: { type: "engagement" },
			},
			trigger: {
				type: N.SchedulableTriggerInputTypes.DATE,
				date: triggerDate,
			},
		});
	}
}

export const DAILY_AGENDA_NOTIF_PREFIX = "daily-agenda-";
/** Hour of the evening before (local) at which the daily agenda preview fires. */
const DAILY_AGENDA_HOUR = 20;

export interface DailyAgendaSlot {
	/** Festival day key ("YYYY-MM-DD") the notification points to. */
	day: string;
	/** Identifier passed to expo-notifications. */
	identifier: string;
	/** Scheduled fire time — DAILY_AGENDA_HOUR the evening before `day`. */
	triggerDate: Date;
}

/**
 * Pure function — no side-effects, no async, no module dependencies.
 *
 * For every festival day that has events, plans one notification the previous
 * evening at `hour` announcing the next day's programme. Slots whose trigger is
 * already in the past are skipped. Because slots are only emitted for days that
 * actually contain events, it never fires when "tomorrow" is empty (e.g. once
 * the festival is over).
 *
 * @param now            Reference "current" time (injectable for tests).
 * @param daysWithEvents Festival day keys ("YYYY-MM-DD") that contain events.
 * @param hour           Evening hour to fire at (default 20).
 */
export function buildDailyAgendaSchedule(
	now: Date,
	daysWithEvents: Iterable<string>,
	hour = DAILY_AGENDA_HOUR,
): DailyAgendaSlot[] {
	const result: DailyAgendaSlot[] = [];
	const seen = new Set<string>();

	for (const day of daysWithEvents) {
		if (seen.has(day)) continue;
		seen.add(day);

		// Fire at `hour` the calendar day before the festival day.
		const triggerDate = dateFromKey(day);
		triggerDate.setDate(triggerDate.getDate() - 1);
		triggerDate.setHours(hour, 0, 0, 0);

		if (triggerDate <= now) continue;

		result.push({
			day,
			identifier: `${DAILY_AGENDA_NOTIF_PREFIX}${day}`,
			triggerDate,
		});
	}

	return result.sort(
		(a, b) => a.triggerDate.getTime() - b.triggerDate.getTime(),
	);
}

/**
 * Schedule one local notification per festival evening (DAILY_AGENDA_HOUR)
 * previewing the next day's programme. Tapping it opens the agenda on that day
 * (see the response listener in usePushNotifications).
 *
 * Idempotent: clears previously scheduled daily-agenda notifications first.
 * Reads the cached events to know which days actually have something on, so it
 * never schedules a reminder when the following day would be empty.
 */
async function scheduleDailyAgendaNotificationsImpl(): Promise<void> {
	const N = await getNotifications();
	if (!N) return;

	// Clear existing daily-agenda notifications to stay idempotent.
	await cancelScheduledByPrefix(N, DAILY_AGENDA_NOTIF_PREFIX);

	const cached = await readEventCache().catch(() => null);
	if (!cached) return;

	const daysWithEvents = new Set(
		cached.data.map((e) => toFestivalDayKey(new Date(e.start))),
	);

	const schedule = buildDailyAgendaSchedule(new Date(), daysWithEvents);

	for (const { day, identifier, triggerDate } of schedule) {
		await N.scheduleNotificationAsync({
			identifier,
			content: {
				title: t("dailyAgenda.title"),
				body: t("dailyAgenda.body"),
				data: { type: "daily-agenda", day },
			},
			trigger: {
				type: N.SchedulableTriggerInputTypes.DATE,
				date: triggerDate,
			},
		});
	}
}

export const FESTIVAL_REMINDER_PREFIX = "festival-";
/** Hour of day (local) at which festival reminders fire. */
const FESTIVAL_REMINDER_HOUR = 11;
/** Days before the festival start for the early reminder. */
const FESTIVAL_REMINDER_DAYS_BEFORE = 7;

/**
 * Schedules two fixed reminders around the festival start:
 *   • one week before it begins
 *   • the morning it begins
 *
 * Independent from the engagement cadence — these always fire (when
 * notifications are permitted). Idempotent: clears any previously scheduled
 * festival reminders first and skips trigger dates in the past.
 */
async function scheduleFestivalRemindersImpl(): Promise<void> {
	const N = await getNotifications();
	if (!N) return;

	// Clear existing festival reminders to stay idempotent.
	await cancelScheduledByPrefix(N, FESTIVAL_REMINDER_PREFIX);

	const now = new Date();

	const weekBefore = new Date(FESTIVAL_START);
	weekBefore.setDate(FESTIVAL_START.getDate() - FESTIVAL_REMINDER_DAYS_BEFORE);
	weekBefore.setHours(FESTIVAL_REMINDER_HOUR, 0, 0, 0);

	const startDay = new Date(FESTIVAL_START);
	startDay.setHours(FESTIVAL_REMINDER_HOUR, 0, 0, 0);

	const reminders = [
		{
			identifier: `${FESTIVAL_REMINDER_PREFIX}week-before`,
			date: weekBefore,
			title: t("festivalReminder.weekBeforeTitle"),
			body: t("festivalReminder.weekBeforeBody"),
		},
		{
			identifier: `${FESTIVAL_REMINDER_PREFIX}start-day`,
			date: startDay,
			title: t("festivalReminder.startDayTitle"),
			body: t("festivalReminder.startDayBody"),
		},
	];

	for (const { identifier, date, title, body } of reminders) {
		if (date <= now) continue;
		await N.scheduleNotificationAsync({
			identifier,
			content: { title, body, data: { type: "festival-reminder" } },
			trigger: {
				type: N.SchedulableTriggerInputTypes.DATE,
				date,
			},
		});
	}
}

/**
 * Fires a single local notification after `delaySeconds` for manual QA.
 *
 * Loads the module directly, bypassing the `isExpoGo` guard on purpose:
 * local scheduled notifications work in iOS Expo Go. Returns a human-readable
 * status string so the caller can surface success/failure to the user.
 */
export async function fireTestNotification(
	delaySeconds: number,
): Promise<string> {
	const N = loadNotificationsModule();
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
		await ensureAndroidChannel(N);
	} catch (e) {
		return `❌ Error de permisos:\n${String(e)}`;
	}

	const fireAt = new Date(Date.now() + delaySeconds * 1000);

	try {
		const id = await N.scheduleNotificationAsync({
			identifier: `debug-test-${Date.now()}`,
			content: {
				title: "Les Santes Mataró - TEST",
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
