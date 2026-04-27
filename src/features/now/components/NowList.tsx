import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NowEventItem } from './NowEventItem';

interface Props {
  events: Event[];
  onEventPress?: (event: Event) => void;
}

export function NowList({ events, onEventPress }: Props) {
  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="moon-outline" size={48} color={Colors.textDim} />
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
