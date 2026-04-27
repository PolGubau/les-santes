import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { NowEventItem } from './NowEventItem';

interface Props {
  events: Event[];
  onEventPress?: (event: Event) => void;
}

export function NowList({ events, onEventPress }: Props) {
  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>💤</Text>
        <Text style={styles.emptyTitle}>Res passant ara</Text>
        <Text style={styles.emptyDesc}>Torna en uns minuts</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NowEventItem event={item} onPress={() => onEventPress?.(item)} />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyDesc: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
