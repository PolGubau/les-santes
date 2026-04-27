import type { Event } from '@/entities/event';
import { MOCK_EVENTS } from '@/entities/event';
import { useMapFocusStore } from '@/features/map/store/useMapFocusStore';
import { LiveClock, NowList, useNowEvents } from '@/features/now';
import { Colors } from '@/shared/constants';
import { Screen } from '@/shared/ui';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AraScreen() {
  const { now, upcoming } = useNowEvents(MOCK_EVENTS);
  const focusEvent = useMapFocusStore((s) => s.focusEvent);

  const handleEventPress = useCallback((event: Event) => {
    focusEvent(event.id);
    router.navigate('/(tabs)/mapa');
  }, [focusEvent]);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ara mateix</Text>
          <Text style={styles.subtitle}>A Mataró</Text>
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

      <NowList now={now} upcoming={upcoming} onEventPress={handleEventPress} />
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
