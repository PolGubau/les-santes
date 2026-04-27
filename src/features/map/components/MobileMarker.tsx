import type { Event, RoutePoint } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { GeoJSONSource, Layer, ViewAnnotation } from '@maplibre/maplibre-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  event: Event;
  currentPosition: RoutePoint;
  onPress?: () => void;
}

export function MobileMarker({ event, currentPosition, onPress }: Props) {
  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: (event.route ?? []).map((p: RoutePoint) => [p.lng, p.lat]),
    },
  };

  return (
    <>
      <GeoJSONSource id={`route-${event.id}`} data={routeGeoJSON}>
        <Layer
          type="line"
          id={`route-line-${event.id}`}
          paint={{
            'line-color': Colors.primaryLight,
            'line-width': 3,
            'line-dasharray': [2, 2],
          }}
        />
      </GeoJSONSource>

      <ViewAnnotation lngLat={[currentPosition.lng, currentPosition.lat]}>
        <View style={styles.pin} onTouchEnd={onPress}>
          <Text style={styles.icon}>{event.icon}</Text>
        </View>
      </ViewAnnotation>
    </>
  );
}

const styles = StyleSheet.create({
  pin: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  icon: {
    fontSize: 18,
  },
});
