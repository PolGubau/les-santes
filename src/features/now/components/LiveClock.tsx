import { Colors } from '@/shared/constants';
import { useNow } from '@/shared/hooks';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

export function LiveClock() {
  const time = useNow(1_000);
  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  const s = time.getSeconds().toString().padStart(2, '0');

  return (
    <Text style={styles.clock}>
      {h}:{m}<Text style={styles.sec}>:{s}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  clock: { color: Colors.text, fontSize: 22, fontWeight: '300', fontVariant: ['tabular-nums'] },
  sec: { color: Colors.textDim, fontSize: 18 },
});
