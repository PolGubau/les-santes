import { Colors } from '@/shared/constants';
import { useBottomSheet } from '@/shared/hooks';
import React, { useEffect } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onClose: () => void;
  height?: number;
  children: React.ReactNode;
}

export function BottomSheet({ onClose, height = 420, children }: Props) {
  const insets = useSafeAreaInsets();
  const { translateY, overlayOpacity, panResponder, open, dismiss } = useBottomSheet({
    height,
    onClose,
  });

  useEffect(() => {
    open();
  }, [open]);

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
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
