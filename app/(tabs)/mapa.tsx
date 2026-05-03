import type { Event } from '@/entities/event';
import { MOCK_EVENTS } from '@/entities/event';
import {
  EventDetailSheet,
  EventFloatingCard,
  EventMap,
  MapEventsDrawer,
  MapHeader,
  useMapEvents,
} from '@/features/map';
import type { EventMapHandle } from '@/features/map/components/EventMap';
import { useMapFocusStore } from '@/features/map/store/useMapFocusStore';
import { toFestivalDayKey } from '@/shared/lib/time';
import { Screen } from '@/shared/ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function MapaScreen() {
  const { mapEvents, drawerEvents, selectedDay, availableDays, todayKey, setDay } =
    useMapEvents(MOCK_EVENTS);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [clusterEvents, setClusterEvents] = useState<Event[] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

  const { focusedEventId, clearFocus } = useMapFocusStore();
  const mapRef = useRef<EventMapHandle | null>(null);

  // Filter events on the map by search text
  const filteredMapEvents = useMemo(() => {
    if (!searchText.trim()) return mapEvents;
    const q = searchText.toLowerCase();
    return mapEvents.filter((e) => e.title.toLowerCase().includes(q));
  }, [mapEvents, searchText]);

  useEffect(() => {
    if (focusedEventId) {
      const focusedEvent = MOCK_EVENTS.find((event) => event.id === focusedEventId);
      if (focusedEvent) {
        setDay(toFestivalDayKey(new Date(focusedEvent.start)));
        setPendingFocusId(focusedEventId);
      }
      clearFocus();
    }
  }, [focusedEventId, clearFocus, setDay]);

  useEffect(() => {
    if (!pendingFocusId || !mapRef.current) return;
    const focusedEvent = mapEvents.find((event) => event.id === pendingFocusId);
    if (!focusedEvent) return;
    mapRef.current.focusOnEvent(pendingFocusId);
    setSelectedEvent(focusedEvent);
    setShowDetail(false);
    setShowDrawer(false);
    setPendingFocusId(null);
  }, [mapEvents, pendingFocusId]);

  const liveCount = useMemo(
    () => mapEvents.filter((e) => e.kind === 'mobile' && e.state === 'now').length,
    [mapEvents],
  );

  const isSearching = searchText.trim().length > 0;

  const handleEventPress = useCallback((event: Event) => {
    setShowDrawer(false);
    setClusterEvents(null);
    setShowDetail(false);
    setSelectedEvent(event);
  }, []);
  const handleClusterPress = useCallback((events: Event[]) => {
    setSelectedEvent(null);
    setShowDetail(false);
    setClusterEvents(events);
  }, []);
  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    setSelectedEvent(null);
    setClusterEvents(null);
    setShowDetail(false);
    setShowDrawer(text.trim().length > 0);
  }, []);
  const handleSearchFocus = useCallback(() => {
    if (searchText.trim().length > 0) setShowDrawer(true);
  }, [searchText]);
  const handleListPress = useCallback(() => { setClusterEvents(null); setShowDrawer(true); }, []);
  const handleDrawerClose = useCallback(() => setShowDrawer(false), []);
  const handleClusterDrawerClose = useCallback(() => setClusterEvents(null), []);
  const deselect = useCallback(() => {
    mapRef.current?.deselect();
  }, []);
  const handleCardClose = useCallback(() => { setSelectedEvent(null); setShowDetail(false); deselect(); }, [deselect]);
  const handleCardExpand = useCallback(() => setShowDetail(true), []);
  const handleDetailClose = useCallback(() => { setShowDetail(false); deselect(); }, [deselect]);

  return (
    <Screen safe={false}>
      <EventMap
        ref={mapRef}
        events={filteredMapEvents}
        onEventPress={handleEventPress}
        onClusterPress={handleClusterPress}
      />

      <MapHeader
        selectedDay={selectedDay}
        availableDays={availableDays}
        todayKey={todayKey}
        liveCount={liveCount}
        searchText={searchText}
        isFiltering={isSearching}
        onDayChange={setDay}
        onListPress={handleListPress}
        onSearchChange={handleSearchChange}
        onSearchFocus={handleSearchFocus}
      />

      {showDrawer && (
        <MapEventsDrawer
          events={isSearching ? filteredMapEvents : drawerEvents}
          selectedDay={selectedDay}
          searchQuery={isSearching ? searchText.trim() : undefined}
          onClose={handleDrawerClose}
          onEventPress={handleEventPress}
        />
      )}

      {/* Co-located events picker — shown when tapping a cluster that can't expand */}
      {!showDrawer && clusterEvents && (
        <MapEventsDrawer
          events={clusterEvents}
          selectedDay={selectedDay}
          clusterTitle={`${clusterEvents.length} actes al mateix lloc`}
          onClose={handleClusterDrawerClose}
          onEventPress={handleEventPress}
        />
      )}

      {/* Floating card — no backdrop, tap to expand to full detail */}
      {!showDrawer && !showDetail && selectedEvent && (
        <EventFloatingCard
          event={selectedEvent}
          onClose={handleCardClose}
          onExpand={handleCardExpand}
        />
      )}

      {/* Full detail sheet — opens when floating card is tapped */}
      {!showDrawer && showDetail && selectedEvent && (
        <EventDetailSheet event={selectedEvent} onClose={handleDetailClose} />
      )}
    </Screen>
  );
}
