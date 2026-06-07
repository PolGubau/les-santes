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
import { FirstTimeTooltip, useNudge, useTrackMapVisitOnMount } from '@/features/nudges';
import { FESTIVAL_END, FESTIVAL_START } from '@/shared/constants';
import { getAppNow } from '@/shared/hooks';
import { t } from '@/shared/i18n';
import { toFestivalDayKey } from '@/shared/lib';
import { OfflineBanner, Screen } from '@/shared/ui';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronDown, Clock3, RotateCcw } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/shared/ui';

// ── Time scrubber (local preview) ─────────────────────────────────────────────
// Local-only: state lives in MapaScreen and is reset on focus so other screens
// (and re-entries to the map) always see the real current time.
// The track represents a full festival day (06:00 → 06:00 next calendar day).
// Drag is absolute: the thumb follows the finger 1:1 across the track width.
function pad(n: number) { return String(n).padStart(2, '0'); }

// Tick positions relative to the festival day (06:00 anchor) every 3h.
// Major ticks mark midday (12:00 = 0.25), evening (18:00 = 0.5) and midnight (00:00 = 0.75).
const TICK_RATIOS = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875] as const;
const MAJOR_TICK_RATIOS = new Set<number>([0.25, 0.5, 0.75]);

function SimScrubber({
  simTime,
  onChange,
  visible,
  onToggleVisible,
  selectedDay,
}: {
  simTime: number;
  onChange: (ms: number) => void;
  visible: boolean;
  onToggleVisible: () => void;
  /** YYYY-MM-DD festival day key — anchors the scrubber range. */
  selectedDay: string;
}) {
  // Refs keep PanResponder handlers fresh without recreating the responder.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // Always-fresh ref so PanResponder (created once) sees the current day.
  const selectedDayRef = useRef(selectedDay);
  selectedDayRef.current = selectedDay;

  const trackRef = useRef<View | null>(null);
  const trackLayoutRef = useRef<{ pageX: number; width: number }>({ pageX: 0, width: 0 });
  const [trackWidth, setTrackWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const measureTrack = useCallback(() => {
    trackRef.current?.measureInWindow((x, _y, w) => {
      if (w > 0) {
        trackLayoutRef.current = { pageX: x, width: w };
        setTrackWidth(w);
      }
    });
  }, []);

  // Map an absolute finger X position to a sim-time **within** the selected
  // festival day (06:00 → 06:00 next calendar day). The output is clamped to
  // that day so dragging can never trigger a day-chip change.
  const setFromPageX = useCallback((pageX: number) => {
    const { pageX: tx, width: tw } = trackLayoutRef.current;
    if (tw <= 0) return;
    const ratio = Math.max(0, Math.min(1, (pageX - tx) / tw));
    // Anchor: 06:00 of the selected festival day (YYYY-MM-DD key).
    const [y, m, d] = selectedDayRef.current.split('-').map(Number);
    const dayStart = new Date(y, m - 1, d, 6, 0, 0, 0);
    const dayStartMs = dayStart.getTime();
    const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000 - 1;
    // Clamp within both the day boundary and the overall festival window.
    const raw = dayStartMs + Math.round(ratio * 24 * 60) * 60_000;
    const ms = Math.max(
      Math.max(dayStartMs, FESTIVAL_START.getTime()),
      Math.min(Math.min(dayEndMs, FESTIVAL_END.getTime()), raw),
    );
    onChangeRef.current(ms);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        measureTrack();
        setIsDragging(true);
        Haptics.selectionAsync();
        setFromPageX(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt) => setFromPageX(evt.nativeEvent.pageX),
      onPanResponderRelease: () => setIsDragging(false),
      onPanResponderTerminate: () => setIsDragging(false),
    }),
  ).current;

  const d = new Date(simTime);
  const timeLabel = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const rawMinutes = d.getHours() * 60 + d.getMinutes();
  const festivalMinutes = rawMinutes < 6 * 60 ? rawMinutes + 18 * 60 : rawMinutes - 6 * 60;
  const progress = Math.max(0, Math.min(1, festivalMinutes / (24 * 60)));

  if (!visible) {
    return (
      <Pressable
        style={simStyles.collapsed}
        onPress={onToggleVisible}
        hitSlop={8}
        accessibilityLabel={t('map.showTimeScrubber')}
      >
        <Clock3 size={13} color="#6B7280" />
        <Text style={simStyles.collapsedText}>{timeLabel}</Text>
      </Pressable>
    );
  }

  const thumbX = progress * trackWidth;
  const BUBBLE_HALF = 30;
  const bubbleCenter = Math.max(BUBBLE_HALF, Math.min(trackWidth - BUBBLE_HALF, thumbX));

  return (
    <View style={simStyles.pill}>
      <Clock3 size={13} color="#9CA3AF" />
      <Text style={simStyles.clockText}>{timeLabel}</Text>
      <View
        ref={trackRef}
        onLayout={measureTrack}
        style={simStyles.trackHit}
        {...panResponder.panHandlers}
      >
        <View style={simStyles.trackBg} pointerEvents="none">
          {TICK_RATIOS.map((r) => (
            <View
              key={r}
              style={[
                simStyles.tick,
                MAJOR_TICK_RATIOS.has(r) && simStyles.tickMajor,
                { left: `${r * 100}%` },
              ]}
            />
          ))}
          <View style={[simStyles.trackFill, { width: `${progress * 100}%` }]} />
          <View
            style={[
              simStyles.thumb,
              isDragging && simStyles.thumbActive,
              { left: thumbX - (isDragging ? 8 : 5) },
            ]}
          />
        </View>
        {isDragging && trackWidth > 0 && (
          <View
            style={[simStyles.bubble, { left: bubbleCenter - BUBBLE_HALF }]}
            pointerEvents="none"
          >
            <Text style={simStyles.bubbleText}>{timeLabel}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => {
          const now = getAppNow();
          const todayKey = toFestivalDayKey(now);
          const day = selectedDayRef.current;
          let ms: number;
          if (day === todayKey) {
            // Selected day is today → reset to mock/real current time.
            ms = now.getTime();
          } else {
            // Any other day → reset to 06:00 of that day, same as handleDayChange.
            const [y, mo, dd] = day.split('-').map(Number);
            ms = new Date(y, mo - 1, dd, 6, 0, 0, 0).getTime();
          }
          onChangeRef.current(ms);
        }}
        hitSlop={10}
        accessibilityLabel={t('map.resetTime')}
      >
        <RotateCcw size={13} color="#9CA3AF" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onToggleVisible}
        hitSlop={10}
        accessibilityLabel={t('map.hideTimeScrubber')}
      >
        <ChevronDown size={14} color="#9CA3AF" />
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
  collapsed: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  collapsedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  clockText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
    minWidth: 38,
  },
  // Larger touch area than the thin visual track so the slider is easy to grab.
  trackHit: { flex: 1, justifyContent: 'center', paddingVertical: 12 },
  trackBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F3F4F6',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  tick: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 8,
    marginLeft: -1,
    borderRadius: 1,
    backgroundColor: '#D1D5DB',
  },
  tickMajor: {
    top: -4,
    height: 12,
    backgroundColor: '#9CA3AF',
  },
  thumb: {
    position: 'absolute',
    top: -3,
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
  },
  thumbActive: {
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
  },
  bubble: {
    position: 'absolute',
    bottom: 28,
    width: 60,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#111827',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MapaScreen() {
  useTrackMapVisitOnMount();
  const firstVisitNudge = useNudge('map.firstVisit.movement');

  const { events, isOffline, cacheTimestamp, refresh, isRefreshing } = useEvents();
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
  const [simVisible, setSimVisible] = useState(false);
  const toggleSimVisible = useCallback(() => setSimVisible((v) => !v), []);

  const handleSimTimeChange = useCallback((ms: number) => {
    setSimTime(ms);
    // If the new time is essentially "real now" (e.g. reset button in prod),
    // clear the WebView freeze so the map resumes live ticking. In DEV the
    // fake frozen `getAppNow()` is far from `Date.now()`, so this is a no-op
    // and the existing DEV scrub-and-freeze behaviour is preserved.
    const isLive = Math.abs(ms - Date.now()) < 2_000;
    mapRef.current?.setSimTime(isLive ? null : ms);
  }, []);

  // Reset the preview each time the map screen gains focus. Two cases:
  //  - No pending focus intent → reset to live "now" (real clock or DEV frozen).
  //  - Coming from an event mini-map → reset to the event's start time so the
  //    scrubber lands on the right festival day. Reading the store imperatively
  //    here (instead of via deps) avoids re-triggering this effect every time
  //    the focus intent changes.
  useFocusEffect(
    useCallback(() => {
      const intent = useMapFocusStore.getState();
      const target = intent.focusedEventStart
        ? new Date(intent.focusedEventStart).getTime()
        : getAppNow().getTime();
      setSimTime(target);
      // Freeze the WebView at the same target so the live count and markers
      // match what the user is about to see.
      const isLive = Math.abs(target - Date.now()) < 2_000;
      mapRef.current?.setSimTime(isLive ? null : target);
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
    // Reset to the mock/real "now". If "now" belongs to the newly selected day,
    // the scrubber will land on the actual current time; otherwise it lands on
    // 06:00 of that day (the festival-day anchor / earliest visible time).
    const now = getAppNow();
    const nowDay = toFestivalDayKey(now);
    const [y, m, d] = nextDay.split('-').map(Number);
    const ms = nowDay === nextDay
      ? Math.max(FESTIVAL_START.getTime(), Math.min(FESTIVAL_END.getTime(), now.getTime()))
      : new Date(y, m - 1, d, 6, 0, 0, 0).getTime();
    setSimTime(ms);
    mapRef.current?.setSimTime(Math.abs(ms - Date.now()) < 2_000 ? null : ms);
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
        onOffline={selection.handleListPress}
      />

      {isOffline && (
        <OfflineBanner cacheTimestamp={cacheTimestamp} onRefresh={refresh} isRefreshing={isRefreshing} />
      )}

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
        simSlot={
          <SimScrubber
            simTime={simTime}
            onChange={handleSimTimeChange}
            visible={simVisible}
            onToggleVisible={toggleSimVisible}
            selectedDay={selectedDay}
          />
        }
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
          clusterTitle={t('map.clusterSameLocation', { count: selection.clusterEvents.length })}
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

      {firstVisitNudge.visible && !selection.showDrawer && !selection.selectedEvent && (
        <FirstTimeTooltip
          title={t('map.firstVisitTitle')}
          description={t('map.firstVisitDesc')}
          onDismiss={firstVisitNudge.dismiss}
        />
      )}

    </Screen>
  );
}

