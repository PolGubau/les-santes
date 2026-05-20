import type { Event } from '@/entities/event';
import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

const APP_SCHEME = 'les-santes';

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

function buildCalendarNotes(event: Event): string {
  const lines: string[] = [];

  const description = event.description ?? event.shortDescription;
  if (description) lines.push(description);

  if (event.kind === 'static' && event.locationName) {
    lines.push(`📍 ${event.locationName}`);
  } else if (event.kind === 'mobile') {
    lines.push('🚶 Recorregut pels carrers');
    if (event.locationName) lines.push(`Sortida: ${event.locationName}`);
  }

  lines.push('');
  lines.push('———');
  lines.push('Afegit des de l\'app Les Santes 🎉');
  lines.push(`Obre l'acte a l'app: ${APP_SCHEME}://event/${event.id}`);

  return lines.join('\n');
}

function buildCalendarLocation(event: Event): string | undefined {
  if (event.kind === 'static') {
    const parts: string[] = [];
    if (event.locationName) parts.push(event.locationName);
    parts.push('Mataró, Catalunya');
    return parts.join(', ');
  }
  if (event.kind === 'mobile' && event.locationName) {
    return `${event.locationName}, Mataró, Catalunya`;
  }
  return 'Mataró, Catalunya';
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
      title: `🎉 ${event.title}`,
      notes: buildCalendarNotes(event),
      location: buildCalendarLocation(event),
      startDate: new Date(event.start),
      endDate: new Date(event.end),
      alarms: [
        { relativeOffset: -30 }, // 30 min before
        { relativeOffset: -60 }, // 1h before
      ],
      timeZone: 'Europe/Madrid',
      availability: Calendar.Availability.BUSY,
    });
    Alert.alert('Afegit! 📅', `"${event.title}" s'ha afegit al teu calendari.`);
  } catch {
    Alert.alert('Error', 'No s\'ha pogut afegir l\'event al calendari.');
  }
}
