import { getEventTypeLabel, type Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { formatTime } from '@/shared/lib';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, MapPin } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import ReAnimated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const DEFAULT_BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';
const HERO_H = 280;

interface Props {
  event: Event;
  onPress: () => void;
}

export function HeroCard({ event, onPress }: Props) {
  const isLive = event.state === 'now';
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // Pulsing live dot animation (opacity 1 → 0.2 → 1 every 1.8 s)
  const dotOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isLive) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.2, duration: 900, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [isLive, dotOpacity]);

  return (
    <ReAnimated.View style={[styles.hero, animStyle]}>
      <Image
        source={event.imageUrl ? { uri: event.imageUrl } : undefined}
        style={styles.heroImage}
        contentFit="cover"
        transition={400}
        placeholder={{ blurhash: event.blurhash ?? DEFAULT_BLURHASH }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.heroGradient}
        pointerEvents="none"
      >
        {isLive && (
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
            <Text style={styles.liveBadgeText}>{t('now.liveBadge')}</Text>
          </View>
        )}
        <View style={styles.heroContent}>
          <Text style={styles.heroType}>
            {getEventTypeLabel(event.type).toUpperCase()}
          </Text>
          <Text style={styles.heroTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.heroMeta}>
            <Clock size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroMetaText}>
              {formatTime(event.start)} – {formatTime(event.end)}
            </Text>
            {event.locationName && (
              <>
                <Text style={styles.heroMetaDot}>·</Text>
                <MapPin size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroMetaText} numberOfLines={1}>{event.locationName}</Text>
              </>
            )}
          </View>
        </View>
      </LinearGradient>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onPress}
        onPressIn={() => { scale.value = withTiming(0.96, { duration: 80 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 10, stiffness: 200 }); }}
        accessibilityRole="button"
        accessibilityLabel={event.title}
        accessibilityHint={t('now.tapHintShortA11y')}
      />
    </ReAnimated.View>
  );
}

const styles = StyleSheet.create({
  hero: { marginHorizontal: 16, marginBottom: 20, borderRadius: 20, overflow: 'hidden', height: HERO_H },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  heroGradient: { flex: 1, height: HERO_H, justifyContent: 'space-between', padding: 16 },
  heroContent: { gap: 4 },
  heroType: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 28 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  heroMetaText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontVariant: ['tabular-nums'] },
  heroMetaDot: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: Colors.stateNow,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
});
