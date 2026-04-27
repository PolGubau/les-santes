import { MOCK_EVENTS } from '@/entities/event';
import { NowList, useNowEvents } from '@/features/now';
import { Colors } from '@/shared/constants';
import { Screen } from '@/shared/ui';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

function LiveClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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
  const nowEvents = useNowEvents(MOCK_EVENTS);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ara mateix</Text>
          <Text style={styles.subtitle}>Les Santes · Mataró</Text>
        </View>
        <LiveClock />
      </View>

      {nowEvents.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎭</Text>
          <Text style={styles.emptyTitle}>Res ara mateix</Text>
          <Text style={styles.emptyDesc}>Consulta l'agenda per veure els pròxims actes</Text>
        </View>
      ) : (
        <>
          <View style={styles.liveBar}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{nowEvents.length} acte{nowEvents.length !== 1 ? 's' : ''} en curs</Text>
          </View>
          <NowList events={nowEvents} />
        </>
      )}
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '600' },
  emptyDesc: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
