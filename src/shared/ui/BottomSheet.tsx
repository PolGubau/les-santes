import { Colors } from '@/shared/constants';
import { useBottomSheet } from '@/shared/hooks';
import React, { useEffect, useState } from 'react';
import { Animated, Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onClose: () => void;
  height?: number;
  /** Initial visible height (peek state). Dragging up expands to full height. */
  peekHeight?: number;
  children: React.ReactNode;
}

export function BottomSheet({ onClose, height = 420, peekHeight, children }: Props) {
  const insets = useSafeAreaInsets();
  const { translateY, overlayOpacity, panResponder, open, dismiss } = useBottomSheet({
    height,
    peekHeight,
    onClose,
  });

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    open();
  }, [open]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  return (
    <View style={[styles.overlay, { bottom: keyboardHeight }]}>
      {/* Dim layer — visual only, never blocks touches */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.dim, { opacity: overlayOpacity }]}
        pointerEvents="none"
      />
      {/* Tap-to-dismiss — always active regardless of overlay opacity */}
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + 16, transform: [{ translateY }] },
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
        </View>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  dim: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 0,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handleArea: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
});
