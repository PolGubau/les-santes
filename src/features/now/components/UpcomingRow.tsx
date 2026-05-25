import type { Event } from '@/entities/event';
import { useFavoritesStore } from '@/features/favorites';
import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { cancelEventNotification, formatTime, scheduleEventNotification } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { ChevronRight, Heart } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
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
  const startLabel = useMemo(() => formatTime(event.start), [event.start]);

  const favorite = useFavoritesStore((s) => s.isFavorite(event.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const handleFavorite = useCallback(() => {
    Haptics.impactAsync(
      favorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );
    const isAdding = !favorite;
    toggleFavorite(event.id);
    if (isAdding) scheduleEventNotification(event).catch(() => { });
    else cancelEventNotification(event.id).catch(() => { });
  }, [event, favorite, toggleFavorite]);

  return (
    <Animated.View style={[styles.wrap, animStyle]}>
      <Pressable
        style={styles.row}
        onPress={onPress}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 70 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 220 }); }}
        accessibilityRole="button"
        accessibilityLabel={t('event.cardA11y', {
          title: event.title,
          state: t('eventState.upcoming'),
          time: startLabel,
        })}
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
            {startLabel}
            {event.locationName ? ` · ${event.locationName}` : ''}
          </Text>
        </View>

        {/* Inline favorite toggle — 44×44 hit area, separate press handler */}
        <Pressable
          onPress={handleFavorite}
          hitSlop={8}
          style={({ pressed }) => [styles.favBtn, pressed && styles.favBtnPressed]}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite }}
          accessibilityLabel={
            favorite ? t('event.removeFavoriteA11y') : t('event.addFavoriteA11y')
          }
        >
          <Heart
            size={18}
            color={favorite ? Colors.primary : Colors.textDim}
            fill={favorite ? Colors.primary : 'transparent'}
          />
        </Pressable>

        {/* Chevron */}
        <ChevronRight size={14} color={Colors.textDim} />
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
  favBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  favBtnPressed: { backgroundColor: `${Colors.primary}14` },
});
