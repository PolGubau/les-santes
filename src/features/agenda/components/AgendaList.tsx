import type { Event } from '@/entities/event';
import { STATE_COLOR } from '@/entities/event';
import { Colors } from '@/shared/constants';
import type { UserCoords } from '@/shared/hooks';
import { haversineDistance } from '@/shared/lib';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { buildSections } from '../lib/sections';
import { EventCard } from './EventCard';

interface Props {
  events: Event[];
  userCoords?: UserCoords | null;
  onEventPress?: (event: Event) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyText?: string;
  emptyIcon?: React.ComponentProps<typeof Ionicons>["name"];
}

function SectionCard({
  section,
  index,
  userCoords,
  onEventPress,
}: {
  section: ReturnType<typeof buildSections>[number];
  index: number;
  userCoords?: UserCoords | null;
  onEventPress?: (event: Event) => void;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 70, withSpring(1, { damping: 18, stiffness: 120 }));
    translateY.value = withDelay(index * 70, withSpring(0, { damping: 18, stiffness: 120 }));
  }, [index, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.sectionCard, animStyle]}>
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
      {section.data.map((item, idx) => {
        const distanceMeters =
          userCoords && item.kind === 'static' && item.location
            ? haversineDistance(userCoords.lat, userCoords.lng, item.location.lat, item.location.lng)
            : undefined;
        return (
          <React.Fragment key={item.id}>
            <EventCard
              event={item}
              onPress={() => onEventPress?.(item)}
              distanceMeters={distanceMeters}
            />
            {idx < section.data.length - 1 && <View style={styles.itemDivider} />}
          </React.Fragment>
        );
      })}
    </Animated.View>
  );
}

export function AgendaList({
  events,
  userCoords,
  onEventPress,
  onRefresh,
  refreshing = false,
  emptyText = 'Cap acte trobat',
  emptyIcon = 'calendar-outline',
}: Props) {
  const sections = buildSections(events);

  if (sections.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name={emptyIcon} size={40} color={Colors.textDim} />
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
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
      {sections.map((section, i) => (
        <SectionCard
          key={section.state}
          section={section}
          index={i}
          userCoords={userCoords}
          onEventPress={onEventPress}
        />
      ))}
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
