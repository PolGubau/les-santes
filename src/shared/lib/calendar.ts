import type { Event } from '@/entities/event';
import { t } from '@/shared/i18n';
import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';
import { FESTIVAL_START } from '../constants';

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
    lines.push(t('calendar.noteMobileRoute'));
    if (event.locationName) lines.push(t('calendar.noteStartFrom', { name: event.locationName }));
  }

  lines.push('');
  lines.push('———');
  lines.push(t('calendar.noteAddedFromApp'));
  lines.push(t('calendar.noteOpenInApp', { url: `${APP_SCHEME}://event/${event.id}` }));

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
  const { status: existing } = await Calendar.getCalendarPermissionsAsync();

  if (existing === 'denied') {
    Alert.alert(
      t('calendar.deniedTitle'),
      t('calendar.deniedBody'),
      [{ text: t('common.ok') }],
    );
    return;
  }

  if (existing !== 'granted') {
    // Show contextual explanation before the OS permission prompt
    const confirmed = await new Promise<boolean>((resolve) => {
      Alert.alert(
        t('calendar.permissionTitle'),
        t('calendar.permissionBody'),
        [
          { text: t('onboarding.notNow'), style: 'cancel', onPress: () => resolve(false) },
          { text: t('common.continue'), onPress: () => resolve(true) },
        ],
      );
    });
    if (!confirmed) return;
  }

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(t('calendar.noPermissionTitle'), t('calendar.noPermissionBody'));
    return;
  }

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) {
    Alert.alert(t('common.error'), t('calendar.noCalendarBody'));
    return;
  }

  try {
    await Calendar.createEventAsync(calendarId, {
      title: `${event.title} (Les Santes ${FESTIVAL_START.getFullYear()})`,
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
    Alert.alert(t('calendar.addedTitle'), t('calendar.addedBody', { title: event.title }));
  } catch {
    Alert.alert(t('common.error'), t('calendar.errorBody'));
  }
}
