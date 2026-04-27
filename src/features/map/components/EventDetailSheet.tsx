import { type Event, STATE_COLOR, STATE_LABEL_SHORT } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import { BottomSheet, EventIcon } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import React, { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  event: Event;
  onClose: () => void;
}

async function addEventToCalendar(event: Event): Promise<void> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permís denegat', 'Cal permís per accedir al calendari.');
    return;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writableCalendars = calendars.filter((c) => c.allowsModifications);

  if (writableCalendars.length === 0) {
    Alert.alert('Sense calendaris', 'No s\'ha trobat cap calendari disponible.');
    return;
  }

  Alert.alert(
    'Afegir al calendari',
    'Tria un calendari:',
    [
      ...writableCalendars.map((cal) => ({
        text: cal.title,
        onPress: async () => {
          try {
            await Calendar.createEventAsync(cal.id, {
              title: event.title,
              startDate: new Date(event.start),
              endDate: new Date(event.end),
              location: event.locationName ?? (event.kind === 'mobile' ? 'Recorregut pels carrers' : undefined),
              notes: event.shortDescription,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
            Alert.alert('Afegit!', `"${event.title}" s'ha afegit a "${cal.title}".`);
          } catch {
            Alert.alert('Error', 'No s\'ha pogut afegir l\'esdeveniment al calendari.');
          }
        },
      })),
      { text: 'Cancel·lar', style: 'cancel' },
    ],
    { cancelable: true },
  );
}

export function EventDetailSheet({ event, onClose }: Props) {
  const stateColor = STATE_COLOR[event.state];

  const handleAddToCalendar = useCallback(() => {
    addEventToCalendar(event);
  }, [event]);

  return (
    <BottomSheet onClose={onClose}>
      <View style={[styles.stateBadge, { backgroundColor: `${stateColor}22` }]}>
        <View style={[styles.stateDot, { backgroundColor: stateColor }]} />
        <Text style={[styles.stateText, { color: stateColor }]}>{STATE_LABEL_SHORT[event.state]}</Text>
      </View>

      <View style={styles.iconBox}>
        <EventIcon icon={event.icon} size={32} color={Colors.text} />
      </View>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description}>{event.shortDescription}</Text>

      <View style={styles.row}>
        <Ionicons name="time-outline" size={16} color={Colors.textDim} />
        <Text style={styles.rowText}>
          {formatTime(event.start)} - {formatTime(event.end)}
        </Text>
      </View>

      {event.kind === 'mobile' && (
        <View style={styles.row}>
          <Ionicons name="walk-outline" size={16} color={Colors.textDim} />
          <Text style={styles.rowText}>Recorregut pels carrers</Text>
        </View>
      )}
      {event.kind === 'static' && event.locationName && (
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color={Colors.textDim} />
          <Text style={styles.rowText}>{event.locationName}</Text>
        </View>
      )}

      <Pressable style={styles.calendarBtn} onPress={handleAddToCalendar}>
        <Ionicons name="calendar-outline" size={18} color="#fff" />
        <Text style={styles.calendarBtnText}>Afegir al calendari</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  stateDot: { width: 6, height: 6, borderRadius: 3 },
  stateText: { fontSize: 12, fontWeight: '600' },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  description: { color: Colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rowText: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  calendarBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  calendarBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
