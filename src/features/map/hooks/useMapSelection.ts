import type { Event } from '@/entities/event';
import type { EventMapHandle } from '@/features/map/components/EventMap';
import { useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';

export interface MapSelectionState {
  selectedEvent: Event | null;
  showDrawer: boolean;
  clusterEvents: Event[] | null;
  /** Imperatively set selected event (used by focus sync). */
  setSelectedEvent: (event: Event | null) => void;
  /** Imperatively control drawer (used by focus sync). */
  setShowDrawer: (show: boolean) => void;
  /** Reset all selection. Pass openDrawer=true to open the list drawer simultaneously. */
  reset: (openDrawer?: boolean) => void;
  handleEventPress: (event: Event) => void;
  handleClusterPress: (events: Event[]) => void;
  handleSnapClose: () => void;
  handleDrawerClose: () => void;
  handleClusterDrawerClose: () => void;
  handleListPress: () => void;
}

/**
 * SRP: owns every piece of "what is selected / visible" state on the map screen.
 * Receives the mapRef so it can call deselect() without any external coupling.
 */
export function useMapSelection(
  mapRef: RefObject<EventMapHandle | null>,
): MapSelectionState {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [clusterEvents, setClusterEvents] = useState<Event[] | null>(null);

  const deselect = useCallback(() => mapRef.current?.deselect(), [mapRef]);

  const reset = useCallback((openDrawer = false) => {
    setSelectedEvent(null);
    setClusterEvents(null);
    setShowDrawer(openDrawer);
  }, []);

  const handleEventPress = useCallback((event: Event) => {
    setShowDrawer(false);
    setClusterEvents(null);
    setSelectedEvent(event);
  }, []);

  const handleClusterPress = useCallback((events: Event[]) => {
    setSelectedEvent(null);
    setClusterEvents(events);
  }, []);

  const handleSnapClose = useCallback(() => {
    setSelectedEvent(null);
    deselect();
  }, [deselect]);

  const handleDrawerClose = useCallback(() => setShowDrawer(false), []);
  const handleClusterDrawerClose = useCallback(() => setClusterEvents(null), []);
  const handleListPress = useCallback(() => {
    setClusterEvents(null);
    setShowDrawer(true);
  }, []);

  return {
    selectedEvent,
    showDrawer,
    clusterEvents,
    setSelectedEvent,
    setShowDrawer,
    reset,
    handleEventPress,
    handleClusterPress,
    handleSnapClose,
    handleDrawerClose,
    handleClusterDrawerClose,
    handleListPress,
  };
}
