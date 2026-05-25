import type { Event } from '@/entities/event';
import { useFavoritesStore } from '@/features/favorites/store/useFavoritesStore';
import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { cancelEventNotification, scheduleEventNotification } from '@/shared/lib';
import * as Haptics from 'expo-haptics';
import { Heart } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  event: Event;
  /** Icon size in px (default 20). */
  size?: number;
  /** Square hit area in px (default 44 per HIG / Material). */
  hitArea?: number;
  /** Color when NOT favorite (default Colors.textDim). */
  inactiveColor?: string;
  /** Color when favorite (default Colors.primary). */
  activeColor?: string;
}

/**
 * Reusable favorite toggle. Encapsulates:
 *   - Zustand favorite state lookup & toggle
 *   - Haptic feedback (medium on add, light on remove)
 *   - Local notification scheduling / cancellation
 *   - Accessibility (role, state, dynamic label)
 *   - A "pop" scale animation that gives the toggle an optimistic feel
 *     (favorites are 100% local, so we lean into micro‑feedback).
 */
export function FavoriteHeart({
  event,
  size = 20,
  hitArea = 44,
  inactiveColor = Colors.textDim,
  activeColor = Colors.primary,
}: Props) {
  const favorite = useFavoritesStore((s) => s.isFavorite(event.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = useCallback(() => {
    Haptics.impactAsync(
      favorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );
    scale.value = withSequence(
      withTiming(1.25, { duration: 120 }),
      withSpring(1, { damping: 8, stiffness: 220 }),
    );
    const isAdding = !favorite;
    toggleFavorite(event.id);
    if (isAdding) scheduleEventNotification(event).catch(() => { });
    else cancelEventNotification(event.id).catch(() => { });
  }, [event, favorite, toggleFavorite, scale]);

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.btn,
        { width: hitArea, height: hitArea, borderRadius: hitArea / 2 },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: favorite }}
      accessibilityLabel={
        favorite ? t('event.removeFavoriteA11y') : t('event.addFavoriteA11y')
      }
    >
      <Animated.View style={animStyle}>
        <Heart
          size={size}
          color={favorite ? activeColor : inactiveColor}
          fill={favorite ? activeColor : 'transparent'}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pressed: { opacity: 0.6 },
});
