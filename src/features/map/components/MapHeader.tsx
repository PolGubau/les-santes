import { DayPicker } from '@/features/agenda';
import { Colors } from '@/shared/constants';
import { formatDayFull } from '@/shared/lib';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  return (
    <View style={[styles.container, { top: insets.top + 8 }]}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.dateLabel} numberOfLines={1}>
            {formatDayFull(selectedDay)}
          </Text>
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

        <DayPicker
          days={availableDays}
          selected={selectedDay}
          todayKey={todayKey}
          onSelect={onDayChange}
        />
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
    paddingBottom: 4,
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
