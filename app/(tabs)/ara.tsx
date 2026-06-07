import { useAnnouncements } from '@/entities/announcement';
import { useEvents } from '@/entities/event';
import { EventCard } from '@/features/agenda';
import { FavoriteHeart, useFavoritesStore } from '@/features/favorites';
import { HeroCard, LiveClock, NowCard, NowSkeleton, useNowEvents } from '@/features/now';
import { ContextualHint, useNudge, useNudgeStore } from '@/features/nudges';
import { Colors, FESTIVAL_END, FESTIVAL_START } from '@/shared/constants';
import { useNavPush, useNow } from '@/shared/hooks';
import { t } from '@/shared/i18n';
import { AnnouncementBanner, ErrorState, OfflineBanner, Screen, SectionHeader } from '@/shared/ui';

import { router } from 'expo-router';
import { Clock, Heart, Moon, PartyPopper } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from '@/shared/ui';

// ─── Countdown helpers ───────────────────────────────────────────────────────
function formatCountdown(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
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
  const appOpens = useNudgeStore((s) => s.behavior.appOpens);
  const favoritesCount = Object.keys(favorites).length;
  const suggestAgenda = useNudge('ara.suggestAgenda', {
    when: appOpens >= 2 && favoritesCount === 0,
  });

  const push = useNavPush();
  const handlePress = useCallback((id: string) => {
    push(`/event/${id}`);
  }, [push]);

  const handleSuggestAgendaCta = useCallback(() => {
    suggestAgenda.complete();
    router.push('/(tabs)/agenda');
  }, [suggestAgenda]);

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

  // Festival window — drives whether we show the "live" UI or a countdown.
  // Without this gate the first day's events get rendered as "hero" weeks
  // before the festival starts, making the screen look mid‑festival on May.
  const isPreFestival = clock < FESTIVAL_START;
  const isPostFestival = clock > FESTIVAL_END;
  const isFestivalActive = !isPreFestival && !isPostFestival;

  // Hero = first live event, or first upcoming if nothing is live
  const hero = isFestivalActive ? (now[0] ?? upcoming[0]) : undefined;
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

      {suggestAgenda.visible && (
        <ContextualHint
          title={t('now.suggestAgendaTitle')}
          description={t('now.suggestAgendaDesc')}
          ctaLabel={t('now.suggestAgendaCta')}
          onCta={handleSuggestAgendaCta}
          onDismiss={suggestAgenda.dismiss}
        />
      )}

      {loading && events.length === 0 && <NowSkeleton />}

      <ScrollView
        style={[styles.scroll, loading && events.length === 0 && { display: 'none' }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Pre‑festival countdown card — replaces the hero when the festival
            hasn't started yet, so we never show day‑1 events as if they were
            "next up". The Agenda preview below stays as a teaser of what's
            coming. */}
        {isPreFestival && (
          <View style={styles.preFestivalCard}>
            <Clock size={36} color={Colors.primary} />
            <Text style={styles.preFestivalTitle}>{t('now.festivalStartsIn')}</Text>
            <Text style={styles.countdownValue}>
              {formatCountdown(FESTIVAL_START.getTime() - clock.getTime())}
            </Text>
            <Text style={styles.preFestivalSubtitle}>
              {t('now.festivalDates', {
                start: FESTIVAL_START.getDate(),
                end: FESTIVAL_END.getDate(),
                year: FESTIVAL_START.getFullYear(),
              })}
            </Text>
          </View>
        )}

        {/* ❤️ Favourites live — prominent banner for night use */}
        {isFestivalActive && liveAndFavorite.length > 0 && (
          <View style={styles.favBand}>
            <View style={styles.favBandHeader}>
              <Heart size={16} color="#fff" fill="#fff" />
              <Text style={styles.favBandTitle}>{t('now.favoritesLive')}</Text>
            </View>
            {liveAndFavorite.map((e) => (
              <View key={e.id} style={styles.favRowWrap}>
                <Pressable
                  style={({ pressed }) => [styles.favRow, pressed && { opacity: 0.8 }]}
                  onPress={() => handlePress(e.id)}
                  accessibilityRole="button"
                  accessibilityLabel={e.title}
                >
                  <View style={styles.favDot} />
                  <Text style={styles.favRowTitle} numberOfLines={1}>{e.title}</Text>
                  <Text style={styles.favRowLocation} numberOfLines={1}>{e.locationName ?? ''}</Text>
                </Pressable>
                <FavoriteHeart
                  event={e}
                  size={18}
                  hitArea={40}
                  inactiveColor="rgba(255,255,255,0.6)"
                  activeColor="#fff"
                />
              </View>
            ))}
          </View>
        )}

        {/* Live indicator — hidden when favorites band is shown to avoid duplication */}
        {isFestivalActive && now.length > 0 && liveAndFavorite.length === 0 && (
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
        {isFestivalActive && nowStrip.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title={t('now.nowStripTitle')} count={now.length} />
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

        {/* A continuació — same visual treatment as Agenda sections.
            Also shown pre‑festival as a preview of what's coming. */}
        {!isPostFestival && upcoming.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title={t('now.upNextTitle')} count={upcoming.length} />
            <View style={styles.upcomingCard}>
              {upcoming.map((e, idx) => (
                <React.Fragment key={e.id}>
                  <EventCard event={e} onPress={() => handlePress(e.id)} />
                  {idx < upcoming.length - 1 && <View style={styles.itemDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Empty state / mid‑festival next‑event countdown. Pre‑ and
            post‑festival are handled by the dedicated cards above; here we
            only cover the in‑festival lull case. */}
        {isFestivalActive && !hero && (
          <View style={styles.empty}>
            {nextEvent ? (
              <>
                <Clock size={48} color={Colors.primary} />
                <Text style={styles.emptyTitle}>{t('now.nextEventIn')}</Text>
                <Text style={styles.countdownValue}>
                  {formatCountdown(new Date(nextEvent.start).getTime() - clock.getTime())}
                </Text>
                <Text style={styles.emptySubtitle} numberOfLines={2}>{nextEvent.title}</Text>
              </>
            ) : (
              <>
                <Moon size={48} color={Colors.textDim} />
                <Text style={styles.emptyTitle}>{t('now.emptyNow')}</Text>
                <Text style={styles.emptySubtitle}>{t('now.emptyNowSubtext')}</Text>
                <Pressable
                  style={({ pressed }) => [styles.scheduleBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => router.push('/(tabs)/agenda')}
                  accessibilityRole="button"
                  accessibilityLabel={t('now.goToSchedule')}
                >
                  <Text style={styles.scheduleBtnText}>{t('now.goToSchedule')}</Text>
                </Pressable>
              </>
            )}
          </View>
        )}

        {/* Post‑festival ended state */}
        {isPostFestival && (
          <View style={styles.empty}>
            <PartyPopper size={48} color={Colors.primary} />
            <Text style={styles.emptyTitle}>{t('now.festivalEnded')}</Text>
            <Text style={styles.emptySubtitle}>{t('now.festivalEndedSubtext')}</Text>
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
  preFestivalCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preFestivalTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  preFestivalSubtitle: {
    color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4,
  },
  countdownValue: {
    color: Colors.primary,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  upcomingCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  itemDivider: {
    height: 1,
    marginHorizontal: 14,
    backgroundColor: Colors.border,
  },
  scheduleBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  scheduleBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
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
  favRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 8,
    marginBottom: 6,
    borderRadius: 10,
    paddingRight: 4,
  },
  favRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  favDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', flexShrink: 0 },
  favRowTitle: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '700' },
  favRowLocation: { color: 'rgba(255,255,255,0.7)', fontSize: 12, flexShrink: 0, maxWidth: 80 },
});
