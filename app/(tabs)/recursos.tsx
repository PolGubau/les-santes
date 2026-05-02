import { CARTELLS, CartellCard, PostalCard } from '@/features/recursos';
import { Colors } from '@/shared/constants';
import { Screen } from '@/shared/ui';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import POSTALS from '@/shared/data/postals.json';

const GAP = 12;
const PADDING = 16;

export default function RecursosScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recursos</Text>
          <Text style={styles.headerSub}>Cartells i postals de Les Santes</Text>
        </View>

        {/* ── CARTELLS ───────────────────────────────────────────────── */}
        <SectionTitle
          title="Cartells"
          subtitle="Pòsters oficials de cada any"
        />
        <View style={styles.grid}>
          {CARTELLS.map((c) => (
            <CartellCard key={c.year} cartell={c} width={cardWidth} />
          ))}
        </View>

        {/* ── POSTALS DE GEGANTS ─────────────────────────────────────── */}
        <SectionTitle
          title="Postals de Gegants"
          subtitle={`${POSTALS.length} postals de geganters convidats`}
        />
        <View style={styles.postalsList}>
          {[...POSTALS].reverse().map((p) => (
            <PostalCard
              key={p.id}
              postal={p}
              width={width - PADDING * 2}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSub}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: PADDING,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionAccent: {
    width: 4,
    height: 36,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSub: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  postalsList: {
    gap: GAP,
  },
});
