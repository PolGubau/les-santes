import { type Event, STATE_COLOR, getStateLabel } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { formatDayShort, formatTime } from '@/shared/lib';
import { BottomSheet, EventIcon } from '@/shared/ui';
import { router } from 'expo-router';
import { ArrowRight, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
        <EventIcon type={event.type} size={18} color={Colors.text} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.rowMeta}>
          {formatTime(event.start)} – {formatTime(event.end)}
          {'  ·  '}
          <Text style={{ color: STATE_COLOR[event.state] }}>{getStateLabel(event.state)}</Text>
        </Text>
      </View>
      <ChevronRight size={14} color={Colors.textDim} />
    </Pressable>
  );
}

// Approximate heights for dynamic sizing (cluster mode)
const HANDLE_H = 36;   // handle area paddingVertical*2 + bar
const HEADER_H = 56;   // title + meta row
const ROW_H = 61;   // paddingVertical*2 + content + separator
const FOOTER_H = 48;   // "Veure tota l'agenda" button

export function MapEventsDrawer({ events, selectedDay, onClose, searchQuery, clusterTitle, onEventPress }: Props) {
  const { height } = useWindowDimensions();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const nowCount = events.filter((e) => e.state === 'now').length;

  // Use real safe-area inset instead of a hardcoded approximation so the sheet
  // height is accurate on Android 3-button nav (inset ≈ 48px) and high-inset
  // Samsung devices, not just iPhone/gesture-nav (≈ 34px).
  const bottomH = bottomInset + 16;

  // For clusters: open to content height (no peek), capped at safe max.
  // For full-agenda/search drawers: keep the two-snap peek behaviour.
  const maxH = height * 0.75;
  const sheetHeight = clusterTitle
    ? Math.min(HANDLE_H + HEADER_H + events.length * ROW_H + FOOTER_H + bottomH, maxH)
    : maxH;
  const peekHeight = clusterTitle ? undefined : height * 0.38;

  return (
    <BottomSheet onClose={onClose} height={sheetHeight} peekHeight={peekHeight}>
      <View style={styles.header}>
        {clusterTitle ? (
          <>
            <Text style={styles.title} numberOfLines={1}>{clusterTitle}</Text>
            {nowCount > 0 && (
              <View style={styles.nowPill}>
                <View style={styles.nowDot} />
                <Text style={styles.nowText}>{t('map.liveCountInline', { count: nowCount })}</Text>
              </View>
            )}
          </>
        ) : searchQuery ? (
          <>
            <Text style={styles.title} numberOfLines={1}>
              «{searchQuery}»
            </Text>
            <Text style={styles.count}>
              {events.length} {events.length === 1 ? t('map.resultSingular') : t('map.resultPlural')}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>{formatDayShort(selectedDay)}</Text>
            <Text style={styles.count}>{t('agenda.eventsCount', { count: events.length })}</Text>
            {nowCount > 0 && (
              <View style={styles.nowPill}>
                <View style={styles.nowDot} />
                <Text style={styles.nowText}>{t('map.liveCountInline', { count: nowCount })}</Text>
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
        style={[styles.list, { maxHeight: sheetHeight - HANDLE_H - HEADER_H - FOOTER_H - bottomH }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Pressable
        style={styles.agendaBtn}
        onPress={() => { onClose(); router.push('/(tabs)/agenda'); }}
      >
        <Text style={styles.agendaBtnText}>{t('map.viewFullAgenda')}</Text>
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
