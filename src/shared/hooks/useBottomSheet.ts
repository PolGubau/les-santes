import { useCallback, useMemo, useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

const DISMISS_THRESHOLD = 100;
const EXPAND_THRESHOLD  = 40;   // dy upward to jump from peek → full
const COLLAPSE_THRESHOLD = 60;  // dy downward to jump from full → peek

interface Options {
  height: number;
  /**
   * If provided, the sheet opens to this height first (peek state).
   * Dragging up expands to full `height`; dragging down dismisses.
   */
  peekHeight?: number;
  onClose: () => void;
}

export function useBottomSheet({ height, peekHeight, onClose }: Options) {
  // translateY = 0 → fully open  |  translateY = height → off-screen
  const translateY = useRef(new Animated.Value(height)).current;

  // Memoized so a new interpolation node is only created when dimensions change,
  // not on every render.
  const overlayOpacity = useMemo(() => {
    const peekPos = peekHeight ? height - peekHeight : 0;
    return translateY.interpolate({
      inputRange:  [0, peekPos, height],
      outputRange: [0.55, peekHeight ? 0.3 : 0.55, 0],
      extrapolate: 'clamp',
    });
  }, [translateY, height, peekHeight]);

  // Mutable refs so the PanResponder (created once) always reads current values.
  const heightRef    = useRef(height);
  const peekHeightRef = useRef(peekHeight);
  const onCloseRef   = useRef(onClose);
  const snapState    = useRef<'peek' | 'full'>(peekHeight ? 'peek' : 'full');
  heightRef.current    = height;
  peekHeightRef.current = peekHeight;
  onCloseRef.current   = onClose;

  const snapTo = useCallback((toValue: number) => {
    Animated.spring(translateY, {
      toValue,
      damping: 20,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  // `height` and `peekHeight` are direct deps (not via refs) so that the
  // reference changes when props change — the BottomSheet useEffect re-fires
  // and the sheet re-opens to the correct snap position.
  const open = useCallback(() => {
    const target = peekHeight ? height - peekHeight : 0;
    snapState.current = peekHeight ? 'peek' : 'full';
    snapTo(target);
  }, [snapTo, height, peekHeight]);

  const dismiss = useCallback(() => {
    Animated.timing(translateY, {
      toValue: heightRef.current,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onCloseRef.current());
  }, [translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        const h    = heightRef.current;
        const peek = peekHeightRef.current;
        const base = peek && snapState.current === 'peek' ? h - peek : 0;
        const next = base + g.dy;
        if (next >= 0) translateY.setValue(Math.min(next, h));
      },
      onPanResponderRelease: (_, g) => {
        const h    = heightRef.current;
        const peek = peekHeightRef.current;
        const peekPosition = peek ? h - peek : 0;

        // Dismiss — flick down or drag past threshold
        if (g.dy > DISMISS_THRESHOLD || g.vy > 1.2) {
          Animated.timing(translateY, {
            toValue: h,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onCloseRef.current());
          return;
        }

        if (peek) {
          if (snapState.current === 'peek' && (g.dy < -EXPAND_THRESHOLD || g.vy < -0.5)) {
            // Drag up from peek → expand to full
            snapState.current = 'full';
            Animated.spring(translateY, { toValue: 0, damping: 20, stiffness: 220, mass: 0.8, useNativeDriver: true }).start();
          } else if (snapState.current === 'full' && g.dy > COLLAPSE_THRESHOLD) {
            // Drag down from full → collapse to peek
            snapState.current = 'peek';
            Animated.spring(translateY, { toValue: peekPosition, damping: 20, stiffness: 220, mass: 0.8, useNativeDriver: true }).start();
          } else {
            // Snap back to current position
            Animated.spring(translateY, {
              toValue: snapState.current === 'peek' ? peekPosition : 0,
              damping: 18, stiffness: 250, useNativeDriver: true,
            }).start();
          }
        } else {
          Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 250, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return { translateY, overlayOpacity, panResponder, open, dismiss };
}
