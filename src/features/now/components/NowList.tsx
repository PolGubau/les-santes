import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NowEventItem } from './NowEventItem';

interface Props {
  now: Event[];
  upcoming: Event[];
  onEventPress?: (event: Event) => void;
}

function UpcomingItem({ event }: { event: Event }) {
  return (
    <View style={styles.upcomingItem}>
      <View style={styles.upcomingIcon}>
        <EventIcon icon={event.icon} size={16} color={Colors.stateUpcoming} />
      </View>
      <View style={styles.upcomingContent}>
        <Text style={styles.upcomingTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.upcomingTime}>
          {formatTime(event.start)} – {formatTime(event.end)}
        </Text>
      </View>
      <View style={styles.upcomingTimeBadge}>
        <Text style={styles.upcomingTimeBadgeText}>{formatTime(event.start)}</Text>
      </View>
    </View>
  );
}

export function NowList({ now, upcoming, onEventPress }: Props) {
  const hasNow = now.length > 0;
  const hasUpcoming = upcoming.length > 0;

  if (!hasNow && !hasUpcoming) {
    return (
      <View style={styles.empty}>
        <Ionicons name="moon-outline" size={52} color={Colors.textDim} />
        <Text style={styles.emptyTitle}>Res passant ara</Text>
        <Text style={styles.emptyDesc}>Consulta l'agenda per veure els pròxims actes</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
      {hasNow && now.map((event) => (
        <NowEventItem key={event.id} event={event} onPress={() => onEventPress?.(event)} />
      ))}

      {hasUpcoming && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>A continuació</Text>
          </View>
          {upcoming.map((event) => (
            <UpcomingItem key={event.id} event={event} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8, paddingBottom: 24 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '600' },
  emptyDesc: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: Colors.stateUpcoming,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  upcomingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: `${Colors.stateUpcoming}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingContent: { flex: 1, gap: 2 },
  upcomingTitle: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  upcomingTime: { color: Colors.textMuted, fontSize: 12 },
  upcomingTimeBadge: {
    backgroundColor: `${Colors.stateUpcoming}22`,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  upcomingTimeBadgeText: {
    color: Colors.stateUpcoming,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
