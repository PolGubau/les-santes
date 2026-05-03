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
import { toDateKey } from '@/shared/lib/time';
import { Screen } from '@/shared/ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function MapaScreen() {
  const { mapEvents, drawerEvents, selectedDay, availableDays, todayKey, setDay } =
    useMapEvents(MOCK_EVENTS);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
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
        setDay(toDateKey(new Date(focusedEvent.start)));
        setPendingFocusId(focusedEventId);
      }
      clearFocus();
    }
  }, [focusedEventId, clearFocus, setDay]);

  useEffect(() => {
    if (!pendingFocusId || !mapRef.current) return;
    const eventIsRendered = mapEvents.some((event) => event.id === pendingFocusId);
    if (!eventIsRendered) return;
    mapRef.current.focusOnEvent(pendingFocusId);
    setPendingFocusId(null);
  }, [mapEvents, pendingFocusId]);

  const liveCount = useMemo(
    () => mapEvents.filter((e) => e.kind === 'mobile' && e.state === 'now').length,
    [mapEvents],
  );

  const handleEventPress = useCallback((event: Event) => {
    setShowDetail(false);
    setSelectedEvent(event);
  }, []);
  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    setSelectedEvent(null);
    setShowDetail(false);
  }, []);
  const handleListPress = useCallback(() => setShowDrawer(true), []);
  const handleDrawerClose = useCallback(() => setShowDrawer(false), []);
  const handleCardClose = useCallback(() => { setSelectedEvent(null); setShowDetail(false); }, []);
  const handleCardExpand = useCallback(() => setShowDetail(true), []);
  const handleDetailClose = useCallback(() => setShowDetail(false), []);

  return (
    <Screen safe={false}>
      <EventMap ref={mapRef} events={filteredMapEvents} onEventPress={handleEventPress} />

      <MapHeader
        selectedDay={selectedDay}
        availableDays={availableDays}
        todayKey={todayKey}
        liveCount={liveCount}
        searchText={searchText}
        onDayChange={setDay}
        onListPress={handleListPress}
        onSearchChange={handleSearchChange}
      />

      {showDrawer && (
        <MapEventsDrawer
          events={drawerEvents}
          selectedDay={selectedDay}
          onClose={handleDrawerClose}
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
