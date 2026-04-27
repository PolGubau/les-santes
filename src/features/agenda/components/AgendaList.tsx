import type { Event } from '@/entities/event';
import { STATE_COLOR } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buildSections } from '../lib/sections';
import { EventCard } from './EventCard';

interface Props {
  events: Event[];
  onEventPress?: (event: Event) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

// Pre-allocate 3 animated values (one per possible section: now/upcoming/finished)
const SECTION_ANIM_COUNT = 3;

export function AgendaList({ events, onEventPress, onRefresh, refreshing = false }: Props) {
  const sections = buildSections(events);

  const animValues = useRef(
    Array.from({ length: SECTION_ANIM_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    for (const v of animValues) v.setValue(0);
    Animated.stagger(
      70,
      animValues.slice(0, sections.length).map((v) =>
        Animated.spring(v, { toValue: 1, useNativeDriver: true, tension: 120, friction: 14 }),
      ),
    ).start();
    // animValues is a stable ref; sections.length is derived from events
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  if (sections.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="calendar-outline" size={40} color={Colors.textDim} />
        <Text style={styles.emptyText}>Cap acte trobat</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#888"
          />
        ) : undefined
      }
    >
      {sections.map((section, i) => {
        const anim = animValues[i];
        return (
          <Animated.View
            key={section.state}
            style={[
              styles.sectionCard,
              {
                opacity: anim,
                transform: [
                  { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.sectionHeader}>
              <View style={[styles.accentBar, { backgroundColor: STATE_COLOR[section.state] }]} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={[styles.countBadge, { borderColor: STATE_COLOR[section.state] }]}>
                <Text style={[styles.countText, { color: STATE_COLOR[section.state] }]}>
                  {section.data.length}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.headerDivider} />

            {/* Event rows */}
            {section.data.map((item, index) => (
              <React.Fragment key={item.id}>
                <EventCard event={item} onPress={() => onEventPress?.(item)} />
                {index < section.data.length - 1 && <View style={styles.itemDivider} />}
              </React.Fragment>
            ))}
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 12 },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  accentBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  sectionTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  itemDivider: {
    height: 1,
    marginHorizontal: 14,
    backgroundColor: Colors.border,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: { color: Colors.textMuted, fontSize: 16, marginTop: 4 },
});
