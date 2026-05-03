import { Colors } from '@/shared/constants';
import { Screen } from '@/shared/ui';
import { router } from 'expo-router';
import { BookImage, ChevronRight, ImageIcon } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

import { POSTERS } from '@/features/recursos';
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
    count: POSTERS.length,
    available: true,
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
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[!item.available && styles.cardDim, animStyle]}>
      <Pressable
        style={styles.card}
        onPress={() => item.available && router.push(item.href as never)}
        onPressIn={() => { if (item.available) scale.value = withTiming(0.96, { duration: 80 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 10, stiffness: 200 }); }}
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
    </Animated.View>
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
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  cardDim: { opacity: 0.55 },
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
    fontVariant: ['tabular-nums'],
  },
});
