import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  event: Event;
  onPress?: () => void;
}

function PulseDot() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 2, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [opacity, scale]);

  return (
    <View style={styles.dotWrapper}>
      <Animated.View style={[styles.dotRipple, { transform: [{ scale }], opacity }]} />
      <View style={styles.dot} />
    </View>
  );
}

export function NowEventItem({ event, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={onPress}
    >
      <PulseDot />
      <Text style={styles.icon}>{event.icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.desc} numberOfLines={1}>{event.shortDescription}</Text>
        <Text style={styles.meta}>
          {event.kind === 'mobile' ? '🚶 Itinerant' : '📍 Lloc fix'} · fins {formatTime(event.end)}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: `${Colors.stateNow}55`,
  },
  itemPressed: { opacity: 0.75 },
  dotWrapper: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.stateNow,
    position: 'absolute',
  },
  dotRipple: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.stateNow,
    position: 'absolute',
  },
  icon: { fontSize: 26 },
  content: { flex: 1, gap: 2 },
  title: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  desc: { color: Colors.textMuted, fontSize: 12 },
  meta: { color: Colors.textDim, fontSize: 11, marginTop: 2 },
  arrow: { color: Colors.textDim, fontSize: 20 },
});
