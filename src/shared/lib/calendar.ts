import type { Event } from '@/entities/event';
import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

async function getDefaultCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.find(
    (c) =>
      c.allowsModifications &&
      (Platform.OS === 'ios'
        ? c.source?.name === 'iCloud' || c.source?.name === 'Default'
        : c.isPrimary),
  );
  return writable?.id ?? calendars.find((c) => c.allowsModifications)?.id ?? null;
}

export async function addEventToCalendar(event: Event): Promise<void> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Sense permisos', 'Activa l\'accés al calendari a la configuració.');
    return;
  }

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) {
    Alert.alert('Error', 'No s\'ha pogut trobar un calendari disponible.');
    return;
  }

  try {
    await Calendar.createEventAsync(calendarId, {
      title: event.title,
      notes: event.shortDescription,
      location: event.locationName,
      startDate: new Date(event.start),
      endDate: new Date(event.end),
      alarms: [{ relativeOffset: -15 }], // 15 min before
    });
    Alert.alert('Afegit! 📅', `"${event.title}" s'ha afegit al teu calendari.`);
  } catch {
    Alert.alert('Error', 'No s\'ha pogut afegir l\'event al calendari.');
  }
}
