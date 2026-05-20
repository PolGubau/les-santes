import type { Event } from '@/entities/event';
import { useEvents } from '@/entities/event';
import {
  EventMap,
  EventSnapSheet,
  MapEventsDrawer,
  MapHeader,
  useMapEvents,
  useMapFocusStore,
  useMapFocusSync,
  useMapSearch,
  useMapSelection,
} from '@/features/map';
import type { EventMapHandle } from '@/features/map/components/EventMap';
import { FESTIVAL_END, FESTIVAL_START } from '@/shared/constants';
import { getAppNow } from '@/shared/hooks';
import { toFestivalDayKey } from '@/shared/lib';
import { Screen } from '@/shared/ui';
import { useFocusEffect } from 'expo-router';
import { MoveHorizontal, RotateCcw } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ── Time scrubber (local preview) ─────────────────────────────────────────────
// Local-only: state lives in MapaScreen and is reset on focus so other screens
// (and re-entries to the map) always see the real current time.
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
  const timeLabel = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  // Festival day: 06:00 → 06:00 next calendar day (same as toFestivalDayKey -6h logic).
  // Hours 0–5 belong to the end of the previous festival day → shift them past midnight.
  const rawMinutes = d.getHours() * 60 + d.getMinutes();
  const festivalMinutes = rawMinutes < 6 * 60
    ? rawMinutes + 18 * 60        // 00:00–05:59 → maps to 18:00–23:59 range
    : rawMinutes - 6 * 60;        // 06:00–23:59 → maps to 00:00–17:59 range
  const progress = Math.max(0.005, Math.min(0.995, festivalMinutes / (24 * 60)));

  return (
    <View {...panResponder.panHandlers} style={simStyles.pill}>
      <MoveHorizontal size={13} color="#9CA3AF" />
      <Text style={simStyles.clockText}>{timeLabel}</Text>
      <View style={simStyles.trackBg}>
        <View style={[simStyles.trackFill, { flex: progress }]} />
        <View style={simStyles.thumb} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <TouchableOpacity
        onPress={() => onChangeRef.current(getAppNow().getTime())}
        hitSlop={10}
        accessibilityLabel="Restablir hora"
      >
        <RotateCcw size={13} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}

const simStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  clockText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
    minWidth: 38,
  },
  trackBg: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F3F4F6',
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
  // Read focus intent so the simTime→day sync can yield to useMapFocusSync.
  const focusedEventId = useMapFocusStore((s) => s.focusedEventId);

  const mapRef = useRef<EventMapHandle | null>(null);
  const selection = useMapSelection(mapRef);
  const search = useMapSearch(mapEvents, (isSearching) => selection.reset(isSearching));
  // Dev: always start from fake app date; scrubber keeps it as a number (never null).
  const [simTime, setSimTime] = useState<number>(() => getAppNow().getTime());
  const simTimeRef = useRef(simTime);
  simTimeRef.current = simTime;

  const handleSimTimeChange = useCallback((ms: number) => {
    setSimTime(ms);
    // If the new time is essentially "real now" (e.g. reset button in prod),
    // clear the WebView freeze so the map resumes live ticking. In DEV the
    // fake frozen `getAppNow()` is far from `Date.now()`, so this is a no-op
    // and the existing DEV scrub-and-freeze behaviour is preserved.
    const isLive = Math.abs(ms - Date.now()) < 2_000;
    mapRef.current?.setSimTime(isLive ? null : ms);
  }, []);

  // Reset the preview to current "now" each time the map screen gains focus.
  // Keeps the scrubber strictly local: leaving the tab discards the previewed
  // time, so other screens and subsequent visits always start from the real
  // clock (or the DEV frozen date).
  useFocusEffect(
    useCallback(() => {
      const now = getAppNow().getTime();
      setSimTime(now);
      mapRef.current?.setSimTime(null);
    }, []),
  );

  // Single source of truth for day-chip taps: update sim time AND day chip together
  // in the same tick. Doing this via separate effects caused a race where each
  // effect saw a stale value of the other state and ping-ponged between days.
  const selectedDayRef = useRef(selectedDay);
  selectedDayRef.current = selectedDay;
  const handleDayChange = useCallback((nextDay: string) => {
    if (nextDay === selectedDayRef.current) return;
    setDay(nextDay);
    const prev = new Date(simTimeRef.current);
    const hh = prev.getHours();
    const mm = prev.getMinutes();
    const [y, m, d] = nextDay.split('-').map(Number);
    // Night hours (0–5) are the tail of the festival day — put them on the next calendar date.
    const calendarDate = hh < 6 ? new Date(y, m - 1, d + 1) : new Date(y, m - 1, d);
    const next = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), hh, mm, 0, 0);
    const ms = Math.max(FESTIVAL_START.getTime(), Math.min(FESTIVAL_END.getTime(), next.getTime()));
    if (ms !== simTimeRef.current) {
      setSimTime(ms);
      mapRef.current?.setSimTime(ms);
    }
  }, [setDay]);

  // Reverse sync: when the scrubber crosses a festival day boundary (or reset
  // jumps to a different day), update the chip so visible events match the
  // simulated time. Depending only on simTime avoids the day-chip-tap race
  // condition — chip taps already update both states via handleDayChange.
  // Guard: if there is a pending focus intent (coming from event detail),
  // let useMapFocusSync own the day — don't override it with "today".
  useEffect(() => {
    if (focusedEventId) return;
    const newDay = toFestivalDayKey(new Date(simTime));
    if (newDay !== selectedDayRef.current) setDay(newDay);
  }, [simTime, setDay, focusedEventId]);

  // Stable deps: setSelectedEvent and setShowDrawer are React state setters (never change)
  const { setSelectedEvent, setShowDrawer } = selection;
  const handleFocus = useCallback(
    (event: Event) => {
      setSelectedEvent(event);
      setShowDrawer(false);
    },
    [setSelectedEvent, setShowDrawer],
  );

  useMapFocusSync({ mapEvents, mapRef, setDay: handleDayChange, onFocus: handleFocus });

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
        onDayChange={handleDayChange}
        onListPress={selection.handleListPress}
        onSearchChange={search.handleSearchChange}
        onSearchFocus={search.handleSearchFocus}
        simSlot={<SimScrubber simTime={simTime} onChange={handleSimTimeChange} />}
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

