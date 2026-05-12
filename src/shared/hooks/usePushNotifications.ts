import { isExpoGo, requestPermissionAndRegisterToken } from '@/shared/lib/notifications';
import type { EventSubscription } from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

/**
 * Initialize push notifications in the root layout:
 * - Request permission & register Expo push token
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

    // Request permission + register token (fire-and-forget, non-fatal)
    requestPermissionAndRegisterToken().catch(() => {});

    // Dynamic import so the module-level side effect never runs in Expo Go
    import('expo-notifications').then((Notifications) => {
      if (cancelled) return;
      // Navigate directly to the event detail when user taps a notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const eventId = response.notification.request.content.data?.eventId as
            | string
            | undefined;
          if (eventId) {
            router.push(`/event/${eventId}`);
          }
        },
      );
    });

    return () => {
      cancelled = true;
      responseListener.current?.remove();
    };
  }, []);
}
