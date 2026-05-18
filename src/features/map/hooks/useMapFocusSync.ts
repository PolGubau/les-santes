import type { Event } from '@/entities/event';
import type { EventMapHandle } from '@/features/map/components/EventMap';
import { useMapFocusStore } from '@/features/map/store/useMapFocusStore';
import { toFestivalDayKey } from '@/shared/lib/time';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
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
 * The focus intent stays in the Zustand store until it is successfully applied,
 * which avoids losing it if the screen remounts or if `mapEvents` hasn't yet
 * propagated to the new day when phase 2 first fires.
 *
 *  1. focusedEventId arrives → switch day. Also re-applied on screen focus to
 *     survive lazy mounting / route resets coming from /event/[id].
 *  2. Once mapEvents contains the focused event → fire the imperative focus
 *     and only then clear the store.
 */
export function useMapFocusSync({
  mapEvents,
  mapRef,
  setDay,
  onFocus,
}: UseMapFocusSyncParams): void {
  const focusedEventId = useMapFocusStore((s) => s.focusedEventId);
  const focusedEventStart = useMapFocusStore((s) => s.focusedEventStart);
  const clearFocus = useMapFocusStore((s) => s.clearFocus);

  // Phase 1a: react to store changes while the screen is already mounted.
  useEffect(() => {
    if (!focusedEventId || !focusedEventStart) return;
    setDay(toFestivalDayKey(new Date(focusedEventStart)));
  }, [focusedEventId, focusedEventStart, setDay]);

  // Phase 1b: re-apply the day when the map screen comes into focus.
  // Required because navigating from /event/[id] to /(tabs)/mapa can mount the
  // tab fresh — its local `selectedDay` would otherwise default to today.
  useFocusEffect(
    useCallback(() => {
      if (!focusedEventId || !focusedEventStart) return;
      setDay(toFestivalDayKey(new Date(focusedEventStart)));
    }, [focusedEventId, focusedEventStart, setDay]),
  );

  // Phase 2: once mapEvents contains the focused event, fire the imperative
  // focus and clear the store. Keeping clearFocus here (not in phase 1) makes
  // the intent survive remounts and race conditions between setDay and the
  // mapEvents memo recomputation.
  useEffect(() => {
    if (!focusedEventId || !mapRef.current) return;
    const event = mapEvents.find((e) => e.id === focusedEventId);
    if (!event) return;
    mapRef.current.focusOnEvent(focusedEventId);
    onFocus(event);
    clearFocus();
  }, [mapEvents, focusedEventId, mapRef, onFocus, clearFocus]);
}
