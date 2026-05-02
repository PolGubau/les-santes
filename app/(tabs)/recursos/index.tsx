import { Colors } from '@/shared/constants';
import { Screen } from '@/shared/ui';
import { router } from 'expo-router';
import { BookImage, ChevronRight, ImageIcon } from 'lucide-react-native';
import type React from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import POSTALS from '@/shared/data/postals.json';

interface ResourceItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
  count?: number;
  available: boolean;
}

const RESOURCES: ResourceItem[] = [
  {
    id: 'postals',
    title: 'Postals de Gegants',
    subtitle: 'Escaneacions de postals de geganters convidats',
    href: '/recursos/postals',
    Icon: BookImage,
    count: POSTALS.length,
    available: true,
  },
  {
    id: 'cartells',
    title: 'Cartells Oficials',
    subtitle: 'Pòsters oficials del festival de cada any',
    href: '/recursos/cartells',
    Icon: ImageIcon,
    available: false, // pending poster images
  },
];

export default function RecursosScreen() {
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Recursos</Text>
          <Text style={styles.subtitle}>Arxiu del festival</Text>
        </View>

        <View style={styles.list}>
          {RESOURCES.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function ResourceCard({ item }: { item: ResourceItem }) {
  const { Icon } = item;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        !item.available && styles.cardDim,
        pressed && item.available && styles.cardPressed,
      ]}
      onPress={() => item.available && router.push(item.href as never)}
      disabled={!item.available}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityState={{ disabled: !item.available }}
    >
      <View style={styles.cardIcon}>
        <Icon size={24} color={item.available ? Colors.primary : Colors.textDim} />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>
        {!item.available && (
          <Text style={styles.cardSoon}>Pròximament</Text>
        )}
      </View>

      <View style={styles.cardRight}>
        {item.count != null && (
          <Text style={styles.cardCount}>{item.count}</Text>
        )}
        <ChevronRight
          size={18}
          color={item.available ? Colors.textDim : Colors.border}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  header: { paddingTop: 20, paddingBottom: 24 },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 2 },
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  cardDim: { opacity: 0.55 },
  cardPressed: { backgroundColor: Colors.surfaceHigh },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: { flex: 1, gap: 3 },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  cardSubtitle: { color: Colors.textMuted, fontSize: 12, lineHeight: 17 },
  cardSoon: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardCount: {
    color: Colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
});
