import type { Event } from '@/entities/event';
import { MOCK_EVENTS } from '@/entities/event';
import { EventDetailSheet, EventMap, MapEventsDrawer, MapHeader, useMapEvents } from '@/features/map';
import { Screen } from '@/shared/ui';
import React, { useCallback, useState } from 'react';

export default function MapaScreen() {
  const { mapEvents, drawerEvents, selectedDay, availableDays, todayKey, setDay } =
    useMapEvents(MOCK_EVENTS);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const liveCount = mapEvents.filter((e) => e.kind === 'mobile' && e.state === 'now').length;

  const handleEventPress = useCallback((event: Event) => setSelectedEvent(event), []);

  return (
    <Screen safe={false}>
      <EventMap events={mapEvents} onEventPress={handleEventPress} />

      <MapHeader
        selectedDay={selectedDay}
        availableDays={availableDays}
        todayKey={todayKey}
        liveCount={liveCount}
        onDayChange={setDay}
        onListPress={() => setShowDrawer(true)}
      />

      {showDrawer && (
        <MapEventsDrawer
          events={drawerEvents}
          selectedDay={selectedDay}
          onClose={() => setShowDrawer(false)}
        />
      )}

      {!showDrawer && selectedEvent && (
        <EventDetailSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </Screen>
  );
}
