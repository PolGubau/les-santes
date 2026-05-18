import type { Event } from '@/entities/event';
import { useEvents } from '@/entities/event';
import {
  EventMap,
  EventSnapSheet,
  MapEventsDrawer,
  MapHeader,
  useMapEvents,
  useMapFocusSync,
  useMapSearch,
  useMapSelection,
} from '@/features/map';
import type { EventMapHandle } from '@/features/map/components/EventMap';
import { FESTIVAL_END, FESTIVAL_START } from '@/shared/constants';
import { getAppNow } from '@/shared/hooks';
import { Screen } from '@/shared/ui';
import { MoveHorizontal, RotateCcw } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ── Time scrubber (dev-only) ──────────────────────────────────────────────────
/** Minutes of festival time advanced per pixel dragged. */
const PX_PER_MIN = 1.5;
const WEEKDAY_CA = ['Dg', 'Dl', 'Dm', 'Dc', 'Dj', 'Dv', 'Ds'];
function pad(n: number) { return String(n).padStart(2, '0'); }

function SimScrubber({
  simTime,
  onChange,
}: {
  simTime: number;
  onChange: (ms: number) => void;
}) {
  // Refs keep PanResponder handlers fresh without recreating the responder.
  const simTimeRef = useRef(simTime);
  simTimeRef.current = simTime;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const dragStartMs = useRef(simTime);

  const clamp = (ms: number) =>
    Math.max(FESTIVAL_START.getTime(), Math.min(FESTIVAL_END.getTime(), ms));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // Only capture clearly horizontal gestures so the map can still pan vertically.
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 4,
      onPanResponderGrant: () => { dragStartMs.current = simTimeRef.current; },
      onPanResponderMove: (_, { dx }) => {
        onChangeRef.current(clamp(dragStartMs.current + dx * PX_PER_MIN * 60_000));
      },
    }),
  ).current;

  const d = new Date(simTime);
  const dayLabel = `${WEEKDAY_CA[d.getDay()]} ${d.getDate()}`;
  const timeLabel = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const festivalMs = FESTIVAL_END.getTime() - FESTIVAL_START.getTime();
  const progress = Math.max(0.005, Math.min(0.995,
    (simTime - FESTIVAL_START.getTime()) / festivalMs));

  return (
    <View {...panResponder.panHandlers} style={simStyles.pill}>
      {/* ── Label + reset ── */}
      <View style={simStyles.topRow}>
        <Text style={simStyles.label}>Hora simulada · arrossega</Text>
        <TouchableOpacity
          onPress={() => onChangeRef.current(getAppNow().getTime())}
          hitSlop={10}
          accessibilityLabel="Restablir hora"
        >
          <RotateCcw size={11} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* ── Time display ── */}
      <View style={simStyles.timeRow}>
        <MoveHorizontal size={14} color="#6B7280" />
        <Text style={simStyles.dayText}>{dayLabel}</Text>
        <Text style={simStyles.dot}>·</Text>
        <Text style={simStyles.clockText}>{timeLabel}</Text>
      </View>

      {/* ── Festival progress bar ── */}
      <View style={simStyles.trackBg}>
        <View style={[simStyles.trackFill, { flex: progress }]} />
        <View style={simStyles.thumb} />
        <View style={{ flex: 1 - progress }} />
      </View>
    </View>
  );
}

const simStyles = StyleSheet.create({
  pill: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    gap: 4,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  dot: { fontSize: 14, color: '#D1D5DB' },
  clockText: { fontSize: 20, fontWeight: '800', color: '#111827', fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  trackBg: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F3F4F6',
    marginTop: 4,
    overflow: 'visible',
  },
  trackFill: { height: 4, backgroundColor: '#3B82F6', borderRadius: 2 },
  thumb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: -1,
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MapaScreen() {
  const { events } = useEvents();
  const { mapEvents, drawerEvents, selectedDay, availableDays, todayKey, setDay, liveCount } =
    useMapEvents(events);

  const mapRef = useRef<EventMapHandle | null>(null);
  const selection = useMapSelection(mapRef);
  const search = useMapSearch(mapEvents, (isSearching) => selection.reset(isSearching));
  // Dev: always start from fake app date; scrubber keeps it as a number (never null).
  const [simTime, setSimTime] = useState<number>(() => getAppNow().getTime());
  const handleSimTimeChange = useCallback((ms: number) => {
    setSimTime(ms);
    mapRef.current?.setSimTime(ms);
  }, []);

  // Stable deps: setSelectedEvent and setShowDrawer are React state setters (never change)
  const { setSelectedEvent, setShowDrawer } = selection;
  const handleFocus = useCallback(
    (event: Event) => {
      setSelectedEvent(event);
      setShowDrawer(false);
    },
    [setSelectedEvent, setShowDrawer],
  );

  useMapFocusSync({ mapEvents, mapRef, setDay, onFocus: handleFocus });

  return (
    <Screen safe={false}>
      <EventMap
        ref={mapRef}
        events={search.filteredEvents}
        onEventPress={selection.handleEventPress}
        onClusterPress={selection.handleClusterPress}
      />

      <MapHeader
        selectedDay={selectedDay}
        availableDays={availableDays}
        todayKey={todayKey}
        liveCount={liveCount}
        searchText={search.searchText}
        isFiltering={search.isSearching}
        onDayChange={setDay}
        onListPress={selection.handleListPress}
        onSearchChange={search.handleSearchChange}
        onSearchFocus={search.handleSearchFocus}
        simSlot={__DEV__ ? <SimScrubber simTime={simTime} onChange={handleSimTimeChange} /> : undefined}
      />

      {selection.showDrawer && (
        <MapEventsDrawer
          events={search.isSearching ? search.filteredEvents : drawerEvents}
          selectedDay={selectedDay}
          searchQuery={search.isSearching ? search.searchText.trim() : undefined}
          onClose={selection.handleDrawerClose}
          onEventPress={selection.handleEventPress}
        />
      )}

      {!selection.showDrawer && selection.clusterEvents && (
        <MapEventsDrawer
          events={selection.clusterEvents}
          selectedDay={selectedDay}
          clusterTitle={`${selection.clusterEvents.length} actes al mateix lloc`}
          onClose={selection.handleClusterDrawerClose}
          onEventPress={selection.handleEventPress}
        />
      )}

      {!selection.showDrawer && selection.selectedEvent && (
        <EventSnapSheet
          event={selection.selectedEvent}
          onClose={selection.handleSnapClose}
        />
      )}

    </Screen>
  );
}

