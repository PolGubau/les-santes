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

		// Dynamic import so the module-level side effect never runs in Expo Go
		import("expo-notifications").then((Notifications) => {
			if (cancelled) return;
			// Route the tap depending on the notification payload type.
			responseListener.current =
				Notifications.addNotificationResponseReceivedListener((response) => {
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
				});
		});

		return () => {
			cancelled = true;
			responseListener.current?.remove();
		};
	}, []);
}
