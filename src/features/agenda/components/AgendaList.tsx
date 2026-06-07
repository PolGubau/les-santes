import type { Event } from '@/entities/event';
import { STATE_COLOR } from '@/entities/event';
import { Colors } from '@/shared/constants';
import type { UserCoords } from '@/shared/hooks';
import { t } from '@/shared/i18n';
import { haversineDistance } from '@/shared/lib';
import { SectionHeader } from '@/shared/ui';
import { AgendaSkeletonList } from './AgendaSkeletonList';
import { CalendarOff, Moon } from 'lucide-react-native';
import React, { memo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/shared/ui';
import { buildSections } from '../lib/sections';
import { EventCard } from './EventCard';

interface Props {
  events: Event[];
  userCoords?: UserCoords | null;
  onEventPress?: (event: Event) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  emptyText?: string;
  emptySubtext?: string;
  /** Optional slot rendered below the default empty state (e.g. nudge CTA). */
  emptyExtra?: React.ReactNode;
}

const SectionCard = memo(function SectionCard({
  section,
  userCoords,
  onEventPress,
}: {
  section: ReturnType<typeof buildSections>[number];
  userCoords?: UserCoords | null;
  onEventPress?: (event: Event) => void;
}) {
  return (
    <View style={styles.sectionCard}>
      <SectionHeader
        title={section.title}
        count={section.data.length}
        accentColor={STATE_COLOR[section.state]}
      />

      {/* Divider */}
      <View style={styles.headerDivider} />

      {/* Event rows — with a 🌙 Nit separator before the first post-midnight event */}
      {(() => {
        const nitIndex = section.data.findIndex(
          (e) => new Date(e.start).getHours() < 6,
        );
        return section.data.map((item, idx) => {
          const distanceMeters =
            userCoords && item.kind === 'static' && item.location
              ? haversineDistance(userCoords.lat, userCoords.lng, item.location.lat, item.location.lng)
              : undefined;
          return (
            <React.Fragment key={item.id}>
              {idx === nitIndex && (
                <View style={styles.nitSeparator}>
                  <View style={styles.nitLine} />
                  <Moon size={12} color={Colors.textMuted} />
                  <Text style={styles.nitLabel}>{t('agenda.nit')}</Text>
                  <View style={styles.nitLine} />
                </View>
              )}
              <EventCard
                event={item}
                onPress={() => onEventPress?.(item)}
                distanceMeters={distanceMeters}
              />
              {idx < section.data.length - 1 && idx !== nitIndex - 1 && (
                <View style={styles.itemDivider} />
              )}
            </React.Fragment>
          );
        });
      })()}
    </View>
  );
});

export function AgendaList({
  events,
  userCoords,
  onEventPress,
  onRefresh,
  refreshing = false,
  loading = false,
  emptyText = t('agenda.emptyFiltered'),
  emptySubtext,
  emptyExtra,
}: Props) {
  const sections = buildSections(events);

  if (loading && sections.length === 0) {
    return <AgendaSkeletonList />;
  }

  if (sections.length === 0) {
    return (
      <View style={styles.empty}>
        <CalendarOff size={44} color={Colors.textDim} />
        <Text style={styles.emptyText}>{emptyText}</Text>
        {emptySubtext && <Text style={styles.emptySubtext}>{emptySubtext}</Text>}
        {emptyExtra}
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
            tintColor={Colors.primary}
          />
        ) : undefined
      }
    >
      {sections.map((section) => (
        <SectionCard
          key={section.state}
          section={section}
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
    paddingHorizontal: 40,
  },
  emptyText: { color: Colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  emptySubtext: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  nitSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceHigh,
  },
  nitLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  nitLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});
