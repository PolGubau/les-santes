import { Colors } from '@/shared/constants';
import { useEffect } from 'react';
import { View, type ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * Shared shimmer animation for all skeleton components.
 * Returns an Animated.View style with a pulsing opacity.
 */
export function useShimmer() {
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);
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
