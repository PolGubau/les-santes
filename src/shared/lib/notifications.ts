import type { Event } from '@/entities/event';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const MINUTES_BEFORE = 15;

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleEventNotification(event: Event): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const startMs = new Date(event.start).getTime();
  const triggerMs = startMs - MINUTES_BEFORE * 60 * 1000;

  if (triggerMs <= Date.now()) return null; // Already started or too soon

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔔 Comença en ${MINUTES_BEFORE} min`,
        body: event.title,
        sound: true,
        data: { eventId: event.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(triggerMs) },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelEventNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Santes Live',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}
