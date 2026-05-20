import { type Event, STATE_COLOR, getStateLabel, useEvents } from '@/entities/event';
import { eventRepository } from '@/entities/event/repository';
import { useAgendaFocusStore } from '@/features/agenda';
import { useFavoritesStore } from '@/features/favorites';
import { useMapFocusStore } from '@/features/map';
import { ContextualHint, useNudge, useNudgeStore, useTrackEventViewOnMount } from '@/features/nudges';
import { Colors, FESTIVAL_START } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { addEventToCalendar, cancelEventNotification, formatDayShort, formatTime, scheduleEventNotification } from '@/shared/lib';
import { EventMiniMap } from '@/features/map/components/EventMiniMap';
import { BackButton, EventIcon, Screen, SkeletonBox, useShimmer } from '@/shared/ui';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { CalendarDays, CalendarPlus, Clock, Heart, MapPin, Navigation, PersonStanding, Share2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Animated from 'react-native-reanimated';
import { Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

const DEFAULT_BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';
const IMAGE_H = 260;

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function EventDetailSkeleton() {
  const anim = useShimmer();
  return (
    <Animated.View style={[{ flex: 1 }, anim]}>
      <SkeletonBox style={styles.skelImg} />
      <View style={styles.skelContent}>
        <SkeletonBox style={styles.skelBadge} />
        <SkeletonBox style={styles.skelTitle} />
        <SkeletonBox style={styles.skelTitleShort} />
        <SkeletonBox style={styles.skelMeta} />
        <SkeletonBox style={styles.skelMeta} />
        <View style={styles.skelDivider} />
        <SkeletonBox style={styles.skelDesc} />
        <SkeletonBox style={styles.skelDesc} />
        <SkeletonBox style={styles.skelDescShort} />
      </View>
    </Animated.View>
  );
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, loading: cacheLoading } = useEvents();
  const insets = useSafeAreaInsets();
  const focusEvent = useMapFocusStore((s) => s.focusEvent);
  const requestAgendaDay = useAgendaFocusStore((s) => s.requestDay);
  const { favorites, isFavorite, toggleFavorite } = useFavoritesStore();

  useTrackEventViewOnMount(id);
  const eventViews = useNudgeStore((s) => s.behavior.eventViews);
  const favoritesCount = Object.keys(favorites).length;
  const suggestMap = useNudge('event.suggestMap', { when: eventViews >= 1 });
  const suggestFavorite = useNudge('event.suggestFavorite', {
    when: eventViews >= 3 && favoritesCount === 0,
  });

  // Try cache first; fall back to individual fetch if cache is still loading or misses
  const cached = events.find((e) => e.id === id) as Event | undefined;
  const [fetchedEvent, setFetchedEvent] = useState<Event | null | undefined>(undefined);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (cached) return; // cache hit — no need to fetch
    if (cacheLoading) return; // wait for cache before deciding to fetch
    // Cache is done and event not found — do a direct fetch
    setFetching(true);
    eventRepository.getById(id ?? '').then((e) => {
      setFetchedEvent(e ?? null);
    }).catch(() => {
      setFetchedEvent(null);
    }).finally(() => {
      setFetching(false);
    });
  }, [id, cached, cacheLoading]);

  const event = cached ?? (fetchedEvent ?? undefined);
  const isLoading = cacheLoading || fetching;

  const favorite = isFavorite(id ?? '');
  const shareCardRef = useRef<View>(null);

  const handleFavorite = useCallback(() => {
    if (!id) return;
    Haptics.impactAsync(favorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    const isAdding = !favorite;
    toggleFavorite(id);
    if (event) {
      if (isAdding) scheduleEventNotification(event).catch(() => { });
      else cancelEventNotification(id).catch(() => { });
    }
  }, [id, favorite, event, toggleFavorite]);

  const handleShare = useCallback(async () => {
    if (!event) return;
    Haptics.selectionAsync();

    const shareText = [
      `🎉 ${event.title}`,
      `🕐 ${formatDayShort(event.start.substring(0, 10))} · ${formatTime(event.start)}–${formatTime(event.end)}`,
      event.locationName ? `📍 ${event.locationName}` : null,
      '',
      `Les Santes ${FESTIVAL_START.getFullYear()} · Mataró`,
    ].filter(Boolean).join('\n');

    try {
      const uri = shareCardRef.current
        ? await captureRef(shareCardRef, { format: 'png', quality: 0.9 })
        : null;

      if (uri) {
        if (Platform.OS === 'ios') {
          // iOS: Share.share supports both message + url (image attachment)
          await Share.share({ message: shareText, url: uri });
        } else {
          // Android: share image via expo-sharing; text shown in dialog title
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: shareText });
          } else {
            await Share.share({ message: shareText });
          }
        }
      } else {
        await Share.share({ message: shareText });
      }
    } catch {
      // Last-resort fallback
      Share.share({ message: shareText }).catch(() => { });
    }
  }, [event, shareCardRef]);

  const handleCalendar = useCallback(() => {
    if (!event) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addEventToCalendar(event);
  }, [event]);

  const handleViewInMap = useCallback(() => {
    if (!event) return;
    suggestMap.complete();
    focusEvent(event.id, event.start); // pass start so map can resolve the day without MOCK_EVENTS
    router.push('/(tabs)/mapa');
  }, [event, focusEvent, suggestMap]);

  const handleFavoriteFromNudge = useCallback(() => {
    suggestFavorite.complete();
    handleFavorite();
  }, [suggestFavorite, handleFavorite]);

  const handleGetDirections = useCallback(() => {
    if (!event) return;
    const lat = event.kind === 'static' ? event.location.lat : event.route[0].lat;
    const lng = event.kind === 'static' ? event.location.lng : event.route[0].lng;
    const name = encodeURIComponent(event.locationName ?? event.title);

    const url = Platform.select({
      ios: `maps://0,0?q=${name}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${name})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    }) ?? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    });
  }, [event]);

  const handleViewInAgenda = useCallback(() => {
    if (!event) return;
    requestAgendaDay(event.start.substring(0, 10));
    router.push('/(tabs)/agenda');
  }, [event, requestAgendaDay]);

  if (isLoading && !event) {
    return (
      <Screen>
        <BackButton style={styles.backStandalone} />
        <EventDetailSkeleton />
      </Screen>
    );
  }

  if (!event) {
    return (
      <Screen>
        <View style={styles.notFound}>
          <BackButton style={styles.backStandalone} />
          <Text style={styles.notFoundText}>{t('event.notFound')}</Text>
        </View>
      </Screen>
    );
  }

  const stateColor = STATE_COLOR[event.state];
  const dayLabel = formatDayShort(event.start.substring(0, 10));

  return (
    <Screen safe={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Hero image */}
        <View style={styles.imageWrap}>
          {event.imageUrl ? (
            <Image
              source={{ uri: event.imageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={300}
              placeholder={{ blurhash: event.blurhash ?? DEFAULT_BLURHASH }}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <EventIcon type={event.type} size={48} color={Colors.textDim} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', Colors.background]}
            style={styles.imageGradient}
            pointerEvents="none"
          />
          <BackButton
            variant="overlay"
            style={{ position: 'absolute', top: insets.top + 12, left: 16 }}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* State badge */}
          <View style={[styles.badge, { backgroundColor: `${stateColor}15` }]}>
            <View style={[styles.badgeDot, { backgroundColor: stateColor }]} />
            <Text style={[styles.badgeLabel, { color: stateColor }]}>
              {getStateLabel(event.state)}
            </Text>
          </View>

          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.desc}>{event.description ?? event.shortDescription}</Text>

          {/* Detail rows */}
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Clock size={15} color={Colors.textDim} />
              <Text style={styles.detailText}>
                {dayLabel} · {formatTime(event.start)} – {formatTime(event.end)}
              </Text>
            </View>
            {event.kind === 'mobile' && (
              <View style={styles.detailRow}>
                <PersonStanding size={15} color={Colors.textDim} />
                <Text style={styles.detailText}>{t('event.mobileRoute')}</Text>
              </View>
            )}
            {event.kind === 'static' && event.locationName && (
              <Pressable
                style={({ pressed }) => [styles.detailRow, pressed && { opacity: 0.6 }]}
                onPress={handleGetDirections}
                accessibilityLabel={t('event.getDirectionsLabel', { name: event.locationName })}
                accessibilityRole="link"
              >
                <MapPin size={15} color={Colors.primary} />
                <Text style={styles.detailTextLink}>{event.locationName}</Text>
                <Navigation size={13} color={Colors.primary} />
              </Pressable>
            )}
          </View>

          {/* Mini map */}
          <EventMiniMap event={event} onPress={handleViewInMap} zoom={14} />

          {suggestMap.visible && (
            <ContextualHint
              title={t('event.suggestMapTitle')}
              description={t('event.suggestMapDesc')}
              ctaLabel={t('event.suggestMapCta')}
              onCta={handleViewInMap}
              onDismiss={suggestMap.dismiss}
            />
          )}

          {suggestFavorite.visible && !favorite && (
            <ContextualHint
              title={t('event.suggestFavoriteTitle')}
              description={t('event.suggestFavoriteDesc')}
              ctaLabel={t('event.suggestFavoriteCta')}
              onCta={handleFavoriteFromNudge}
              onDismiss={suggestFavorite.dismiss}
            />
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.calendarBtn, pressed && styles.btnPressed]}
              onPress={handleCalendar}
            >
              <CalendarPlus size={18} color="#fff" />
              <Text style={styles.calendarBtnText}>{t('event.addCalendar')}</Text>
            </Pressable>
          </View>
          {/* Secondary actions */}
          <View style={styles.secondaryActions}>
            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
              onPress={handleFavorite}
              accessibilityLabel={favorite ? t('event.removeFavoriteA11y') : t('event.addFavoriteA11y')}
            >
              <Heart size={18} color={favorite ? Colors.primary : Colors.textDim} fill={favorite ? Colors.primary : 'none'} />
              <Text style={[styles.secondaryBtnText, favorite && styles.secondaryBtnTextActive]}>
                {favorite ? t('event.addedFavoriteLabel') : t('event.favoriteLabel')}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
              onPress={handleViewInAgenda}
              accessibilityLabel={t('event.viewInAgendaA11y')}
            >
              <CalendarDays size={18} color={Colors.textDim} />
              <Text style={styles.secondaryBtnText}>{t('event.agendaShort')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
              onPress={handleShare}
              accessibilityLabel={t('event.shareEventA11y')}
            >
              <Share2 size={18} color={Colors.textDim} />
              <Text style={styles.secondaryBtnText}>{t('event.share')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Invisible share card — captured by react-native-view-shot.
          Uses opacity:0 + pointerEvents:none instead of top:-2000
          to avoid visibility on unusually tall devices. */}
      <View
        ref={shareCardRef}
        style={styles.shareCard}
        collapsable={false}
        pointerEvents="none"
      >
        <View style={styles.shareCardBg}>
          {event.imageUrl && (
            <Image source={{ uri: event.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.shareCardContent}>
            <Text style={styles.shareCardBrand}>🎉 Les Santes {FESTIVAL_START.getFullYear()}</Text>
            <Text style={styles.shareCardTitle}>{event.title}</Text>
            <Text style={styles.shareCardMeta}>
              {formatDayShort(event.start.substring(0, 10))} · {formatTime(event.start)} – {formatTime(event.end)}
            </Text>
            {event.locationName && (
              <Text style={styles.shareCardLocation}>📍 {event.locationName}</Text>
            )}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {},
  imageWrap: {
    height: IMAGE_H,
    width: '100%',
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeLabel: { fontSize: 12, fontWeight: '600' },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  desc: {
    color: Colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  details: {
    marginTop: 4,
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: Colors.textMuted,
    fontSize: 14,
    flex: 1,
  },
  detailTextLink: {
    color: Colors.primary,
    fontSize: 14,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  calendarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  calendarBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  mapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceHigh,
    paddingVertical: 14,
    borderRadius: 14,
  },
  mapBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 0,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  secondaryBtnText: { color: Colors.textDim, fontSize: 14, fontWeight: '600' },
  secondaryBtnTextActive: { color: Colors.primary },
  btnPressed: { opacity: 0.7 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { color: Colors.textMuted, fontSize: 15 },
  backStandalone: { marginBottom: 8 },
  // ── EventDetailSkeleton ───────────────────────────────────────────────────
  skelImg: { height: IMAGE_H, marginBottom: 16, borderRadius: 0 },
  skelContent: { paddingHorizontal: 16, gap: 12 },
  skelBadge: { width: 72, height: 22, borderRadius: 10 },
  skelTitle: { height: 24, width: '85%', borderRadius: 6 },
  skelTitleShort: { height: 24, width: '55%', borderRadius: 6 },
  skelMeta: { height: 14, width: '60%', borderRadius: 4 },
  skelDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: 4 },
  skelDesc: { height: 13, width: '100%', borderRadius: 4 },
  skelDescShort: { height: 13, width: '70%', borderRadius: 4 },
  // Share card: opacity:0 keeps it off-screen safely on any device height
  shareCard: { position: 'absolute', opacity: 0, left: 0, width: 400 },
  shareCardBg: {
    width: 400,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    justifyContent: 'flex-end',
  },
  shareCardContent: { padding: 20, gap: 4 },
  shareCardBrand: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600' },
  shareCardTitle: { color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 28 },
  shareCardMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },
  shareCardLocation: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
});

