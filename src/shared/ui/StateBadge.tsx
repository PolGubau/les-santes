import { type EventState, STATE_COLOR, getStateLabel } from '@/entities/event';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';

interface Props {
  state: EventState;
}

export function StateBadge({ state }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: STATE_COLOR[state] }]}>
      <Text style={styles.label}>{getStateLabel(state)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  label: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
