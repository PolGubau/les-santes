import { type Event, STATE_COLOR, STATE_LABEL_SHORT } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { formatTime } from '@/shared/lib';
import { BottomSheet, EventIcon } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  event: Event;
  onClose: () => void;
}

export function EventDetailSheet({ event, onClose }: Props) {
  const stateColor = STATE_COLOR[event.state];

  return (
    <BottomSheet onClose={onClose}>
      <View style={[styles.stateBadge, { backgroundColor: `${stateColor}22` }]}>
        <View style={[styles.stateDot, { backgroundColor: stateColor }]} />
        <Text style={[styles.stateText, { color: stateColor }]}>{STATE_LABEL_SHORT[event.state]}</Text>
      </View>

      <View style={styles.iconBox}>
        <EventIcon icon={event.icon} size={32} color={Colors.text} />
      </View>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description}>{event.shortDescription}</Text>

      <View style={styles.row}>
        <Ionicons name="time-outline" size={16} color={Colors.textDim} />
        <Text style={styles.rowText}>
          {formatTime(event.start)} - {formatTime(event.end)}
        </Text>
      </View>

      {event.kind === 'mobile' && (
        <View style={styles.row}>
          <Ionicons name="walk-outline" size={16} color={Colors.textDim} />
          <Text style={styles.rowText}>Recorregut pels carrers</Text>
        </View>
      )}
      {event.kind === 'static' && (
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color={Colors.textDim} />
          <Text style={styles.rowText}>Lloc fix</Text>
        </View>
      )}

      <Pressable style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>Tancar</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  stateDot: { width: 6, height: 6, borderRadius: 3 },
  stateText: { fontSize: 12, fontWeight: '600' },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  description: { color: Colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rowText: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  closeBtn: {
    marginTop: 20,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
});
