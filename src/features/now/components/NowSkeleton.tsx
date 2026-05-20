import { Colors } from '@/shared/constants';
import { SkeletonBox as Box, useShimmer } from '@/shared/ui/Skeleton';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

// ─── HeroCard skeleton ────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <View style={styles.hero}>
      {/* Live badge placeholder */}
      <View style={styles.heroBadge} />
      {/* Title lines */}
      <View style={styles.heroContent}>
        <Box style={styles.heroTypeBar} />
        <Box style={styles.heroTitleBar} />
        <Box style={styles.heroTitleBarShort} />
        <View style={styles.heroMeta}>
          <Box style={styles.heroMetaIcon} />
          <Box style={styles.heroMetaText} />
        </View>
      </View>
    </View>
  );
}

// ─── Section header skeleton ──────────────────────────────────────────────────
function SectionHeaderSkeleton() {
  return (
    <View style={styles.sectionHeader}>
      <Box style={styles.sectionDot} />
      <Box style={styles.sectionTitle} />
      <Box style={styles.sectionBadge} />
    </View>
  );
}

// ─── UpcomingRow skeleton ─────────────────────────────────────────────────────
function UpcomingRowSkeleton() {
  return (
    <View style={styles.row}>
      <Box style={styles.rowThumb} />
      <View style={styles.rowContent}>
        <Box style={styles.rowTitle} />
        <Box style={styles.rowMeta} />
      </View>
      <Box style={styles.rowBadge} />
    </View>
  );
}

// ─── NowCard skeleton (horizontal strip) ─────────────────────────────────────
function NowCardSkeleton() {
  return <Box style={styles.nowCard} />;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function NowSkeleton() {
  const anim = useShimmer();

  return (
    <ScrollView
      style={styles.scroll}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={anim}>
        {/* Hero */}
        <HeroSkeleton />

        {/* Ara Mateix strip */}
        <SectionHeaderSkeleton />
        <ScrollView
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nowStrip}
        >
          <NowCardSkeleton />
          <NowCardSkeleton />
        </ScrollView>

        {/* A continuació */}
        <View style={styles.upcomingSection}>
          <SectionHeaderSkeleton />
          <UpcomingRowSkeleton />
          <UpcomingRowSkeleton />
          <UpcomingRowSkeleton />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    marginHorizontal: 16,
    marginBottom: 20,
    height: 280,
    borderRadius: 20,
    backgroundColor: Colors.surfaceHigh,
    justifyContent: 'space-between',
    padding: 16,
  },
  heroBadge: { width: 72, height: 22, borderRadius: 8, backgroundColor: Colors.border },
  heroContent: { gap: 8 },
  heroTypeBar: { width: 60, height: 10, borderRadius: 4 },
  heroTitleBar: { width: '80%', height: 22, borderRadius: 6 },
  heroTitleBarShort: { width: '55%', height: 22, borderRadius: 6 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  heroMetaIcon: { width: 13, height: 13, borderRadius: 3 },
  heroMetaText: { width: 120, height: 12, borderRadius: 4 },

  // ── Section header ────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  sectionDot: { width: 7, height: 7, borderRadius: 4 },
  sectionTitle: { width: 100, height: 12, borderRadius: 4 },
  sectionBadge: { width: 24, height: 18, borderRadius: 8 },

  // ── NowCard strip ─────────────────────────────────────────────────────────
  nowStrip: { paddingLeft: 16, paddingRight: 8, gap: 12, paddingBottom: 4 },
  nowCard: { width: 160, height: 200, borderRadius: 16 },

  // ── UpcomingRow ───────────────────────────────────────────────────────────
  upcomingSection: { marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 16,
    backgroundColor: Colors.surface,
  },
  rowThumb: { width: 56, height: 56, borderRadius: 12, flexShrink: 0 },
  rowContent: { flex: 1, gap: 8 },
  rowTitle: { height: 13, width: '70%', borderRadius: 4 },
  rowMeta: { height: 11, width: '45%', borderRadius: 4 },
  rowBadge: { width: 44, height: 26, borderRadius: 8, flexShrink: 0 },
});
