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
import { getAppNow } from '@/shared/hooks';
import { Screen } from '@/shared/ui';
import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ── Time simulator ────────────────────────────────────────────────────────────
const STEP_MS = 15 * 60 * 1000;

function SimTimeBar({ simTime, onChange }: {
  simTime: number | null;
  onChange: (ms: number | null) => void;
}) {
  if (simTime === null) {
    return (
      <TouchableOpacity style={simStyles.livePill} onPress={() => onChange(getAppNow().getTime())}>
        <Text style={simStyles.liveText}>⏱ SIM</Text>
      </TouchableOpacity>
    );
  }
  const d = new Date(simTime);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return (
    <View style={simStyles.bar}>
      <TouchableOpacity style={simStyles.btn} onPress={() => onChange(simTime - STEP_MS)}>
        <Text style={simStyles.btnTxt}>−15</Text>
      </TouchableOpacity>
      <Text style={simStyles.time}>{hh}:{mm}</Text>
      <TouchableOpacity style={simStyles.btn} onPress={() => onChange(simTime + STEP_MS)}>
        <Text style={simStyles.btnTxt}>+15</Text>
      </TouchableOpacity>
      <TouchableOpacity style={simStyles.closeBtn} onPress={() => onChange(null)}>
        <Text style={simStyles.closeTxt}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const simStyles = StyleSheet.create({
  livePill: {
    position: 'absolute', bottom: 96, left: 16, zIndex: 50,
    backgroundColor: 'rgba(29,78,216,0.88)',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  liveText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bar: {
    position: 'absolute', bottom: 96, left: 16, zIndex: 50,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 24,
    paddingHorizontal: 12, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  btn: { backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  btnTxt: { fontSize: 12, fontWeight: '700', color: '#374151' },
  time: { fontSize: 15, fontWeight: '800', color: '#111827', minWidth: 48, textAlign: 'center' },
  closeBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  closeTxt: { fontSize: 20, color: '#9CA3AF', fontWeight: '400', lineHeight: 22 },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MapaScreen() {
  const { events } = useEvents();
  const { mapEvents, drawerEvents, selectedDay, availableDays, todayKey, setDay, liveCount } =
    useMapEvents(events);

  const mapRef = useRef<EventMapHandle | null>(null);
  const selection = useMapSelection(mapRef);
  const search = useMapSearch(mapEvents, (isSearching) => selection.reset(isSearching));
  const [simTime, setSimTime] = useState<number | null>(null);
  const handleSimTimeChange = useCallback((ms: number | null) => {
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

      <SimTimeBar simTime={simTime} onChange={handleSimTimeChange} />
    </Screen>
  );
}

