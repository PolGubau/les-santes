import { Colors } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ErrorScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Ionicons name="alert-circle-outline" size={56} color={Colors.primary} />
      <Text style={styles.title}>Quelcom ha anat malament</Text>
      <Text style={styles.desc}>
        S'ha produït un error inesperat. Torna a l'inici i ho tornem a intentar.
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => router.replace('/(tabs)/ara')}
        accessibilityRole="button"
        accessibilityLabel="Tornar a l'inici"
      >
        <Text style={styles.buttonText}>Tornar a l'inici</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: 14,
    padding: 32,
  },
  title: { color: Colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  desc: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  button: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
