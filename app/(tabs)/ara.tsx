import { useAnnouncements } from '@/entities/announcement';
import { useEvents } from '@/entities/event';
import { HeroCard, LiveClock, NowCard, UpcomingRow, useNowEvents } from '@/features/now';
import { Colors } from '@/shared/constants';
import { useNow } from '@/shared/hooks';
import { t } from '@/shared/i18n';
import { AnnouncementBanner, ErrorState, LoadingState, OfflineBanner, Screen, SectionHeader } from '@/shared/ui';
import { router } from 'expo-router';
import { Clock, Moon } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

// ─── Countdown helpers ───────────────────────────────────────────────────────
function formatCountdown(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function AraScreen() {
  useWindowDimensions(); // keeps layout reactive on rotation
  const { events, loading, error, isOffline, isRefreshing, cacheTimestamp, refresh } = useEvents();
  const announcements = useAnnouncements();
  const { now, upcoming } = useNowEvents(events);
  const clock = useNow(1_000); // 1-second tick for countdown
  const handlePress = useCallback((id: string) => {
    router.push(`/event/${id}`);
  }, []);

  // Find the soonest unstarted event across all events (for countdown)
  const nextEvent = useMemo(() => {
    const future = events
      .filter((e) => new Date(e.start) > clock)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return future[0] ?? null;
  }, [events, clock]);

  // Hero = first live event, or first upcoming if nothing is live
  const hero = now[0] ?? upcoming[0];
  // Strip excludes the hero so it doesn't appear twice
  const nowStrip = now.slice(1);

  if (error && events.length === 0) {
    return (
      <Screen style={styles.root} edges={['top']}>
        <ErrorState
          message={t('error.eventsMessage')}
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
          <Text style={styles.title}>{t('now.appTitle')}</Text>
          <Text style={styles.subtitle}>{t('now.subtitle')}</Text>
        </View>
        <LiveClock />
      </View>

      {isOffline && (
        <OfflineBanner cacheTimestamp={cacheTimestamp} onRefresh={refresh} isRefreshing={isRefreshing} />
      )}

      <AnnouncementBanner announcements={announcements} />

      {loading && events.length === 0 && <LoadingState />}

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
        {hero && <HeroCard event={hero} onPress={() => handlePress(hero.id)} />}

        {/* Ara Mateix strip — skips hero (now[0]) to avoid duplication */}
        {nowStrip.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Ara Mateix" count={now.length} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.nowStrip}
            >
              {nowStrip.map((e) => (
                <NowCard key={e.id} event={e} onPress={() => handlePress(e.id)} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* A continuació */}
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="A continuació" count={upcoming.length} />
            {upcoming.map((e) => (
              <UpcomingRow key={e.id} event={e} onPress={() => handlePress(e.id)} />
            ))}
          </View>
        )}

        {/* Empty state / countdown */}
        {!hero && (
          <View style={styles.empty}>
            {nextEvent ? (
              <>
                <Clock size={48} color={Colors.primary} />
                <Text style={styles.emptyTitle}>Pròxim acte en</Text>
                <Text style={styles.countdownValue}>
                  {formatCountdown(new Date(nextEvent.start).getTime() - clock.getTime())}
                </Text>
                <Text style={styles.emptySubtitle} numberOfLines={2}>{nextEvent.title}</Text>
              </>
            ) : (
              <>
                <Moon size={48} color={Colors.textDim} />
                <Text style={styles.emptyTitle}>Sense actes ara</Text>
                <Text style={styles.emptySubtitle}>Consulta l'agenda per als propers actes</Text>
              </>
            )}
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
  emptySubtitle: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', maxWidth: 240 },
  countdownValue: { color: Colors.primary, fontSize: 40, fontWeight: '800', letterSpacing: -1 },
});
