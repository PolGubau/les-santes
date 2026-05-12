import type { Event } from '@/entities/event';
import { useFavoritesStore } from '@/features/favorites';
import { Colors } from '@/shared/constants';
import { addEventToCalendar, cancelEventNotification, formatTime, scheduleEventNotification } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { CalendarPlus, Heart, HeartOff } from 'lucide-react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
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
  const swipeableRef = useRef<SwipeableMethods>(null);
  const scale = useSharedValue(1);
  const isFinished = event.state === 'finished';
  const stateLabel = event.state === 'now' ? 'En curs' : event.state === 'upcoming' ? 'Proximament' : 'Acabat';

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(event.id);

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withTiming(0.96, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const handleFavorite = useCallback(() => {
    Haptics.impactAsync(favorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    const isAdding = !favorite;
    toggleFavorite(event.id);
    swipeableRef.current?.close();
    if (isAdding) {
      scheduleEventNotification(event).catch(() => { });
    } else {
      cancelEventNotification(event.id).catch(() => { });
    }
  }, [event, favorite, toggleFavorite]);

  const handleCalendar = useCallback(() => {
    Haptics.selectionAsync();
    addEventToCalendar(event);
    swipeableRef.current?.close();
  }, [event]);

  const renderRightActions = useCallback(() => {
    if (isFinished) return null;
    return (
      <View style={styles.swipeActions}>
        <Pressable style={[styles.swipeBtn, styles.swipeBtnCalendar]} onPress={handleCalendar} accessibilityLabel="Afegir al calendari">
          <CalendarPlus size={20} color="#fff" />
        </Pressable>
        <Pressable style={[styles.swipeBtn, styles.swipeBtnFav, favorite && styles.swipeBtnFavActive]} onPress={handleFavorite} accessibilityLabel={favorite ? 'Treure de favorits' : 'Afegir a favorits'}>
          <Heart size={20} color="#fff" fill={favorite ? '#fff' : 'transparent'} />
        </Pressable>
      </View>
    );
  }, [handleCalendar, handleFavorite, favorite, isFinished]);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      onSwipeableWillOpen={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <Animated.View style={animatedCard}>
        <Pressable
          style={({ pressed }) => [styles.row, isFinished && styles.rowDim, pressed && styles.rowPressed]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`${event.title}. ${stateLabel}. De ${formatTime(event.start)} a ${formatTime(event.end)}`}
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
                  <EventIcon icon={event.icon} size={10} color="#fff" />
                </View>
              </>
            ) : (
              <EventIcon icon={event.icon} size={20} color={isFinished ? Colors.textDim : Colors.text} />
            )}
          </View>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.title, isFinished && styles.textDim]} numberOfLines={1}>
                {event.title}
              </Text>
              <Text style={styles.time}>
                {formatTime(event.start)} – {formatTime(event.end)}
              </Text>
            </View>
            <Text style={styles.desc} numberOfLines={1}>
              {distanceMeters != null
                ? `${event.shortDescription} · ${distanceMeters < 1000 ? `${Math.round(distanceMeters)} m` : `${(distanceMeters / 1000).toFixed(1)} km`}`
                : event.shortDescription}
            </Text>
          </View>
          {/* Inline favorite indicator */}
          <View style={styles.actions}>
            {favorite && <Heart size={18} color={Colors.primary} fill={Colors.primary} />}
            {!favorite && isFinished && <HeartOff size={18} color={Colors.textDim} />}
          </View>
        </Pressable>
      </Animated.View>
    </ReanimatedSwipeable>
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
  rowPressed: { backgroundColor: Colors.surfaceHigh },
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 4,
  },
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
  // Swipe action buttons
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  swipeBtn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeBtnCalendar: { backgroundColor: Colors.stateUpcoming },
  swipeBtnFav: { backgroundColor: Colors.textDim },
  swipeBtnFavActive: { backgroundColor: Colors.primary },
});
