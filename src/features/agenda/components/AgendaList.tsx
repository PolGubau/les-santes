import type { Event, EventState } from '@/entities/event';
import { Colors } from '@/shared/constants';
import React from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { EventCard } from './EventCard';

interface Section {
  title: string;
  state: EventState;
  data: Event[];
}

const STATE_ORDER: EventState[] = ['now', 'upcoming', 'finished'];
const STATE_LABEL: Record<EventState, string> = {
  now: '🟢 Ara mateix',
  upcoming: '🔵 Pròxims',
  finished: '⚫ Finalitzats',
};

function buildSections(events: Event[]): Section[] {
  const groups: Record<EventState, Event[]> = { now: [], upcoming: [], finished: [] };
  for (const e of events) groups[e.state].push(e);
  return STATE_ORDER
    .filter((s) => groups[s].length > 0)
    .map((s) => ({ title: STATE_LABEL[s], state: s, data: groups[s] }));
}

interface Props {
  events: Event[];
  onEventPress?: (event: Event) => void;
}

export function AgendaList({ events, onEventPress }: Props) {
  const sections = buildSections(events);

  if (sections.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🎭</Text>
        <Text style={styles.emptyText}>Cap acte trobat</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EventCard event={item} onPress={() => onEventPress?.(item)} />
      )}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionCount}>{section.data.length}</Text>
        </View>
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionCount: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: Colors.textMuted, fontSize: 16 },
});
