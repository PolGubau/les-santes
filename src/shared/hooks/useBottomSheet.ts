import { useCallback, useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

const DISMISS_THRESHOLD = 100;

interface Options {
  height: number;
  onClose: () => void;
}

export function useBottomSheet({ height, onClose }: Options) {
  const translateY = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const open = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, overlayOpacity]);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  }, [translateY, overlayOpacity, height, onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_THRESHOLD || g.vy > 1.2) {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: height,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
          ]).start(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 18,
            stiffness: 250,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return { translateY, overlayOpacity, panResponder, open, dismiss };
}
