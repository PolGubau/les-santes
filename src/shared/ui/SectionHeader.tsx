import { Colors } from '@/shared/constants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  title: string;
  count?: number;
}

export function SectionHeader({ title, count }: Props) {
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
});
