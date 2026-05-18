import { useAnnouncements } from '@/entities/announcement';
import { useEvents } from '@/entities/event';
import { HeroCard, LiveClock, NowCard, NowSkeleton, UpcomingRow, useNowEvents } from '@/features/now';
import { useFavoritesStore } from '@/features/favorites';
import { Colors, FESTIVAL_END, FESTIVAL_START } from '@/shared/constants';
import { useNavPush, useNow } from '@/shared/hooks';
import { t } from '@/shared/i18n';
import { AnnouncementBanner, ErrorState, OfflineBanner, Screen, SectionHeader } from '@/shared/ui';

import { Clock, Heart, Moon } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

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
  const { favorites } = useFavoritesStore();
  const push = useNavPush();
  const handlePress = useCallback((id: string) => {
    push(`/event/${id}`);
  }, [push]);

  // Favorites currently live — shown in a highlighted band
  const liveAndFavorite = useMemo(
    () => now.filter((e) => favorites[e.id]),
    [now, favorites],
  );

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

      {loading && events.length === 0 && <NowSkeleton />}

      <ScrollView
        style={[styles.scroll, loading && events.length === 0 && { display: 'none' }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ❤️ Favourites live — prominent banner for night use */}
        {liveAndFavorite.length > 0 && (
          <View style={styles.favBand}>
            <View style={styles.favBandHeader}>
              <Heart size={16} color="#fff" fill="#fff" />
              <Text style={styles.favBandTitle}>Els teus favorits en curs</Text>
            </View>
            {liveAndFavorite.map((e) => (
              <Pressable
                key={e.id}
                style={({ pressed }) => [styles.favRow, pressed && { opacity: 0.8 }]}
                onPress={() => handlePress(e.id)}
                accessibilityRole="button"
                accessibilityLabel={e.title}
              >
                <View style={styles.favDot} />
                <Text style={styles.favRowTitle} numberOfLines={1}>{e.title}</Text>
                <Text style={styles.favRowLocation} numberOfLines={1}>{e.locationName ?? ''}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Live indicator */}
        {now.length > 0 && (
          <View style={styles.liveBar}>
            <View style={styles.liveDotSmall} />
            <Text style={styles.liveBarText}>
              {t('now.liveCount', { count: now.length, plural: now.length !== 1 ? 's' : '' })}
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
            ) : clock > FESTIVAL_END ? (
              <>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyTitle}>{t('now.festivalEnded')}</Text>
                <Text style={styles.emptySubtitle}>{t('now.festivalEndedSubtext')}</Text>
              </>
            ) : clock < FESTIVAL_START ? (
              <>
                <Clock size={48} color={Colors.primary} />
                <Text style={styles.emptyTitle}>El festival comença en</Text>
                <Text style={styles.countdownValue}>
                  {formatCountdown(FESTIVAL_START.getTime() - clock.getTime())}
                </Text>
                <Text style={styles.emptySubtitle}>24 – 29 de juliol de 2026 · Mataró</Text>
              </>
            ) : (
              <>
                <Moon size={48} color={Colors.textDim} />
                <Text style={styles.emptyTitle}>{t('now.emptyNow')}</Text>
                <Text style={styles.emptySubtitle}>{t('now.emptyNowSubtext')}</Text>
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
  emptyEmoji: { fontSize: 52, lineHeight: 60 },
  // Favorites live band
  favBand: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 4,
  },
  favBandHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, paddingBottom: 8 },
  favBandTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 8,
    marginBottom: 6,
    borderRadius: 10,
  },
  favDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', flexShrink: 0 },
  favRowTitle: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '700' },
  favRowLocation: { color: 'rgba(255,255,255,0.7)', fontSize: 12, flexShrink: 0, maxWidth: 80 },
});
