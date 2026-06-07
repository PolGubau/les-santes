import type { EventType } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import type { UserCoords } from '@/shared/hooks';
import * as Haptics from 'expo-haptics';
import {
  Crown, Flag, Flame, Heart, MapPin, Mic, Music, Smile, Ticket, Users, X,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/shared/ui';
import type { AgendaFilters } from '../hooks/useAgenda';

// Keys are resolved on each render so locale changes propagate immediately.
const TYPE_FILTERS: Array<{ labelKey: 'filters.correfoc' | 'filters.concert' | 'filters.sardanes' | 'filters.gegants' | 'filters.castellera' | 'filters.cercavila' | 'filters.espectacle' | 'filters.jocs'; value: EventType; Icon: LucideIcon }> = [
  { labelKey: 'filters.correfoc', value: 'correfoc', Icon: Flame },
  { labelKey: 'filters.concert', value: 'concert', Icon: Mic },
  { labelKey: 'filters.sardanes', value: 'sardanes', Icon: Music },
  { labelKey: 'filters.gegants', value: 'gegants', Icon: Crown },
  { labelKey: 'filters.castellera', value: 'castellera', Icon: Users },
  { labelKey: 'filters.cercavila', value: 'cercavila', Icon: Flag },
  { labelKey: 'filters.espectacle', value: 'espectacle', Icon: Ticket },
  { labelKey: 'filters.jocs', value: 'jocs', Icon: Smile },
];

interface Props {
  filters: AgendaFilters;
  totalFavorites: number;
  userCoords?: UserCoords | null;
  onToggleFavorites: () => void;
  onToggleNearMe: () => void;
  onSetType: (type: EventType | undefined) => void;
  onClearAll?: () => void;
}

export function AgendaFilterBar({
  filters, totalFavorites, userCoords,
  onToggleFavorites, onToggleNearMe, onSetType, onClearAll,
}: Props) {
  const typeFilters = useMemo(
    () => TYPE_FILTERS.map((f) => ({ ...f, label: t(f.labelKey) })),
    [],
  );
  const hasActiveFilter =
    !!filters.type || !!filters.nearMe || !!filters.onlyFavorites || !!filters.search?.trim();

  return (
    <View>
      {/* Row 1: Favorits + Aprop meu + Tipus */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Favorits */}
        <Pressable
          style={[styles.chip, filters.onlyFavorites && styles.chipFavorites]}
          onPress={() => { Haptics.selectionAsync(); onToggleFavorites(); }}
          accessibilityRole="tab"
          accessibilityLabel={t('filters.filterA11y', { label: t('filters.favorites') })}
          accessibilityState={{ selected: !!filters.onlyFavorites }}
        >
          <Heart
            size={15}
            color={filters.onlyFavorites ? '#fff' : Colors.primary}
            fill={filters.onlyFavorites ? '#fff' : 'none'}
          />
          <Text style={[styles.chipText, filters.onlyFavorites && styles.chipTextActive]}>{t('filters.favorites')}</Text>
          {totalFavorites > 0 && (
            <View style={[styles.favBadge, filters.onlyFavorites && styles.favBadgeActive]}>
              <Text style={[styles.favBadgeText, filters.onlyFavorites && styles.favBadgeTextActive]}>
                {totalFavorites}
              </Text>
            </View>
          )}
        </Pressable>

        {/* Aprop meu */}
        {userCoords && (
          <Pressable
            style={[styles.chip, filters.nearMe && styles.chipNearMe]}
            onPress={() => { Haptics.selectionAsync(); onToggleNearMe(); }}
            accessibilityRole="tab"
            accessibilityLabel={t('filters.filterA11y', { label: t('filters.nearMe') })}
            accessibilityState={{ selected: !!filters.nearMe }}
          >
            <MapPin size={15} color={filters.nearMe ? '#fff' : Colors.primary} />
            <Text style={[styles.chipText, filters.nearMe && styles.chipTextActive]}>{t('filters.nearMe')}</Text>
          </Pressable>
        )}

        {/* Type filters */}
        {typeFilters.map((f) => {
          const active = filters.type === f.value;
          return (
            <Pressable
              key={f.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => { Haptics.selectionAsync(); onSetType(active ? undefined : f.value); }}
              accessibilityRole="tab"
              accessibilityLabel={t('filters.filterA11y', { label: f.label })}
              accessibilityState={{ selected: active }}
            >
              <f.Icon size={15} color={active ? '#fff' : Colors.textDim} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}

        {/* Clear-all — only rendered when at least one filter is active */}
        {hasActiveFilter && onClearAll && (
          <Pressable
            style={styles.clearChip}
            onPress={() => { Haptics.selectionAsync(); onClearAll(); }}
            accessibilityRole="button"
            accessibilityLabel={t('filters.clearAllA11y')}
          >
            <X size={14} color={Colors.textMuted} />
            <Text style={styles.clearChipText}>{t('filters.clearAll')}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, alignItems: 'center' },
  chip: {
    flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipNearMe: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipFavorites: { backgroundColor: '#e11d48', borderColor: '#e11d48' },
  chipText: { color: Colors.textMuted, fontSize: 13, fontWeight: '500', flexShrink: 0 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  favBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  favBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  favBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', fontVariant: ['tabular-nums'] },
  favBadgeTextActive: { color: '#fff' },
  clearChip: {
    flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  clearChipText: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
});
