import { Colors } from '@/shared/constants';
import { useReducedMotion } from '@/shared/hooks';
import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * Shared shimmer animation for all skeleton components.
 * Returns an Animated.View style with a pulsing opacity. When the user has
 * enabled "Reduce motion" the shimmer is locked to a static mid-opacity so
 * the placeholder is still visible but does not pulse.
 */
export function useShimmer() {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(reduced ? 0.7 : 0.4);
  useEffect(() => {
    if (reduced) {
      opacity.value = 0.7;
      return;
    }
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity, reduced]);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

/**
 * A single rectangular placeholder block.
 * Pass any ViewStyle overrides via `style` to control size, borderRadius, etc.
 */
export function SkeletonBox({ style }: { style?: ViewStyle | ViewStyle[] }) {
  return <View style={[styles.box, ...(Array.isArray(style) ? style : [style])]} />;
}

const styles = StyleSheet.create({
  box: { backgroundColor: Colors.surfaceHigh, borderRadius: 6 },
});
