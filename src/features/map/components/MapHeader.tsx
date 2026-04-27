import { DayPicker } from '@/features/agenda';
import { Colors } from '@/shared/constants';
import { formatDayFull } from '@/shared/lib';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Chip (58) + container paddingVertical (16) — measured from DayPicker styles
const PICKER_HEIGHT = 74;

interface Props {
  selectedDay: string;
  availableDays: string[];
  todayKey: string;
  liveCount: number;
  onDayChange: (day: string) => void;
  onListPress: () => void;
}

export const MapHeader = React.memo(function MapHeader({
  selectedDay,
  availableDays,
  todayKey,
  liveCount,
  onDayChange,
  onListPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);

  const animHeight = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animChevron = useRef(new Animated.Value(0)).current;

  const openPicker = useCallback(() => {
    setIsOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(animHeight, {
        toValue: PICKER_HEIGHT,
        tension: 280,
        friction: 22,
        useNativeDriver: false,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 180,
        delay: 60,
        useNativeDriver: true,
      }),
      Animated.spring(animChevron, {
        toValue: 1,
        tension: 280,
        friction: 22,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animHeight, animOpacity, animChevron]);

  const closePicker = useCallback(() => {
    setIsOpen(false);
    Animated.parallel([
      Animated.spring(animHeight, {
        toValue: 0,
        tension: 380,
        friction: 28,
        useNativeDriver: false,
      }),
      Animated.timing(animOpacity, {
        toValue: 0,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(animChevron, {
        toValue: 0,
        tension: 380,
        friction: 28,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animHeight, animOpacity, animChevron]);

  const toggle = useCallback(() => {
    if (isOpen) closePicker();
    else openPicker();
  }, [isOpen, openPicker, closePicker]);

  const handleDaySelect = useCallback((day: string) => {
    onDayChange(day);
    closePicker();
  }, [onDayChange, closePicker]);

  const chevronRotate = animChevron.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, { top: insets.top + 8 }]}>
      <View style={styles.card}>

        {/* ── Compact bar ── */}
        <View style={styles.topRow}>
          <Pressable style={styles.datePressable} onPress={toggle} hitSlop={6}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.dateLabel} numberOfLines={1}>
              {formatDayFull(selectedDay)}
            </Text>
            <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
              <Ionicons name="chevron-down" size={13} color={Colors.textMuted} />
            </Animated.View>
          </Pressable>

          <View style={styles.actions}>
            {liveCount > 0 && (
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>{liveCount} en curs</Text>
              </View>
            )}
            <Pressable style={styles.listBtn} onPress={onListPress} hitSlop={8}>
              <Ionicons name="list" size={18} color={Colors.text} />
            </Pressable>
          </View>
        </View>

        {/* ── Expandable picker ── */}
        <Animated.View style={{ height: animHeight, overflow: 'hidden' }}>
          <Animated.View style={{ opacity: animOpacity }}>
            <DayPicker
              days={availableDays}
              selected={selectedDay}
              todayKey={todayKey}
              onSelect={handleDaySelect}
            />
          </Animated.View>
        </Animated.View>

      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 12, right: 12 },
  card: {
    backgroundColor: `${Colors.surface}F2`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  datePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dateLabel: { color: Colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.stateNow}22`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.stateNow },
  liveText: { color: Colors.stateNow, fontSize: 11, fontWeight: '600' },
  listBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
