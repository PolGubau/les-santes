import { Colors } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Ionicons name="compass-outline" size={56} color={Colors.textDim} />
      <Text style={styles.title}>Pàgina no trobada</Text>
      <Text style={styles.desc}>Aquesta ruta no existeix.</Text>
      <Link href="/(tabs)/ara" style={styles.link}>
        <Text style={styles.linkText}>Tornar a l'inici</Text>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: 12,
    padding: 32,
  },
  title: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  desc: { color: Colors.textMuted, fontSize: 14 },
  link: { marginTop: 8 },
  linkText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
});
