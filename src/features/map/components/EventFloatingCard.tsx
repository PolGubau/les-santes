import { type Event, STATE_COLOR, STATE_LABEL_SHORT } from '@/entities/event';
import { Colors, Typography } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import { EventIcon } from '@/shared/ui';
import { Clock, MapPin, PersonStanding, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_HEIGHT = 49;

interface Props {
  event: Event;
  onClose: () => void;
  onExpand: () => void;
}

export function EventFloatingCard({ event, onClose, onExpand }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(160)).current;
  const stateColor = STATE_COLOR[event.state];

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      damping: 22,
      stiffness: 280,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const dismiss = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 160,
      duration: 220,
      useNativeDriver: true,
    }).start(onClose);
  }, [translateY, onClose]);

  const bottom = insets.bottom + TAB_BAR_HEIGHT + 12;

  return (
    <Animated.View
      style={[styles.card, { bottom, transform: [{ translateY }] }]}
      pointerEvents="box-none"
    >
      <Pressable style={styles.inner} onPress={onExpand}>
        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: `${stateColor}18` }]}>
          <EventIcon icon={event.icon} size={26} color={stateColor} />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
            <View style={[styles.badge, { backgroundColor: `${stateColor}18` }]}>
              <Text style={[styles.badgeText, { color: stateColor }]}>
                {STATE_LABEL_SHORT[event.state]}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Clock size={12} color={Colors.textMuted} />
            <Text style={styles.meta}>{formatTime(event.start)} – {formatTime(event.end)}</Text>

            {event.kind === 'static' && event.locationName ? (
              <>
                <Text style={styles.dot}> · </Text>
                <MapPin size={12} color={Colors.textMuted} />
                <Text style={styles.meta} numberOfLines={1}>{event.locationName}</Text>
              </>
            ) : event.kind === 'mobile' ? (
              <>
                <Text style={styles.dot}> · </Text>
                <PersonStanding size={12} color={Colors.textMuted} />
                <Text style={styles.meta}>Recorregut</Text>
              </>
            ) : null}
          </View>
        </View>
      </Pressable>

      {/* Close */}
      <Pressable style={styles.closeBtn} onPress={dismiss} hitSlop={10}>
        <X size={15} color={Colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    paddingRight: 40,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    ...Typography.semiBold,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, ...Typography.semiBold },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flexWrap: 'nowrap' },
  meta: { fontSize: 12, color: Colors.textMuted, ...Typography.regular },
  dot: { fontSize: 12, color: Colors.textDim },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
