import type { EventCategory, EventType } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import type { UserCoords } from '@/shared/hooks';
import * as Haptics from 'expo-haptics';
import {
  Crown, Flag, Flame, Heart, MapPin, Mic, Moon, Music, Sailboat, Smile, Ticket, Users, Sparkles, BookOpen,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AgendaFilters } from '../hooks/useAgenda';

const TYPE_FILTERS: Array<{ label: string; value: EventType; Icon?: LucideIcon }> = [
  { label: t('filters.correfoc'), value: 'correfoc', Icon: Flame },
  { label: t('filters.concert'), value: 'concert', Icon: Mic },
  { label: t('filters.sardanes'), value: 'sardanes', Icon: Music },
  { label: t('filters.gegants'), value: 'gegants', Icon: Crown },
  { label: t('filters.castellera'), value: 'castellera', Icon: Users },
  { label: t('filters.cercavila'), value: 'cercavila', Icon: Flag },
  { label: t('filters.havaneres'), value: 'havaneres', Icon: Sailboat },
  { label: t('filters.espectacle'), value: 'espectacle', Icon: Ticket },
  { label: t('filters.jocs'), value: 'jocs', Icon: Smile },
];

const CATEGORY_FILTERS: Array<{ label: string; value: EventCategory; emoji: string; Icon: LucideIcon }> = [
  { label: 'Nocturn', value: 'nocturn', emoji: '🌙', Icon: Moon },
  { label: 'Familiar', value: 'familiar', emoji: '👨‍👩‍👧', Icon: Sparkles },
  { label: 'Tradicional', value: 'tradicional', emoji: '🎭', Icon: Flag },
  { label: 'Cultural', value: 'cultural', emoji: '🎨', Icon: BookOpen },
];

interface Props {
  filters: AgendaFilters;
  totalFavorites: number;
  userCoords?: UserCoords | null;
  onToggleFavorites: () => void;
  onToggleNearMe: () => void;
  onSetType: (type: EventType | undefined) => void;
  onSetCategory: (category: EventCategory | undefined) => void;
}

export function AgendaFilterBar({
  filters, totalFavorites, userCoords,
  onToggleFavorites, onToggleNearMe, onSetType, onSetCategory,
}: Props) {
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
          accessibilityLabel="Filtre: Favorits"
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
            accessibilityLabel="Filtre: Aprop meu"
            accessibilityState={{ selected: !!filters.nearMe }}
          >
            <MapPin size={15} color={filters.nearMe ? '#fff' : Colors.primary} />
            <Text style={[styles.chipText, filters.nearMe && styles.chipTextActive]}>{t('filters.nearMe')}</Text>
          </Pressable>
        )}

        {/* Type filters */}
        {TYPE_FILTERS.map((f) => {
          const active = filters.type === f.value;
          return (
            <Pressable
              key={f.label}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => { Haptics.selectionAsync(); onSetType(active ? undefined : f.value); }}
              accessibilityRole="tab"
              accessibilityLabel={`Filtre: ${f.label}`}
              accessibilityState={{ selected: active }}
            >
              {f.Icon && <f.Icon size={15} color={active ? '#fff' : Colors.textDim} />}
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}

        {/* Separator */}
        <View style={styles.separator} />

        {/* Category filters */}
        {CATEGORY_FILTERS.map((f) => {
          const active = filters.category === f.value;
          return (
            <Pressable
              key={f.value}
              style={[styles.chip, active && styles.chipCategoryActive]}
              onPress={() => { Haptics.selectionAsync(); onSetCategory(active ? undefined : f.value); }}
              accessibilityRole="tab"
              accessibilityLabel={`Categoria: ${f.label}`}
              accessibilityState={{ selected: active }}
            >
              <Text style={styles.chipEmoji}>{f.emoji}</Text>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
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
  chipCategoryActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipEmoji: { fontSize: 14, lineHeight: 17 },
  separator: { width: 1, height: 20, backgroundColor: Colors.border, alignSelf: 'center', marginHorizontal: 4 },
});
