import type { Event } from '@/entities/event';
import { MOCK_EVENTS } from '@/entities/event';
import { EventDetailSheet, EventMap, MapEventsDrawer, MapHeader, useMapEvents } from '@/features/map';
import { Screen } from '@/shared/ui';
import React, { useCallback, useMemo, useState } from 'react';

export default function MapaScreen() {
  const { mapEvents, drawerEvents, selectedDay, availableDays, todayKey, setDay } =
    useMapEvents(MOCK_EVENTS);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const liveCount = useMemo(
    () => mapEvents.filter((e) => e.kind === 'mobile' && e.state === 'now').length,
    [mapEvents],
  );

  const handleEventPress = useCallback((event: Event) => setSelectedEvent(event), []);
  const handleListPress = useCallback(() => setShowDrawer(true), []);
  const handleDrawerClose = useCallback(() => setShowDrawer(false), []);
  const handleDetailClose = useCallback(() => setSelectedEvent(null), []);

  return (
    <Screen safe={false}>
      <EventMap events={mapEvents} onEventPress={handleEventPress} />

      <MapHeader
        selectedDay={selectedDay}
        availableDays={availableDays}
        todayKey={todayKey}
        liveCount={liveCount}
        onDayChange={setDay}
        onListPress={handleListPress}
      />

      {showDrawer && (
        <MapEventsDrawer
          events={drawerEvents}
          selectedDay={selectedDay}
          onClose={handleDrawerClose}
        />
      )}

      {!showDrawer && selectedEvent && (
        <EventDetailSheet event={selectedEvent} onClose={handleDetailClose} />
      )}
    </Screen>
  );
}
