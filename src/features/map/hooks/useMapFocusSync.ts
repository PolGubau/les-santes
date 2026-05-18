import type { Event } from '@/entities/event';
import type { EventMapHandle } from '@/features/map/components/EventMap';
import { useMapFocusStore } from '@/features/map/store/useMapFocusStore';
import { toFestivalDayKey } from '@/shared/lib/time';
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface UseMapFocusSyncParams {
  mapEvents: Event[];
  mapRef: RefObject<EventMapHandle | null>;
  setDay: (day: string) => void;
  /** Called with the resolved event when the map should focus on it. */
  onFocus: (event: Event) => void;
}

/**
 * SRP: single responsibility is to sync the global focusedEventId store
 * with the day selector and the map camera.
 *
 * Two-phase approach:
 *  1. focusedEventId arrives → switch day + store pendingFocusId → clear store.
 *  2. Once mapEvents updates to the new day → fire the map imperative focus.
 */
export function useMapFocusSync({
  mapEvents,
  mapRef,
  setDay,
  onFocus,
}: UseMapFocusSyncParams): void {
  const { focusedEventId, clearFocus } = useMapFocusStore();
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

  // Phase 1: external focus request → switch day.
  // focusedEventStart is stored alongside id so we never need MOCK_EVENTS lookup.
  const { focusedEventStart } = useMapFocusStore();
  useEffect(() => {
    if (!focusedEventId || !focusedEventStart) return;
    setDay(toFestivalDayKey(new Date(focusedEventStart)));
    setPendingFocusId(focusedEventId);
    clearFocus();
  }, [focusedEventId, focusedEventStart, clearFocus, setDay]);

  // Phase 2: day has changed, mapEvents updated → fire imperative focus
  useEffect(() => {
    if (!pendingFocusId || !mapRef.current) return;
    const event = mapEvents.find((e) => e.id === pendingFocusId);
    if (!event) return;
    mapRef.current.focusOnEvent(pendingFocusId);
    onFocus(event);
    setPendingFocusId(null);
  }, [mapEvents, pendingFocusId, mapRef, onFocus]);
}
