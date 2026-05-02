import type { Event } from '@/entities/event';
import { useEvents } from '@/entities/event';
import { useMapFocusStore } from '@/features/map/store/useMapFocusStore';
import { LiveClock, useNowEvents } from '@/features/now';
import { Colors } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import { EventIcon, LoadingState, Screen } from '@/shared/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Clock, MapPin, Moon } from 'lucide-react-native';
import React, { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

const DEFAULT_BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';

// ─── Hero Card ───────────────────────────────────────────────────────────────
function HeroCard({ event, onPress }: { event: Event; onPress: () => void }) {
  const isLive = event.state === 'now';
  return (
    <Pressable style={styles.hero} onPress={onPress} accessibilityRole="button">
      <Image
        source={event.imageUrl ? { uri: event.imageUrl } : undefined}
        style={styles.heroImage}
        contentFit="cover"
        transition={400}
        placeholder={{ blurhash: event.blurhash ?? DEFAULT_BLURHASH }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.heroGradient}
      >
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>EN CURS</Text>
          </View>
        )}
        <View style={styles.heroContent}>
          <Text style={styles.heroType}>
            {event.type.toUpperCase().replace('FOCSARTIFICIALS', 'FOCS')}
          </Text>
          <Text style={styles.heroTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.heroMeta}>
            <Clock size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroMetaText}>
              {formatTime(event.start)} – {formatTime(event.end)}
            </Text>
            {event.locationName && (
              <>
                <Text style={styles.heroMetaDot}>·</Text>
                <MapPin size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroMetaText} numberOfLines={1}>{event.locationName}</Text>
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

// ─── Now Card (horizontal strip) ─────────────────────────────────────────────
function NowCard({ event, onPress }: { event: Event; onPress: () => void }) {
  return (
    <Pressable style={styles.nowCard} onPress={onPress} accessibilityRole="button">
      <Image
        source={event.imageUrl ? { uri: event.imageUrl } : undefined}
        style={styles.nowCardImage}
        contentFit="cover"
        transition={300}
        placeholder={{ blurhash: event.blurhash ?? DEFAULT_BLURHASH }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.nowCardGradient}
      >
        <View style={styles.nowCardIcon}>
          <EventIcon icon={event.icon} size={16} color="#fff" />
        </View>
        <Text style={styles.nowCardTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.nowCardTime}>fins {formatTime(event.end)}</Text>
      </LinearGradient>
    </Pressable>
  );
}

// ─── Upcoming Row ─────────────────────────────────────────────────────────────
function UpcomingRow({ event, onPress }: { event: Event; onPress: () => void }) {
  return (
    <Pressable style={styles.upcomingRow} onPress={onPress}>
      <View style={styles.upcomingIcon}>
        <EventIcon icon={event.icon} size={18} color={Colors.stateUpcoming} />
      </View>
      <View style={styles.upcomingContent}>
        <Text style={styles.upcomingTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.upcomingMeta}>
          {formatTime(event.start)}
          {event.locationName ? ` · ${event.locationName}` : ''}
        </Text>
      </View>
      <View style={styles.upcomingBadge}>
        <Text style={styles.upcomingBadgeText}>{formatTime(event.start)}</Text>
      </View>
    </Pressable>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count != null && <Text style={styles.sectionCount}>{count}</Text>}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function AraScreen() {
  useWindowDimensions(); // keeps layout reactive on rotation
  const { events, loading } = useEvents();
  const { now, upcoming } = useNowEvents(events);
  const focusEvent = useMapFocusStore((s) => s.focusEvent);

  const handlePress = useCallback((event: Event) => {
    focusEvent(event.id);
    router.navigate('/(tabs)/mapa');
  }, [focusEvent]);

  // Hero = first live event, or first upcoming if nothing is live
  const hero = now[0] ?? upcoming[0];

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

const HERO_H = 280;
const NOW_CARD_W = 160;
const NOW_CARD_H = 200;

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

  // Hero
  hero: { marginHorizontal: 16, marginBottom: 20, borderRadius: 20, overflow: 'hidden', height: HERO_H },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroGradient: { flex: 1, height: HERO_H, justifyContent: 'space-between', padding: 16 },
  heroContent: { gap: 4 },
  heroType: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 28 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  heroMetaText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  heroMetaDot: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: Colors.stateNow,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  // Now strip
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  sectionCount: {
    color: Colors.textMuted, fontSize: 13,
    backgroundColor: Colors.surface,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
    overflow: 'hidden',
  },
  nowStrip: { paddingLeft: 16, paddingRight: 8, gap: 12 },
  nowCard: {
    width: NOW_CARD_W, height: NOW_CARD_H,
    borderRadius: 16, overflow: 'hidden',
  },
  nowCardImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  nowCardGradient: { flex: 1, height: NOW_CARD_H, justifyContent: 'flex-end', padding: 12, gap: 4 },
  nowCardIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  nowCardTitle: { color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 17 },
  nowCardTime: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },

  // Upcoming
  upcomingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  upcomingIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: `${Colors.stateUpcoming}22`,
    alignItems: 'center', justifyContent: 'center',
  },
  upcomingContent: { flex: 1 },
  upcomingTitle: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  upcomingMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  upcomingBadge: {
    backgroundColor: `${Colors.stateUpcoming}22`,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  upcomingBadgeText: {
    color: Colors.stateUpcoming, fontSize: 12, fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Empty
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingTop: 80,
  },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14 },
});
