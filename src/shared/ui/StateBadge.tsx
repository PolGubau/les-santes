import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { EventState } from '@/entities/event';
import { Colors } from '@/shared/constants';

const LABEL: Record<EventState, string> = {
  now: 'Ara',
  upcoming: 'Pròxim',
  finished: 'Finalitzat',
};

const BG: Record<EventState, string> = {
  now: Colors.stateNow,
  upcoming: Colors.stateUpcoming,
  finished: Colors.stateFinished,
};

interface Props {
  state: EventState;
}

export function StateBadge({ state }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: BG[state] }]}>
      <Text style={styles.label}>{LABEL[state]}</Text>
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
