import type { Event } from '@/entities/event';
import { getStateLabel } from '@/entities/event';
import { FavoriteHeart } from '@/features/favorites';
import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const DEFAULT_BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';
const THUMB = 52;

interface Props {
  event: Event;
  onPress?: () => void;
  distanceMeters?: number;
}

export function EventCard({ event, onPress, distanceMeters }: Props) {
  const scale = useSharedValue(1);
  const isFinished = event.state === 'finished';
  const stateLabel = getStateLabel(event.state);
  const timeRange = useMemo(
    () => `${formatTime(event.start)} – ${formatTime(event.end)}`,
    [event.start, event.end],
  );

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 70 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 70 });
  };

  return (
    <Animated.View style={animatedCard}>
      <Pressable
        style={[styles.row, isFinished && styles.rowDim]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={t('event.cardA11y', {
          title: event.title,
          state: stateLabel,
          time: timeRange,
        })}
        accessibilityState={{ disabled: isFinished }}
      >
        {/* Thumbnail */}
        <View style={[styles.thumb, isFinished && styles.thumbDim]}>
          {event.imageUrl ? (
            <>
              <Image
                source={{ uri: event.imageUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
                placeholder={{ blurhash: event.blurhash ?? DEFAULT_BLURHASH }}
              />
              <View style={styles.thumbBadge}>
                <EventIcon type={event.type} size={10} color="#fff" />
              </View>
            </>
          ) : (
            <EventIcon type={event.type} size={20} color={isFinished ? Colors.textDim : Colors.text} />
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, isFinished && styles.textDim]} numberOfLines={1}>
              {event.title}
            </Text>
            <Text style={styles.time}>{timeRange}</Text>
          </View>
          <Text style={styles.desc} numberOfLines={1}>
            {distanceMeters != null
              ? `${event.shortDescription} · ${distanceMeters < 1000 ? `${Math.round(distanceMeters)} m` : `${(distanceMeters / 1000).toFixed(1)} km`}`
              : event.shortDescription}
          </Text>
        </View>
        {/* Inline favorite toggle */}
        <FavoriteHeart event={event} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowDim: { opacity: 0.45 },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 10,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  thumbDim: { opacity: 0.5 },
  thumbBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 2 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '600' },
  textDim: { color: Colors.textMuted },
  desc: { color: Colors.textMuted, fontSize: 12, lineHeight: 17 },
  time: { color: Colors.textDim, fontSize: 12, fontWeight: '500', flexShrink: 0, fontVariant: ['tabular-nums'] },

});
