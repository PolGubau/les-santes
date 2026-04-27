import type { Event } from '@/entities/event';
import {
  Camera,
  Map as MapLibreMap,
  UserLocation,
} from '@maplibre/maplibre-react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useEventPositions } from '../hooks/useEventPositions';
import { MobileMarker } from './MobileMarker';
import { StaticMarker } from './StaticMarker';

// OpenFreeMap — 100% gratuït, sense clau d'API
const OSM_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

// Mataró centre [lng, lat]
const CENTER: [number, number] = [2.4440, 41.5378];

interface Props {
  events: Event[];
  onEventPress?: (event: Event) => void;
}

export function EventMap({ events, onEventPress }: Props) {
  const positions = useEventPositions(events);
  const positionLookup = new globalThis.Map(positions.map((p) => [p.eventId, p.position]));

  return (
    <MapLibreMap style={styles.map} mapStyle={OSM_STYLE} attribution={false}>
      <Camera initialViewState={{ center: CENTER, zoom: 14 }} />
      <UserLocation />

      {events.map((event) => {
        if (event.kind === 'static' && event.location) {
          return (
            <StaticMarker
              key={event.id}
              event={event}
              onPress={() => onEventPress?.(event)}
            />
          );
        }
        const pos = positionLookup.get(event.id);
        if (event.kind === 'mobile' && pos) {
          return (
            <MobileMarker
              key={event.id}
              event={event}
              currentPosition={pos}
              onPress={() => onEventPress?.(event)}
            />
          );
        }
        return null;
      })}
    </MapLibreMap>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
