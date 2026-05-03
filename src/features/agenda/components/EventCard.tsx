import type { Event } from '@/entities/event';
import { useFavoritesStore } from '@/features/favorites';
import { Colors } from '@/shared/constants';
import { addEventToCalendar, formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { CalendarPlus, Ellipsis, Heart, HeartOff, Share2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

const DEFAULT_BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';
const THUMB = 52;
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  event: Event;
  onPress?: () => void;
  distanceMeters?: number;
}

const ACTION_BAR_HEIGHT = 44;
const OPEN_EASING = Easing.bezier(0.25, 0.46, 0.45, 0.94);
const CLOSE_EASING = Easing.bezier(0.55, 0.06, 0.68, 0.19);

export function EventCard({ event, onPress, distanceMeters }: Props) {
  const scale = useSharedValue(1);
  const expandHeight = useSharedValue(0);
  const expandOpacity = useSharedValue(0);
  const [expanded, setExpanded] = useState(false);
  const isFinished = event.state === 'finished';
  const stateLabel = event.state === 'now' ? 'En curs' : event.state === 'upcoming' ? 'Proximament' : 'Acabat';

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(event.id);

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedBar = useAnimatedStyle(() => ({
    height: expandHeight.value,
    opacity: expandOpacity.value,
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withTiming(0.96, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const handleFavorite = () => {
    Haptics.impactAsync(favorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(event.id);
  };

  const handleMenu = () => {
    Haptics.selectionAsync();
    const next = !expanded;
    setExpanded(next);
    if (next) {
      expandHeight.value = withTiming(ACTION_BAR_HEIGHT, { duration: 220, easing: OPEN_EASING });
      expandOpacity.value = withTiming(1, { duration: 180, easing: OPEN_EASING });
    } else {
      expandOpacity.value = withTiming(0, { duration: 120, easing: CLOSE_EASING });
      expandHeight.value = withTiming(0, { duration: 180, easing: CLOSE_EASING });
    }
  };

  const handleCalendar = () => {
    Haptics.selectionAsync();
    addEventToCalendar(event);
  };

  const handleShare = () => {
    Haptics.selectionAsync();
    const message = `${event.title}\n${formatTime(event.start)} – ${formatTime(event.end)}\n${event.shortDescription}`;
    Share.share({ message });
  };

  return (
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
        {/* Thumbnail: image if available, icon fallback */}
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
              {/* Icon badge over image */}
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
        {/* Compact right actions: heart + menu dots */}
        <View style={styles.actions}>
          <Pressable onPress={handleFavorite} hitSlop={10} accessibilityLabel={favorite ? 'Treure de favorits' : 'Afegir a favorits'}>
            {favorite
              ? <Heart size={20} color={Colors.primary} fill={Colors.primary} />
              : <HeartOff size={20} color={Colors.textDim} />}
          </Pressable>
          {!isFinished && (
            <Pressable onPress={handleMenu} hitSlop={10} accessibilityLabel="Més opcions">
              {expanded
                ? <X size={18} color={Colors.textDim} />
                : <Ellipsis size={18} color={Colors.textDim} />}
            </Pressable>
          )}
        </View>
      </Pressable>

      {/* Expandable action bar */}
      {!isFinished && (
        <Animated.View style={[styles.actionBar, animatedBar]}>
          <View style={styles.actionBarInner}>
            <Pressable style={styles.actionBtn} onPress={handleCalendar} accessibilityLabel="Afegir al calendari">
              <CalendarPlus size={16} color={Colors.textDim} />
              <Text style={styles.actionBtnText}>Calendari</Text>
            </Pressable>
            <View style={styles.actionSep} />
            <Pressable style={styles.actionBtn} onPress={handleShare} accessibilityLabel="Compartir">
              <Share2 size={16} color={Colors.textDim} />
              <Text style={styles.actionBtnText}>Compartir</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
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
  actionBar: {
    backgroundColor: Colors.surfaceHigh,
    overflow: 'hidden',
  },
  actionBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  actionBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
  actionSep: { width: 1, height: 16, backgroundColor: Colors.border },
});
