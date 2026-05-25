import { Colors } from '@/shared/constants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  title: string;
  count?: number;
  /**
   * When provided, switches to the compact "boxed" variant used inside cards
   * (uppercase title, color-coded accent bar, bordered count badge). Leave
   * undefined for the default open variant rendered above content.
   */
  accentColor?: string;
}

export function SectionHeader({ title, count, accentColor }: Props) {
  if (accentColor) {
    return (
      <View style={styles.boxedContainer}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <Text style={styles.boxedTitle}>{title}</Text>
        {count != null && (
          <View style={[styles.countBadge, { borderColor: accentColor }]}>
            <Text style={[styles.countBadgeText, { color: accentColor }]}>{count}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {count != null && <Text style={styles.count}>{count}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, marginBottom: 12,
  },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  count: {
    color: Colors.textMuted, fontSize: 13,
    backgroundColor: Colors.surface,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
    overflow: 'hidden',
    fontVariant: ['tabular-nums'],
  },
  // ── Boxed variant (in-card, color-coded) ──────────────────────────────────
  boxedContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  accentBar: { width: 3, height: 16, borderRadius: 2 },
  boxedTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 13, fontWeight: '700',
    letterSpacing: 0.6, textTransform: 'uppercase',
  },
  countBadge: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 10, borderWidth: 1,
  },
  countBadgeText: { fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
