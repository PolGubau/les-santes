import { Colors } from '@/shared/constants';
import { WifiOff } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "No s'han pogut carregar les dades.",
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <WifiOff size={44} color={Colors.textDim} />
      <Text style={styles.title}>Sense connexió</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          style={styles.button}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Tornar a intentar"
        >
          <Text style={styles.buttonText}>Tornar a intentar</Text>
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
