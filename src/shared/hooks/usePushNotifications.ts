import { isExpoGo, requestPermissionAndRegisterToken } from '@/shared/lib/notifications';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

/**
 * Initialize push notifications in the root layout:
 * - Request permission & register Expo push token
 * - Handle taps on incoming notifications (navigate to agenda)
 *
 * All remote-notification APIs are skipped in Expo Go (unsupported since SDK 53).
 */
export function usePushNotifications() {
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (isExpoGo) return;

    // Request permission + register token (fire-and-forget, non-fatal)
    requestPermissionAndRegisterToken().catch(() => {});

    // Navigate to agenda when user taps a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const eventId = response.notification.request.content.data?.eventId as
          | string
          | undefined;
        if (eventId) {
          router.push('/(tabs)/agenda');
        }
      },
    );

    return () => {
      responseListener.current?.remove();
    };
  }, []);
}
