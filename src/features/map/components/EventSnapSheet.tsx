import { STATE_COLOR, getStateLabel, type Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { addEventToCalendar, formatDayShort, formatTime } from '@/shared/lib';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarPlus, Clock, ExternalLink, Map, MapPin, PersonStanding } from 'lucide-react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// handle(~18) + peekSection padding+content(~86) + buffer = 130
// Keeps the image fully hidden at the first snap point.
const PEEK_H = 100;
const FULL_H = 560;
const DEFAULT_BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';

interface Props {
  event: Event;
  onClose: () => void;
  showViewInMap?: boolean;
  onViewInMap?: () => void;
}

export function EventSnapSheet({ event, onClose, showViewInMap, onViewInMap }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const stateColor = STATE_COLOR[event.state];
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    sheetRef.current?.snapToIndex(0);
  }, [event.id]);

  const snapPoints = useMemo(
    () => [PEEK_H + insets.bottom + tabBarHeight, FULL_H + insets.bottom],
    [insets.bottom, tabBarHeight],
  );

  const handleCalendar = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addEventToCalendar(event);
  }, [event]);

  const handleViewDetail = useCallback(() => {
    sheetRef.current?.close();
    setTimeout(() => router.push(`/event/${event.id}`), 180);
  }, [event.id]);

  const handleViewInMap = useCallback(() => {
    sheetRef.current?.close();
    setTimeout(() => onViewInMap?.(), 180);
  }, [onViewInMap]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
        opacity={0.35}
        pressBehavior="collapse"
      />
    ),
    [],
  );

  const dayLabel = formatDayShort(event.start.substring(0, 10));

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      backgroundStyle={styles.background}
      handleStyle={styles.handleArea}
      handleIndicatorStyle={styles.handle}
      style={styles.shadow}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.peekSection}>
          <View style={styles.peekRow}>
            <View style={styles.peekText}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
                <View style={[styles.badge, { backgroundColor: `${stateColor}15` }]}>
                  <View style={[styles.badgeDot, { backgroundColor: stateColor }]} />
                  <Text style={[styles.badgeLabel, { color: stateColor }]}>
                    {getStateLabel(event.state)}
                  </Text>
                </View>
              </View>
              <Text style={styles.desc} numberOfLines={2}>{event.shortDescription}</Text>
            </View>
            <Pressable
              onPress={handleViewDetail}
              style={({ pressed }) => [styles.detailBtn, pressed && { opacity: 0.7 }]}
              accessibilityLabel="Veure detall de l'acte"
            >
              <ExternalLink size={16} color={Colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.fullSection}>
          {event.imageUrl && (
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: event.imageUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={300}
                placeholder={{ blurhash: event.blurhash ?? DEFAULT_BLURHASH }}
              />
              <LinearGradient
                colors={['transparent', Colors.surface]}
                style={styles.imageGradient}
                pointerEvents="none"
              />
            </View>
          )}

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Clock size={15} color={Colors.textDim} />
              <Text style={styles.detailText}>
                {dayLabel} {'\u00b7'} {formatTime(event.start)} {'\u2013'} {formatTime(event.end)}
              </Text>
            </View>
            {event.kind === 'mobile' && (
              <View style={styles.detailRow}>
                <PersonStanding size={15} color={Colors.textDim} />
                <Text style={styles.detailText}>Recorregut pels carrers</Text>
              </View>
            )}
            {event.kind === 'static' && event.locationName && (
              <View style={styles.detailRow}>
                <MapPin size={15} color={Colors.textDim} />
                <Text style={styles.detailText}>{event.locationName}</Text>
              </View>
            )}
          </View>

          <View style={[styles.actions, { paddingBottom: insets.bottom + 12 }]}>
            <Pressable
              style={({ pressed }) => [styles.calendarBtn, pressed && styles.btnPressed]}
              onPress={handleCalendar}
            >
              <CalendarPlus size={18} color="#fff" />
              <Text style={styles.calendarBtnText}>Afegir al calendari</Text>
            </Pressable>
            {showViewInMap && onViewInMap && (
              <Pressable
                style={({ pressed }) => [styles.mapBtn, pressed && styles.btnPressed]}
                onPress={handleViewInMap}
              >
                <Map size={18} color={Colors.primary} />
                <Text style={styles.mapBtnText}>Veure al mapa</Text>
              </Pressable>
            )}
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}


const IMAGE_H = 160;

const styles = StyleSheet.create({
  // ── Sheet chrome ──────────────────────────────────────────────────────────
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  background: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleArea: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },

  // ── Scroll content ─────────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
  },

  // ── Peek zone ─────────────────────────────────────────────────────────────
  peekSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },
  peekRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    gap: 12,
  },
  peekText: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 1,
    letterSpacing: -0.3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  desc: {
    color: Colors.textMuted,
    fontSize: 13,
    minHeight: 36,
    lineHeight: 18,
  },

  // ── Full zone ─────────────────────────────────────────────────────────────
  fullSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  imageWrap: {
    height: IMAGE_H,
    overflow: 'hidden',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  details: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: Colors.textMuted,
    fontSize: 13,
    flex: 1,
  },

  // ── Actions ───────────────────────────────────────────────────────────────
  actions: {
    paddingHorizontal: 16,
    paddingTop: 12,
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
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
    paddingHorizontal: 12,

  },
  calendarBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  mapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceHigh,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  mapBtnText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  detailBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.7,
  },
});
