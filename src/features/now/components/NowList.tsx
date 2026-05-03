import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { Moon } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NowEventItem } from './NowEventItem';
import { UpcomingItem } from './UpcomingItem';

interface Props {
  now: Event[];
  upcoming: Event[];
  onEventPress?: (event: Event) => void;
}


export function NowList({ now, upcoming, onEventPress }: Props) {
  const hasNow = now.length > 0;
  const hasUpcoming = upcoming.length > 0;

  if (!hasNow && !hasUpcoming) {
    return (
      <View style={styles.empty}>
        <Moon size={52} color={Colors.textDim} />
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
            <UpcomingItem key={event.id} event={event} onPress={() => onEventPress?.(event)} />
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

});
