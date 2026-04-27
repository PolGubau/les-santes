import type { Event, EventState } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import { EventIcon, StateBadge } from '@/shared/ui';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const ACCENT_COLOR: Record<EventState, string> = {
  now: Colors.stateNow,
  upcoming: Colors.stateUpcoming,
  finished: 'transparent',
};

interface Props {
  event: Event;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: Props) {
  const isFinished = event.state === 'finished';
  const accentColor = ACCENT_COLOR[event.state];

  const stateLabel = event.state === 'now' ? 'En curs' : event.state === 'upcoming' ? 'Pròximament' : 'Acabat';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, isFinished && styles.cardDim, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}. ${stateLabel}. De ${formatTime(event.start)} a ${formatTime(event.end)}`}
      accessibilityHint="Prem per veure els detalls"
      accessibilityState={{ disabled: isFinished }}
    >
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.iconBox}>
        <EventIcon icon={event.icon} size={22} color={isFinished ? Colors.textDim : Colors.text} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isFinished && styles.textDim]} numberOfLines={1}>
            {event.title}
          </Text>
          <StateBadge state={event.state} />
        </View>
        <Text style={styles.desc} numberOfLines={2}>
          {event.shortDescription}
        </Text>
        <Text style={styles.time}>
          {formatTime(event.start)} – {formatTime(event.end)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardDim: { opacity: 0.45 },
  cardPressed: { opacity: 0.75 },
  accent: {
    width: 3,
    alignSelf: 'stretch',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
    paddingVertical: 14,
    paddingRight: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  textDim: { color: Colors.textMuted },
  desc: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    color: Colors.textDim,
    fontSize: 12,
  },
});
