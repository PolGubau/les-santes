import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  event: Event;
  onPress?: () => void;
}

export function UpcomingItem({ event, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={event.title}
    >
      <View style={styles.icon}>
        <EventIcon icon={event.icon} size={16} color={Colors.stateUpcoming} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.time}>
          {formatTime(event.start)} – {formatTime(event.end)}
        </Text>
      </View>
      <View style={styles.timeBadge}>
        <Text style={styles.timeBadgeText}>{formatTime(event.start)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemPressed: { opacity: 0.65 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: `${Colors.stateUpcoming}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 2 },
  title: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  time: { color: Colors.textMuted, fontSize: 12, fontVariant: ['tabular-nums'] },
  timeBadge: {
    backgroundColor: `${Colors.stateUpcoming}22`,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeBadgeText: {
    color: Colors.stateUpcoming,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
