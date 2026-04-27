import { MOCK_EVENTS } from '@/entities/event';
import { EventMap } from '@/features/map';
import { Colors } from '@/shared/constants';
import { Screen } from '@/shared/ui';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MapaScreen() {
  const insets = useSafeAreaInsets();
  const mobileCount = MOCK_EVENTS.filter((e) => e.kind === 'mobile' && e.state === 'now').length;

  return (
    <Screen safe={false}>
      <EventMap events={MOCK_EVENTS} />

      {/* Floating header */}
      <View style={[styles.floatingHeader, { top: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📍 Mataró</Text>
          {mobileCount > 0 && (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{mobileCount} colles en moviment</Text>
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  floatingHeader: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  headerContent: {
    backgroundColor: `${Colors.surface}EE`,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${Colors.stateNow}22`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.stateNow },
  liveText: { color: Colors.stateNow, fontSize: 12, fontWeight: '600' },
});
