import { useAgendaFocusStore } from "@/features/agenda";
import {
	isExpoGo,
	requestNotificationPermission,
	scheduleDailyAgendaNotifications,
	scheduleEngagementNotifications,
	scheduleFestivalReminders,
} from "@/shared/lib/notifications";
import type { EventSubscription } from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

/**
 * Initialize notifications in the root layout:
 * - Request permission for local notifications
 * - Handle taps on incoming notifications (navigate to agenda)
 *
 * expo-notifications is dynamically imported to avoid the module-level side
 * effect in DevicePushTokenAutoRegistration.fx that throws on Android Expo Go.
 */
export function usePushNotifications() {
	const responseListener = useRef<EventSubscription | null>(null);
	// Identifier of the last response we routed, so the persisted cold-start
	// response is never handled twice (e.g. across remounts).
	const handledResponseId = useRef<string | null>(null);

	useEffect(() => {
		if (isExpoGo) return;

		let cancelled = false;

		// Request permission + schedule reminders
		requestNotificationPermission()
			.then((granted) => {
				if (granted && !cancelled) {
					// Fixed festival reminders (week-before + start day) always fire.
					scheduleFestivalReminders().catch(() => {});
					// Periodic engagement nudges only if opted in (off by default).
					scheduleEngagementNotifications().catch(() => {});
					// Evening preview (20:00) of the next festival day's programme.
					scheduleDailyAgendaNotifications().catch(() => {});
				}
			})
			.catch(() => {});

		// Route the tap depending on the notification payload type. Deduped by
		// request identifier so a single response is never handled twice.
		const handleResponse = (
			response: import("expo-notifications").NotificationResponse,
		) => {
			const id = response.notification.request.identifier;
			if (handledResponseId.current === id) return;
			handledResponseId.current = id;

			const data = response.notification.request.content.data as
				| { eventId?: string; type?: string; day?: string }
				| undefined;

			// Daily agenda preview → open the agenda on the announced day.
			if (data?.type === "daily-agenda" && data.day) {
				useAgendaFocusStore.getState().requestDay(data.day);
				router.push("/(tabs)/agenda");
				return;
			}

			// Favourite event reminder → open the event detail.
			if (data?.eventId) {
				router.push(`/event/${data.eventId}`);
			}
		};

		// Dynamic import so the module-level side effect never runs in Expo Go
		import("expo-notifications").then((Notifications) => {
			if (cancelled) return;

			// Cold start: the app was launched by tapping a notification while it
			// was killed, so the listener below would miss it. We use the function
			// form (not the useLastNotificationResponse hook) on purpose: the hook
			// needs a static top-level import, which would trigger the Expo Go
			// side effect this module loads dynamically to avoid.
			Notifications.getLastNotificationResponseAsync()
				.then((response) => {
					if (!cancelled && response) handleResponse(response);
				})
				.catch(() => {});

			// Foreground/background taps while the listener is mounted.
			responseListener.current =
				Notifications.addNotificationResponseReceivedListener(handleResponse);
		});

		return () => {
			cancelled = true;
			responseListener.current?.remove();
		};
	}, []);
}
