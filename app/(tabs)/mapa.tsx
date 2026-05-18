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
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(29,78,216,0.10)',
    borderWidth: 1, borderColor: 'rgba(29,78,216,0.4)',
  },
  liveText: { color: '#1D4ED8', fontSize: 12, fontWeight: '700' },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10, shadowRadius: 4, elevation: 3,
  },
  btn: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  btnTxt: { fontSize: 11, fontWeight: '700', color: '#374151' },
  time: { fontSize: 13, fontWeight: '800', color: '#111827', minWidth: 40, textAlign: 'center' },
  closeBtn: { paddingHorizontal: 2, paddingVertical: 2 },
  closeTxt: { fontSize: 18, color: '#9CA3AF', fontWeight: '400', lineHeight: 20 },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MapaScreen() {
  const { events } = useEvents();
  const { mapEvents, drawerEvents, selectedDay, availableDays, todayKey, setDay, liveCount } =
    useMapEvents(events);

  const mapRef = useRef<EventMapHandle | null>(null);
  const selection = useMapSelection(mapRef);
  const search = useMapSearch(mapEvents, (isSearching) => selection.reset(isSearching));
  // In dev, start with the frozen app date so the map is immediately in sync
  const [simTime, setSimTime] = useState<number | null>(
    __DEV__ ? getAppNow().getTime() : null,
  );
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
        simSlot={__DEV__ ? <SimTimeBar simTime={simTime} onChange={handleSimTimeChange} /> : undefined}
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

