import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface Props {
  label?: string;
  size?: 'small' | 'large';
}

export function LoadingState({ label, size = 'large' }: Props) {
  const text = label ?? t('loading.default');
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={Colors.primary} />
      {text ? <Text style={styles.label}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});
