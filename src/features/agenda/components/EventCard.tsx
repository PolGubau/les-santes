import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import { EventIcon, StateBadge } from '@/shared/ui';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  event: Event;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: Props) {
  const isFinished = event.state === 'finished';

  return (
    <Pressable
      style={[styles.card, isFinished && styles.cardDim]}
      onPress={onPress}
    >
      <View style={styles.iconBox}>
        <EventIcon icon={event.icon} size={24} color={Colors.text} />
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
          {formatTime(event.start)} - {formatTime(event.end)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardDim: {
    opacity: 0.5,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
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
  textDim: {
    color: Colors.textMuted,
  },
  desc: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    color: Colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
});
