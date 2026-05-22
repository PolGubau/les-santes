import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

interface Props {
  /**
   * `default` — bordered box for use inside a ScreenHeader (on light bg).
   * `overlay` — circular semi-transparent pill for floating over images.
   */
  variant?: 'default' | 'overlay';
  onPress?: () => void;
  style?: ViewStyle;
}

export function BackButton({ variant = 'default', onPress, style }: Props) {
  const handlePress = onPress ?? (() => router.back());

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
      style={({ pressed }) => [
        styles.base,
        variant === 'overlay' ? styles.overlay : styles.default,
        pressed && styles.pressed,
        style,
      ]}
    >
      <ArrowLeft
        size={18}
        color={variant === 'overlay' ? '#fff' : Colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  default: {
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overlay: {
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  pressed: { opacity: 0.7 },
});
