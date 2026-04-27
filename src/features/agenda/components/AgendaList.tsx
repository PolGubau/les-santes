import type { Event, EventState } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
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
  now: 'Ara mateix',
  upcoming: 'Pròxims',
  finished: 'Finalitzats',
};
const STATE_DOT_COLOR: Record<EventState, string> = {
  now: Colors.stateNow,
  upcoming: Colors.stateUpcoming,
  finished: Colors.stateFinished,
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
        <Ionicons name="calendar-outline" size={40} color={Colors.textDim} />
        <Text style={styles.emptyText}>Cap acte trobat</Text>
      </View>
    );
  }

  return (
    <SectionList
      style={styles.list}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EventCard event={item} onPress={() => onEventPress?.(item)} />
      )}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionDot, { backgroundColor: STATE_DOT_COLOR[section.state] }]} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          <Text style={styles.sectionCount}>{section.data.length}</Text>
        </View>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingBottom: 24 },
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
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionDot: { width: 7, height: 7, borderRadius: 4 },
  emptyText: { color: Colors.textMuted, fontSize: 16, marginTop: 4 },
});
