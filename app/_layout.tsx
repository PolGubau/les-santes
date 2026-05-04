import { Colors } from '@/shared/constants';
import { useLocaleStore } from '@/shared/hooks/useLocale';
import { i18n } from '@/shared/i18n';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AlertCircle } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

// Expo Router picks up this named export as the error boundary for the root segment
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <AlertCircle size={56} color={Colors.primary} />
      <Text style={styles.title}>Quelcom ha anat malament</Text>
      <Text style={styles.desc}>{error.message}</Text>
      <Pressable
        style={styles.button}
        onPress={retry}
        accessibilityRole="button"
        accessibilityLabel="Tornar a intentar"
      >
        <Text style={styles.buttonText}>Tornar a intentar</Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace('/(tabs)/ara')}
        accessibilityRole="button"
        accessibilityLabel="Tornar a l'inici"
      >
        <Text style={styles.link}>Tornar a l'inici</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Apply persisted locale before first render
  const locale = useLocaleStore((s) => s.locale);
  useEffect(() => {
    i18n.locale = locale;
  }, [locale]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
  desc: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  button: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  link: { color: Colors.primary, fontSize: 14, marginTop: 4 },
});
