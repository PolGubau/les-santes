import type { Event } from '@/entities/event';
import { useEvents } from '@/entities/event';
import { useMapFocusStore } from '@/features/map/store/useMapFocusStore';
import { HeroCard, LiveClock, NowCard, UpcomingRow, useNowEvents } from '@/features/now';
import { Colors } from '@/shared/constants';
import { ErrorState, LoadingState, OfflineBanner, Screen, SectionHeader } from '@/shared/ui';
import { router } from 'expo-router';
import { Moon } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function AraScreen() {
  useWindowDimensions(); // keeps layout reactive on rotation
  const { events, loading, error, isOffline, cacheTimestamp, refresh } = useEvents();
  const { now, upcoming } = useNowEvents(events);
  const focusEvent = useMapFocusStore((s) => s.focusEvent);

  const handlePress = useCallback((event: Event) => {
    focusEvent(event.id);
    router.push('/(tabs)/mapa');
  }, [focusEvent]);

  // Hero = first live event, or first upcoming if nothing is live
  const hero = now[0] ?? upcoming[0];

  if (error && events.length === 0) {
    return (
      <Screen style={styles.root} edges={['top']}>
        <ErrorState
          message="No s'han pogut carregar els actes del festival."
          onRetry={refresh}
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.root} edges={['top']}>
      {/* Fixed header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Les Santes</Text>
          <Text style={styles.subtitle}>Mataró · Festa Major</Text>
        </View>
        <LiveClock />
      </View>

      {isOffline && (
        <OfflineBanner cacheTimestamp={cacheTimestamp} onRefresh={refresh} />
      )}

      {loading && events.length === 0 && <LoadingState label="Carregant actes…" />}

      <ScrollView
        style={[styles.scroll, loading && events.length === 0 && { display: 'none' }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Live indicator */}
        {now.length > 0 && (
          <View style={styles.liveBar}>
            <View style={styles.liveDotSmall} />
            <Text style={styles.liveBarText}>
              {now.length} acte{now.length !== 1 ? 's' : ''} en curs ara
            </Text>
          </View>
        )}

        {/* Hero */}
        {hero && <HeroCard event={hero} onPress={() => handlePress(hero)} />}

        {/* Ara Mateix strip */}
        {now.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Ara Mateix" count={now.length} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.nowStrip}
            >
              {now.map((e) => (
                <NowCard key={e.id} event={e} onPress={() => handlePress(e)} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* A continuació */}
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="A continuació" count={upcoming.length} />
            {upcoming.map((e) => (
              <UpcomingRow key={e.id} event={e} onPress={() => handlePress(e)} />
            ))}
          </View>
        )}

        {/* Empty state */}
        {!hero && (
          <View style={styles.empty}>
            <Moon size={48} color={Colors.textDim} />
            <Text style={styles.emptyTitle}>Sense actes ara</Text>
            <Text style={styles.emptySubtitle}>Consulta l'agenda per als propers actes</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: { color: Colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: Colors.textDim, fontSize: 12, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { gap: 0 },
  liveBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  liveDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.stateNow },
  liveBarText: { color: Colors.stateNow, fontSize: 12, fontWeight: '600' },
  section: { marginBottom: 20 },
  nowStrip: { paddingLeft: 16, paddingRight: 8, gap: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14 },
});
