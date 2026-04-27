import type { Event } from '@/entities/event';
import { useFavoritesStore } from '@/features/favorites';
import { Colors } from '@/shared/constants';
import { addEventToCalendar, formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import React, { useRef } from 'react';
import { Animated, Pressable, Share, StyleSheet, Text, View } from 'react-native';

interface Props {
  event: Event;
  onPress?: () => void;
  distanceMeters?: number;
}

export function EventCard({ event, onPress, distanceMeters }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const isFinished = event.state === 'finished';
  const stateLabel = event.state === 'now' ? 'En curs' : event.state === 'upcoming' ? 'Proximament' : 'Acabat';

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(event.id);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, tension: 200, friction: 7, useNativeDriver: true }).start();
  };

  const handleFavorite = () => {
    Haptics.impactAsync(favorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(event);
  };

  const handleCalendar = () => {
    Haptics.selectionAsync();
    addEventToCalendar(event);
  };

  const handleShare = async () => {
    Haptics.selectionAsync();
    const message = `${event.title}\n${formatTime(event.start)} – ${formatTime(event.end)}\n${event.shortDescription}`;
    if (await Sharing.isAvailableAsync()) {
      // Native share sheet
      await Share.share({ message });
    } else {
      await Share.share({ message });
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
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
        {/* Actions */}
        <View style={styles.actions}>
          <Pressable onPress={handleFavorite} hitSlop={8} accessibilityLabel={favorite ? 'Treure de favorits' : 'Afegir a favorits'}>
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={18} color={favorite ? Colors.primary : Colors.textDim} />
          </Pressable>
          {!isFinished && (
            <>
              <Pressable onPress={handleCalendar} hitSlop={8} accessibilityLabel="Afegir al calendari">
                <Ionicons name="calendar-outline" size={17} color={Colors.textDim} />
              </Pressable>
              <Pressable onPress={handleShare} hitSlop={8} accessibilityLabel="Compartir">
                <Ionicons name="share-outline" size={17} color={Colors.textDim} />
              </Pressable>
            </>
          )}
        </View>
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
  content: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  textDim: { color: Colors.textMuted },
  desc: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  time: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 0,
  },
});
