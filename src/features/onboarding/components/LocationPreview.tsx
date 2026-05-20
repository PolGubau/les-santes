import { Colors } from '@/shared/constants';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const W = 268;
const H = 184;

function PulseRing({ delay, size }: { delay: number; size: number }) {
  const scale = useSharedValue(0.35);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.35, { duration: 0 }),
          withTiming(1.4, { duration: 2800, easing: Easing.out(Easing.cubic) }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 0 }),
          withTiming(0, { duration: 2800, easing: Easing.out(Easing.cubic) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, { width: size, height: size, borderRadius: size / 2, marginLeft: -size / 2, marginTop: -size / 2 }, style]}
    />
  );
}

export function LocationPreview() {
  return (
    <Animated.View
      entering={FadeIn.duration(600).delay(160)}
      style={styles.card}
    >
      {/* faux streets */}
      <View style={[styles.street, { top: 44, transform: [{ rotate: '-12deg' }] }]} />
      <View style={[styles.street, { top: 110, transform: [{ rotate: '8deg' }] }]} />
      <View style={[styles.streetV, { left: 80, transform: [{ rotate: '6deg' }] }]} />
      <View style={[styles.streetV, { left: 200, transform: [{ rotate: '-10deg' }] }]} />

      {/* nearby events */}
      <View style={[styles.dot, { top: 38, left: 56, backgroundColor: '#FFB139' }]} />
      <View style={[styles.dot, { top: 138, left: 64, backgroundColor: '#8F7CE3' }]} />
      <View style={[styles.dot, { top: 56, right: 36, backgroundColor: '#00CAB1' }]} />
      <View style={[styles.dot, { bottom: 32, right: 56, backgroundColor: '#FFB139' }]} />

      {/* center pin with pulse rings */}
      <View style={styles.pinAnchor} pointerEvents="none">
        <PulseRing delay={0} size={120} />
        <PulseRing delay={1400} size={120} />
        <View style={styles.pin}>
          <View style={styles.pinInner} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: W,
    height: H,
    borderRadius: 24,
    backgroundColor: Colors.surfaceHigh,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  street: {
    position: 'absolute',
    left: -40,
    right: -40,
    height: 18,
    backgroundColor: Colors.surface,
    opacity: 0.7,
  },
  streetV: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 14,
    backgroundColor: Colors.surface,
    opacity: 0.7,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  pinAnchor: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: Colors.primary,
  },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -14,
    marginTop: -14,
    shadowColor: Colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  pinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});
