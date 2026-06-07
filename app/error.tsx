import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@/shared/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ErrorScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <AlertCircle size={56} color={Colors.primary} />
      <Text style={styles.title}>{t('error.screenTitle')}</Text>
      <Text style={styles.desc}>{t('error.screenDescription')}</Text>
      <Pressable
        style={styles.button}
        onPress={() => router.replace('/(tabs)/ara')}
        accessibilityRole="button"
        accessibilityLabel={t('notFound.backToHome')}
      >
        <Text style={styles.buttonText}>{t('notFound.backToHome')}</Text>
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
