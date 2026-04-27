import { MOCK_EVENTS } from '@/entities/event';
import { NowList, useNowEvents } from '@/features/now';
import { Colors } from '@/shared/constants';
import { useNow } from '@/shared/hooks';
import { Screen } from '@/shared/ui';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function LiveClock() {
  const time = useNow(1_000);
  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  const s = time.getSeconds().toString().padStart(2, '0');

  return (
    <Text style={styles.clock}>
      {h}:{m}<Text style={styles.clockSec}>:{s}</Text>
    </Text>
  );
}

export default function AraScreen() {
  const { now, upcoming } = useNowEvents(MOCK_EVENTS);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ara mateix</Text>
          <Text style={styles.subtitle}>Les Santes · Mataró</Text>
        </View>
        <LiveClock />
      </View>

      {now.length > 0 && (
        <View style={styles.liveBar}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            {now.length} acte{now.length !== 1 ? 's' : ''} en curs
          </Text>
        </View>
      )}

      <NowList now={now} upcoming={upcoming} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: Colors.textDim, fontSize: 12, marginTop: 2 },
  clock: { color: Colors.text, fontSize: 22, fontWeight: '300', fontVariant: ['tabular-nums'] },
  clockSec: { color: Colors.textDim, fontSize: 18 },
  liveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.stateNow,
  },
  liveText: { color: Colors.stateNow, fontSize: 12, fontWeight: '600' },

});
