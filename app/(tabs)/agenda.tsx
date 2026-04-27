import type { EventType } from '@/entities/event';
import { MOCK_EVENTS } from '@/entities/event';
import { AgendaList, useAgenda } from '@/features/agenda';
import { Colors } from '@/shared/constants';
import { Screen } from '@/shared/ui';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const TYPE_FILTERS: Array<{ label: string; value: EventType | undefined }> = [
  { label: 'Tots', value: undefined },
  { label: '🔥 Correfoc', value: 'correfoc' },
  { label: '🎵 Concerts', value: 'concert' },
  { label: '🥁 Cercavila', value: 'cercavila' },
  { label: '🎭 Gegants', value: 'gegants' },
  { label: '🎪 Teatre', value: 'teatre' },
];

export default function AgendaScreen() {
  const { filtered, filters, setType } = useAgenda(MOCK_EVENTS);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.count}>{filtered.length} actes</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {TYPE_FILTERS.map((f) => {
          const active = filters.type === f.value;
          return (
            <Pressable
              key={f.label}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setType(f.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <AgendaList events={filtered} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  count: { color: Colors.textMuted, fontSize: 14 },
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
});
