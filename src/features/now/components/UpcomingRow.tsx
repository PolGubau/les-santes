import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const DEFAULT_BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';
const THUMB = 56;

interface Props {
  event: Event;
  onPress: () => void;
}

export function UpcomingRow({ event, onPress }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.wrap, animStyle]}>
      <Pressable
        style={styles.row}
        onPress={onPress}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 70 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 220 }); }}
        accessibilityRole="button"
      >
        {/* Thumbnail */}
        <View style={styles.thumb}>
          {event.imageUrl ? (
            <Image
              source={{ uri: event.imageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={250}
              placeholder={{ blurhash: event.blurhash ?? DEFAULT_BLURHASH }}
            />
          ) : (
            <View style={styles.iconFallback}>
              <EventIcon type={event.type} size={22} color={Colors.stateUpcoming} />
            </View>
          )}
          {/* Icon badge overlay when image is present */}
          {event.imageUrl && (
            <View style={styles.iconBadge}>
              <EventIcon type={event.type} size={11} color="#fff" />
            </View>
          )}
        </View>

        {/* Text */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {formatTime(event.start)}
            {event.locationName ? ` · ${event.locationName}` : ''}
          </Text>
        </View>

        {/* Time badge + chevron */}
        <View style={styles.right}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{formatTime(event.start)}</Text>
          </View>
          <ChevronRight size={14} color={Colors.textDim} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 10,
    overflow: 'hidden',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 12,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: Colors.surfaceHigh,
  },
  iconFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.stateUpcoming}18`,
  },
  iconBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 4 },
  title: { color: Colors.text, fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  meta: { color: Colors.textMuted, fontSize: 12 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: {
    backgroundColor: `${Colors.stateUpcoming}18`,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: Colors.stateUpcoming, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
