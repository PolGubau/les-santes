import type { Event } from '@/entities/event';
import { formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const DEFAULT_BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';
const NOW_CARD_W = 160;
const NOW_CARD_H = 200;

interface Props {
  event: Event;
  onPress: () => void;
}

export function NowCard({ event, onPress }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.card, animStyle]}>
      <Image
        source={event.imageUrl ? { uri: event.imageUrl } : undefined}
        style={styles.image}
        contentFit="cover"
        transition={300}
        placeholder={{ blurhash: event.blurhash ?? DEFAULT_BLURHASH }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
        pointerEvents="none"
      >
        <View style={styles.iconBox}>
          <EventIcon icon={event.icon} size={16} color="#fff" />
        </View>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.time}>fins {formatTime(event.end)}</Text>
      </LinearGradient>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onPress}
        onPressIn={() => { scale.value = withTiming(0.96, { duration: 80 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 10, stiffness: 200 }); }}
        accessibilityRole="button"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { width: NOW_CARD_W, height: NOW_CARD_H, borderRadius: 16, overflow: 'hidden' },
  image: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  gradient: { flex: 1, height: NOW_CARD_H, justifyContent: 'flex-end', padding: 12, gap: 4 },
  iconBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  title: { color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 17 },
  time: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontVariant: ['tabular-nums'] },
});
