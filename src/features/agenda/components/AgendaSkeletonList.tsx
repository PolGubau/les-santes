import { Colors } from '@/shared/constants';
import { SkeletonBox, useShimmer } from '@/shared/ui/Skeleton';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

const THUMB = 52;
const N_ROWS = 6;

function SkeletonRow() {
  return (
    <View style={styles.row}>
      <SkeletonBox style={styles.thumb} />
      <View style={styles.content}>
        <SkeletonBox style={styles.titleLine} />
        <SkeletonBox style={styles.descLine} />
      </View>
    </View>
  );
}

export function AgendaSkeletonList() {
  const anim = useShimmer();

  return (
    <View style={styles.container}>
      {/* Fake section header */}
      <Animated.View style={[styles.sectionCard, anim]}>
        <View style={styles.sectionHeader}>
          <SkeletonBox style={styles.accentBar} />
          <SkeletonBox style={styles.sectionTitle} />
        </View>
        <View style={styles.divider} />
        {Array.from({ length: N_ROWS }).map((_, i) => (
          <React.Fragment key={i}>
            <SkeletonRow />
            {i < N_ROWS - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  accentBar: { width: 4, height: 20, borderRadius: 2 },
  sectionTitle: { width: 100, height: 14, borderRadius: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  thumb: { width: THUMB, height: THUMB, borderRadius: 10 },
  content: { flex: 1, gap: 6 },
  titleLine: { height: 13, width: '70%', borderRadius: 4 },
  descLine: { height: 11, width: '50%', borderRadius: 4 },
});
