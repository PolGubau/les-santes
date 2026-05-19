import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import * as Haptics from 'expo-haptics';
import { ChevronRight, MapPin, PersonStanding } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

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
  const pressScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(pressScale, { toValue: 0.96, duration: 80, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, { toValue: 1, damping: 10, stiffness: 200, useNativeDriver: true }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }] }}>
      <Pressable
        style={styles.item}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${event.title}. En curs fins a ${formatTime(event.end)}`}
        accessibilityHint="Prem per veure els detalls"
      >
        <PulseDot />
        <View style={styles.iconBox}>
          <EventIcon type={event.type} size={22} color={Colors.stateNow} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
          <Text style={styles.desc} numberOfLines={1}>{event.shortDescription}</Text>
          <View style={styles.metaRow}>
            {event.kind === 'mobile'
              ? <PersonStanding size={11} color={Colors.textDim} />
              : <MapPin size={11} color={Colors.textDim} />}
            <Text style={styles.meta}>
              {event.kind === 'mobile'
                ? 'Itinerant'
                : (event.locationName ?? 'Lloc fix')} · fins {formatTime(event.end)}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={Colors.textDim} />
      </Pressable>
    </Animated.View>
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
    ...Platform.select({
      ios: { shadowColor: Colors.stateNow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
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
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: `${Colors.stateNow}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  title: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  desc: { color: Colors.textMuted, fontSize: 12 },
  meta: { color: Colors.textDim, fontSize: 11, marginTop: 2, fontVariant: ['tabular-nums'] },
});
