import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { Link } from 'expo-router';
import { Compass } from 'lucide-react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '@/shared/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Compass size={56} color={Colors.textDim} />
      <Text style={styles.title}>{t('notFound.title')}</Text>
      <Text style={styles.desc}>{t('notFound.description')}</Text>
      <Link href="/(tabs)/ara" style={styles.link}>
        <Text style={styles.linkText}>{t('notFound.backToHome')}</Text>
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
