import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { WifiOff } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message,
  onRetry,
}: Props) {
  const msg = message ?? t('error.defaultMessage');
  return (
    <View style={styles.container}>
      <WifiOff size={44} color={Colors.textDim} />
      <Text style={styles.title}>{t('error.title')}</Text>
      <Text style={styles.message}>{msg}</Text>
      {onRetry && (
        <Pressable
          style={styles.button}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={t('error.retry')}
        >
          <Text style={styles.buttonText}>{t('error.retry')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
