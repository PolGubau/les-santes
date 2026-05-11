import { type Event, STATE_COLOR, STATE_LABEL_SHORT } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { formatDayShort, formatTime } from '@/shared/lib';
import { BottomSheet, EventIcon } from '@/shared/ui';
import { router } from 'expo-router';
import { ArrowRight, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

interface Props {
  events: Event[];
  selectedDay: string;
  onClose: () => void;
  searchQuery?: string;
  /** Overrides the header title — used for co-located cluster pickers */
  clusterTitle?: string;
  /** Called when the user taps an event row — shows it on the map */
  onEventPress?: (event: Event) => void;
}

function EventRow({ event, onPress }: { event: Event; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={[styles.stateDot, { backgroundColor: STATE_COLOR[event.state] }]} />
      <View style={styles.iconBox}>
        <EventIcon icon={event.icon} size={18} color={Colors.text} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.rowMeta}>
          {formatTime(event.start)} – {formatTime(event.end)}
          {'  ·  '}
          <Text style={{ color: STATE_COLOR[event.state] }}>{STATE_LABEL_SHORT[event.state]}</Text>
        </Text>
      </View>
      <ChevronRight size={14} color={Colors.textDim} />
    </Pressable>
  );
}

export function MapEventsDrawer({ events, selectedDay, onClose, searchQuery, clusterTitle, onEventPress }: Props) {
  const { height } = useWindowDimensions();
  const nowCount = events.filter((e) => e.state === 'now').length;

  return (
    <BottomSheet onClose={onClose} height={height * 0.75} peekHeight={height * 0.38}>
      <View style={styles.header}>
        {clusterTitle ? (
          <>
            <Text style={styles.title} numberOfLines={1}>{clusterTitle}</Text>
            {nowCount > 0 && (
              <View style={styles.nowPill}>
                <View style={styles.nowDot} />
                <Text style={styles.nowText}>{nowCount} en curs</Text>
              </View>
            )}
          </>
        ) : searchQuery ? (
          <>
            <Text style={styles.title} numberOfLines={1}>
              «{searchQuery}»
            </Text>
            <Text style={styles.count}>
              {events.length} {events.length === 1 ? 'resultat' : 'resultats'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>{formatDayShort(selectedDay)}</Text>
            <Text style={styles.count}>{events.length} actes</Text>
            {nowCount > 0 && (
              <View style={styles.nowPill}>
                <View style={styles.nowDot} />
                <Text style={styles.nowText}>{nowCount} en curs</Text>
              </View>
            )}
          </>
        )}
      </View>

      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <EventRow
            event={item}
            onPress={() => { onEventPress ? onEventPress(item) : router.push('/(tabs)/agenda'); }}
          />
        )}
        style={[styles.list, { maxHeight: height * 0.48 }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Pressable
        style={styles.agendaBtn}
        onPress={() => { onClose(); router.push('/(tabs)/agenda'); }}
      >
        <Text style={styles.agendaBtnText}>Veure tota l&apos;agenda</Text>
        <ArrowRight size={15} color={Colors.primary} />
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  count: { color: Colors.textMuted, fontSize: 14, flex: 1 },
  nowPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${Colors.stateNow}22`, paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  nowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.stateNow },
  nowText: { color: Colors.stateNow, fontSize: 12, fontWeight: '600' },
  list: {},
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  rowPressed: { opacity: 0.6 },
  stateDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  iconBox: {
    width: 34, height: 34, borderRadius: 9, backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rowContent: { flex: 1 },
  rowTitle: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  rowMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 1 },
  agendaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 14, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.primary,
  },
  agendaBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
