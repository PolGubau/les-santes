import type { Event } from '@/entities/event';
import { useFavoritesStore } from '@/features/favorites';
import { Colors } from '@/shared/constants';
import { addEventToCalendar, formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface Props {
  event: Event;
  onPress?: () => void;
  distanceMeters?: number;
}

export function EventCard({ event, onPress, distanceMeters }: Props) {
  const scale = useSharedValue(1);
  const expandProgress = useSharedValue(0);
  const [expanded, setExpanded] = useState(false);
  const isFinished = event.state === 'finished';
  const stateLabel = event.state === 'now' ? 'En curs' : event.state === 'upcoming' ? 'Proximament' : 'Acabat';

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(event.id);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const actionBarStyle = useAnimatedStyle(() => ({
    height: interpolate(expandProgress.value, [0, 1], [0, 40]),
    overflow: 'hidden',
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withTiming(0.97, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 200, damping: 15 });
  };

  const handleFavorite = () => {
    Haptics.impactAsync(favorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(event.id);
  };

  const handleMenu = () => {
    Haptics.selectionAsync();
    const next = !expanded;
    setExpanded(next);
    expandProgress.value = withSpring(next ? 1 : 0, { stiffness: 160, damping: 20 });
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
    <Animated.View style={cardStyle}>
      <Pressable
        style={({ pressed }) => [styles.row, isFinished && styles.rowDim, pressed && styles.rowPressed]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${event.title}. ${stateLabel}. De ${formatTime(event.start)} a ${formatTime(event.end)}`}
        accessibilityState={{ disabled: isFinished }}
      >
        <View style={styles.iconBox}>
          <EventIcon icon={event.icon} size={20} color={isFinished ? Colors.textDim : Colors.text} />
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
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={20} color={favorite ? Colors.primary : Colors.textDim} />
          </Pressable>
          {!isFinished && (
            <Pressable onPress={handleMenu} hitSlop={10} accessibilityLabel="Més opcions">
              <Ionicons name={expanded ? 'close-circle-outline' : 'ellipsis-horizontal'} size={18} color={Colors.textDim} />
            </Pressable>
          )}
        </View>
      </Pressable>

      {/* Expandable action bar */}
      {!isFinished && (
        <Animated.View style={[styles.actionBar, actionBarStyle]}>
          <View style={styles.actionBarInner}>
            <Pressable style={styles.actionBtn} onPress={handleCalendar} accessibilityLabel="Afegir al calendari">
              <Ionicons name="calendar-outline" size={16} color={Colors.textDim} />
              <Text style={styles.actionBtnText}>Calendari</Text>
            </Pressable>
            <View style={styles.actionSep} />
            <Pressable style={styles.actionBtn} onPress={handleShare} accessibilityLabel="Compartir">
              <Ionicons name="share-outline" size={16} color={Colors.textDim} />
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
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
  time: { color: Colors.textDim, fontSize: 12, fontWeight: '500', flexShrink: 0 },
  actionBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  actionBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  actionBtnText: { color: Colors.textDim, fontSize: 13, fontWeight: '500' },
  actionSep: { width: 1, height: 18, backgroundColor: Colors.border },
});
