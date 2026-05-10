/**
 * Notification utilities — local (favorites) + remote push token registration.
 */
import type { Event } from '@/entities/event';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const MINUTES_BEFORE = 30;
const PROJECT_ID = 'dffc30d5-6870-47b8-979f-a842d6848eb5';

/**
 * True when running inside Expo Go.
 * Remote push notifications are not supported there since SDK 53.
 * `appOwnership === 'expo'` is the canonical Expo Go detection.
 */
export const isExpoGo =
  Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

// Local notification handler — safe in Expo Go. Guard it anyway to avoid
// any internal Android remote-notification setup that some versions trigger.
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Request permission + get Expo push token + save it to Supabase. */
export async function requestPermissionAndRegisterToken(): Promise<string | null> {
  // Remote push tokens are not supported in Expo Go since SDK 53.
  if (isExpoGo || !Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Les Santes',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
  const token = tokenData.data;

  // Save token to Supabase (best-effort, non-fatal)
  try {
    const { getSupabaseClient } = await import('./supabase');
    const supabase = getSupabaseClient();
    await supabase
      .from('push_tokens')
      .upsert(
        { token, platform: Platform.OS, last_seen_at: new Date().toISOString() },
        { onConflict: 'token' },
      );
  } catch {
    // Non-fatal
  }

  return token;
}

/** Schedule a local notification 30 min before a favourite event starts. */
export async function scheduleEventNotification(event: Event): Promise<void> {
  const triggerDate = new Date(new Date(event.start).getTime() - MINUTES_BEFORE * 60_000);
  if (triggerDate <= new Date()) return; // Past or too soon

  // Cancel any existing notification for this event before re-scheduling
  await Notifications.cancelScheduledNotificationAsync(`event-${event.id}`).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: `event-${event.id}`,
    content: {
      title: '🔔 Acte favorit molt aviat',
      body: `${event.title} comença en ${MINUTES_BEFORE} minuts`,
      data: { eventId: event.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

/** Cancel the scheduled local notification for a favourite event. */
export async function cancelEventNotification(eventId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`event-${eventId}`).catch(() => {});
}
