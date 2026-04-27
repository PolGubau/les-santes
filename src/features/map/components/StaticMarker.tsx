import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { ViewAnnotation } from '@maplibre/maplibre-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  event: Event;
  onPress?: () => void;
}

export function StaticMarker({ event, onPress }: Props) {
  if (!event.location) return null;

  return (
    <ViewAnnotation
      lngLat={[event.location.lng, event.location.lat]}
    >
      <View
        style={[styles.pin, event.state === 'now' && styles.pinNow]}
        onTouchEnd={onPress}
      >
        <Text style={styles.icon}>{event.icon}</Text>
      </View>
    </ViewAnnotation>
  );
}

const styles = StyleSheet.create({
  pin: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  pinNow: {
    borderColor: Colors.stateNow,
  },
  icon: {
    fontSize: 18,
  },
});
