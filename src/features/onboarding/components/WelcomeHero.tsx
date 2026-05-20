/* eslint-disable @typescript-eslint/no-require-imports */

import { Colors } from '@/shared/constants';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const DRAC = require('../../../../assets/media/comparses/drac.avif');
const ALIGA = require('../../../../assets/media/comparses/aliga.avif');
const MOMEROTA = require('../../../../assets/media/comparses/momerota.avif');

const CARD_W = 132;
const CARD_H = 176;

interface FloatingCardProps {
  source: number;
  rotate: number;
  translateX: number;
  zIndex: number;
  delay: number;
  floatPhase: number;
}

/**
 * Two-layer card:
 *   – outer handles the `entering` opacity (no transform) so Reanimated layout
 *     animations don't conflict with the inner animated transform.
 *   – inner holds the static layout transforms (translateX + rotate) plus the
 *     continuous float (translateY). Float starts after the entering animation
 *     finishes to avoid the visible "pop" when control hands off.
 */
function FloatingCard({ source, rotate, translateX, zIndex, delay, floatPhase }: FloatingCardProps) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withDelay(
      delay + 620,
      withRepeat(
        withTiming(1, { duration: 2800 + floatPhase * 400, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [offset, floatPhase, delay]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX },
      { translateY: -6 + offset.value * -10 },
      { rotate: `${rotate}deg` },
    ],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(560).delay(delay)}
      style={[styles.cardOuter, { zIndex }]}
    >
      <Animated.View style={[styles.card, floatStyle]}>
        <Image source={source} style={styles.cardImage} contentFit="cover" />
        <View style={styles.cardBorder} pointerEvents="none" />
      </Animated.View>
    </Animated.View>
  );
}

export function WelcomeHero() {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.surfaceHigh, 'transparent']}
        style={styles.glow}
        pointerEvents="none"
      />
      <View style={styles.stack}>
        <FloatingCard source={ALIGA} rotate={-10} translateX={-92} zIndex={1} delay={120} floatPhase={0} />
        <FloatingCard source={MOMEROTA} rotate={10} translateX={92} zIndex={1} delay={240} floatPhase={2} />
        <FloatingCard source={DRAC} rotate={0} translateX={0} zIndex={2} delay={360} floatPhase={1} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: CARD_H + 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.9,
  },
  stack: {
    width: CARD_W + 200,
    height: CARD_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOuter: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
});
