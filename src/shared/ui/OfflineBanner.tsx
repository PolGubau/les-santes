import { Colors } from '@/shared/constants';
import { WifiOff } from 'lucide-react-native';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  /** Timestamp (ms) of the last cached data, or null if unknown. */
  cacheTimestamp: number | null;
  /** Called when the user taps "Actualitza". */
  onRefresh?: () => void;
}

function formatAge(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 2) return 'fa un moment';
  if (diffMin < 60) return `fa ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `fa ${diffH} h`;
  return `fa ${Math.round(diffH / 24)} d`;
}

export const OfflineBanner = memo(function OfflineBanner({ cacheTimestamp, onRefresh }: Props) {
  return (
    <View style={styles.banner}>
      <WifiOff size={14} color={Colors.text} style={styles.icon} />
      <Text style={styles.text} numberOfLines={1}>
        Sense connexió
        {cacheTimestamp ? ` · dades de ${formatAge(cacheTimestamp)}` : ''}
      </Text>
      {onRefresh && (
        <Pressable onPress={onRefresh} hitSlop={8} style={styles.btn}>
          <Text style={styles.btnText}>Actualitza</Text>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceHigh,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: 6,
  },
  icon: { flexShrink: 0 },
  text: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 12,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
