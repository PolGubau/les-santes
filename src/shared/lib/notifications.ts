/**
 * Notification utilities — local (favorites) + remote push token registration.
 *
 * expo-notifications is loaded lazily via dynamic import because its index.js
 * runs a module-level side effect (DevicePushTokenAutoRegistration.fx) that
 * calls addPushTokenListener() immediately, which throws on Android Expo Go
 * since SDK 53. A static import triggers that error before any guard runs.
 */
import type { Event } from '@/entities/event';
import { t } from '@/shared/i18n';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const MINUTES_BEFORE = 30;
const PROJECT_ID = 'dffc30d5-6870-47b8-979f-a842d6848eb5';

/**
 * True when running inside Expo Go.
 * `appOwnership === 'expo'` is the canonical detection used by Expo itself.
 */
export const isExpoGo =
  Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

/** Lazy singleton — only loaded once, only when NOT in Expo Go. */
let _notifications: typeof import('expo-notifications') | null = null;
async function getNotifications() {
  if (isExpoGo) return null;
  if (!_notifications) {
    _notifications = await import('expo-notifications');
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

  if (existing !== 'granted') {
    const { status } = await N.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('default', {
      name: 'Les Santes',
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

  const triggerDate = new Date(new Date(event.start).getTime() - MINUTES_BEFORE * 60_000);
  if (triggerDate <= new Date()) return; // Past or too soon

  await N.cancelScheduledNotificationAsync(`event-${event.id}`).catch(() => {});

  await N.scheduleNotificationAsync({
    identifier: `event-${event.id}`,
    content: {
      title: t('notification.eventStartingSoonTitle'),
      body: t('notification.eventStartingSoonBody', {
        title: event.title,
        minutes: MINUTES_BEFORE,
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
export async function getScheduledEventNotifications(): Promise<ScheduledEventNotification[]> {
  const N = await getNotifications();
  if (!N) return [];
  const all = await N.getAllScheduledNotificationsAsync().catch(() => [] as import('expo-notifications').NotificationRequest[]);
  return all
    .filter((n) => n.identifier.startsWith('event-'))
    .map((n) => {
      const trigger = n.trigger as { date?: number } | null;
      return {
        eventId: n.identifier.replace('event-', ''),
        title: (n.content.body ?? n.identifier),
        triggerDate: trigger?.date ? new Date(trigger.date) : new Date(),
      };
    })
    .sort((a, b) => a.triggerDate.getTime() - b.triggerDate.getTime());
}
