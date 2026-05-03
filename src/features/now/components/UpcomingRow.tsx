import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  event: Event;
  onPress: () => void;
}

export function UpcomingRow({ event, onPress }: Props) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.icon}>
        <EventIcon icon={event.icon} size={18} color={Colors.stateUpcoming} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.meta}>
          {formatTime(event.start)}
          {event.locationName ? ` · ${event.locationName}` : ''}
        </Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{formatTime(event.start)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14, padding: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  icon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: `${Colors.stateUpcoming}22`,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1 },
  title: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  meta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  badge: {
    backgroundColor: `${Colors.stateUpcoming}22`,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  badgeText: { color: Colors.stateUpcoming, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
