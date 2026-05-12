import { COMPARSES } from '@/features/recursos/data/comparses';
import { Colors } from '@/shared/constants';
import { BackButton } from '@/shared/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Flame, Music, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IMAGE_H = 300;

export default function ComparsaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const comparsa = COMPARSES.find((c) => c.id === id);

  if (!comparsa) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Comparsa no trobada.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero image */}
      <View style={styles.imageWrap}>
        <Image
          source={comparsa.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.25)', 'transparent', Colors.background]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <BackButton
          variant="overlay"
          style={{ position: 'absolute', top: insets.top + 12, left: 16 }}
        />
        {/* Fire badge */}
        {comparsa.isFire && (
          <View style={[styles.fireBadge, { top: insets.top + 12, right: 16 }]}>
            <Flame size={13} color="#fff" />
            <Text style={styles.fireBadgeText}>Figura de foc</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{comparsa.emoji}</Text>
          <View style={styles.headerText}>
            <Text style={styles.since}>{comparsa.since}</Text>
            <Text style={styles.name}>{comparsa.name}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{comparsa.type}</Text>
            </View>
          </View>
        </View>

        {/* Full description */}
        {comparsa.fullDesc.split('\n\n').map((para, i) => (
          <Text key={i} style={styles.paragraph}>{para.trim()}</Text>
        ))}

        {/* Facts */}
        <View style={styles.factsCard}>
          <Text style={styles.factsTitle}>Sabies que…</Text>
          {comparsa.facts.map((fact, i) => (
            <View key={i} style={styles.factRow}>
              <View style={styles.factDot} />
              <Text style={styles.factText}>{fact}</Text>
            </View>
          ))}
        </View>

        {/* Music + Portadors */}
        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Music size={16} color={Colors.primary} />
            <Text style={styles.metaLabel}>Música</Text>
            <Text style={styles.metaValue}>{comparsa.music}</Text>
          </View>
          <View style={styles.metaCard}>
            <Users size={16} color={Colors.primary} />
            <Text style={styles.metaLabel}>Portadors</Text>
            <Text style={styles.metaValue}>{comparsa.portadors}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  imageWrap: { height: IMAGE_H, backgroundColor: Colors.surface },
  fireBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(200,50,10,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  fireBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  emoji: { fontSize: 40, lineHeight: 48 },
  headerText: { flex: 1, gap: 4 },
  since: { color: Colors.textDim, fontSize: 12, fontWeight: '600' },
  name: { color: Colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.5, lineHeight: 28 },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  typeBadgeText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  paragraph: { color: Colors.text, fontSize: 15, lineHeight: 24 },
  factsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  factsTitle: { color: Colors.text, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  factRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  factDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 8, flexShrink: 0 },
  factText: { flex: 1, color: Colors.textMuted, fontSize: 13, lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: 10 },
  metaCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  metaLabel: { color: Colors.textDim, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  metaValue: { color: Colors.text, fontSize: 13, lineHeight: 18 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textMuted, fontSize: 15 },
});
