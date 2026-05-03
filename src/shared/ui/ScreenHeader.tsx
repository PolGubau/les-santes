import { Colors } from '@/shared/constants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BackButton } from './BackButton';

interface Props {
  title: string;
  subtitle?: string;
  /** Replace the default back button behaviour */
  onBack?: () => void;
  /** Optional slot for an action on the right side */
  right?: React.ReactNode;
}

/**
 * Standard header for stack screens:
 *   [ ← ]  Title          [right?]
 *           Subtitle
 * Has a bottom border and consistent padding.
 */
export function ScreenHeader({ title, subtitle, onBack, right }: Props) {
  return (
    <View style={styles.root}>
      <BackButton onPress={onBack} />

      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  textBlock: { flex: 1 },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  subtitle: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  right: { flexShrink: 0 },
});
