import { type Event, STATE_COLOR, STATE_LABEL_SHORT } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { addEventToCalendar, formatDayShort, formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarPlus, Clock, Map, MapPin, PersonStanding } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_H = Dimensions.get('window').height;
const FULL_H = Math.min(580, SCREEN_H * 0.88);
const PEEK_H = 230;
const SNAP_PEEK = FULL_H - PEEK_H;
const SNAP_FULL = 0;
const SNAP_CLOSE = FULL_H;
const DEFAULT_BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';
const IMAGE_H = 150;

interface Props {
  event: Event;
  onClose: () => void;
  showViewInMap?: boolean;
  onViewInMap?: () => void;
}

export function EventSnapSheet({ event, onClose, showViewInMap, onViewInMap }: Props) {
  const insets = useSafeAreaInsets();
  const stateColor = STATE_COLOR[event.state];
  const translateY = useRef(new Animated.Value(SNAP_CLOSE)).current;
  const [isExpanded, setIsExpanded] = useState(false);
  const snapRef = useRef(SNAP_PEEK);
  const panStartY = useRef(SNAP_PEEK);

  useEffect(() => {
    snapRef.current = SNAP_PEEK;
    Animated.spring(translateY, {
      toValue: SNAP_PEEK,
      damping: 22, stiffness: 280, mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const springTo = useCallback((toValue: number, onDone?: () => void) => {
    snapRef.current = toValue;
    setIsExpanded(toValue === SNAP_FULL);
    Animated.spring(translateY, {
      toValue, damping: 20, stiffness: 260, mass: 0.8, useNativeDriver: true,
    }).start(onDone);
  }, [translateY]);

  const dismiss = useCallback(() => {
    snapRef.current = SNAP_CLOSE;
    setIsExpanded(false);
    Animated.timing(translateY, { toValue: SNAP_CLOSE, duration: 240, useNativeDriver: true }).start(onClose);
  }, [translateY, onClose]);

  const overlayOpacity = translateY.interpolate({
    inputRange: [SNAP_FULL, SNAP_PEEK], outputRange: [0.48, 0], extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderGrant: () => { panStartY.current = snapRef.current; },
      onPanResponderMove: (_, g) => {
        const next = Math.max(SNAP_FULL, Math.min(SNAP_CLOSE, panStartY.current + g.dy));
        translateY.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        if (panStartY.current === SNAP_FULL) {
          if (g.dy > 80 || g.vy > 1.2) springTo(SNAP_PEEK);
          else springTo(SNAP_FULL);
        } else {
          if (g.dy < -50 || g.vy < -1.2) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            springTo(SNAP_FULL);
          } else if (g.dy > 70 || g.vy > 1.2) {
            dismiss();
          } else {
            springTo(SNAP_PEEK);
          }
        }
      },
    })
  ).current;

  const handleViewInMap = useCallback(() => { dismiss(); onViewInMap?.(); }, [dismiss, onViewInMap]);
  const handleCalendar = useCallback(() => { addEventToCalendar(event); }, [event]);
  const dayLabel = formatDayShort(event.start.substring(0, 10));


  return (
    <>
      {/* Dim overlay — only interactive when expanded */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents={isExpanded ? 'auto' : 'none'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => springTo(SNAP_PEEK)} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* ─── Full zone (hidden at peek) ─── */}
        <View style={styles.fullZone}>
          {event.imageUrl ? (
            <View style={styles.imageWrap}>
              <Image source={{ uri: event.imageUrl }} style={StyleSheet.absoluteFill}
                contentFit="cover" transition={300} placeholder={{ blurhash: event.blurhash ?? DEFAULT_BLURHASH }} />
              <LinearGradient colors={['transparent', Colors.surface]} style={styles.imageGradient} pointerEvents="none" />
            </View>
          ) : null}
          <ScrollView style={styles.fullScroll} contentContainerStyle={styles.fullScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.row}>
              <Clock size={15} color={Colors.textDim} />
              <Text style={styles.rowText}>{dayLabel} · {formatTime(event.start)} – {formatTime(event.end)}</Text>
            </View>
            {event.kind === 'mobile' && (
              <View style={styles.row}><PersonStanding size={15} color={Colors.textDim} /><Text style={styles.rowText}>Recorregut pels carrers</Text></View>
            )}
            {event.kind === 'static' && event.locationName && (
              <View style={styles.row}><MapPin size={15} color={Colors.textDim} /><Text style={styles.rowText}>{event.locationName}</Text></View>
            )}
            <Pressable style={styles.calendarBtn} onPress={handleCalendar}>
              <CalendarPlus size={17} color="#fff" />
              <Text style={styles.calendarBtnText}>Afegir al calendari</Text>
            </Pressable>
            {showViewInMap && onViewInMap && (
              <Pressable style={styles.mapBtn} onPress={handleViewInMap}>
                <Map size={17} color={Colors.primary} />
                <Text style={styles.mapBtnText}>Veure al mapa</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>

        {/* ─── Peek zone (always visible) ─── */}
        <View style={[styles.peekZone, { paddingBottom: insets.bottom + 8 }]}>
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
          <View style={styles.peekRow}>
            <View style={[styles.iconBox, { backgroundColor: `${stateColor}18` }]}>
              <EventIcon icon={event.icon} size={24} color={stateColor} />
            </View>
            <View style={styles.peekText}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
                <View style={[styles.badge, { backgroundColor: `${stateColor}18` }]}>
                  <View style={[styles.badgeDot, { backgroundColor: stateColor }]} />
                  <Text style={[styles.badgeLabel, { color: stateColor }]}>{STATE_LABEL_SHORT[event.state]}</Text>
                </View>
              </View>
              <Text style={styles.desc} numberOfLines={2}>{event.shortDescription}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: FULL_H,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  // Full zone — fills space above peek zone
  fullZone: {
    flex: 1,
    overflow: 'hidden',
  },
  imageWrap: {
    height: IMAGE_H,
    width: '100%',
  },
  imageGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: IMAGE_H / 2 },
  fullScroll: { flex: 1 },
  fullScrollContent: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText: { color: Colors.text, fontSize: 14, fontWeight: '500', flexShrink: 1 },
  calendarBtn: {
    marginTop: 6,
    backgroundColor: Colors.primary,
    borderRadius: 12, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  calendarBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  mapBtn: {
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 12, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  mapBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  // Peek zone — fixed height, always visible
  peekZone: {
    height: PEEK_H,
    borderTopWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  handleArea: { alignItems: 'center', paddingTop: 12, paddingBottom: 10 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  peekRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  peekText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  title: { color: Colors.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeLabel: { fontSize: 11, fontWeight: '600' },
  desc: { color: Colors.textMuted, fontSize: 13, lineHeight: 18 },
});
