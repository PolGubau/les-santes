import { Colors, Typography } from '@/shared/constants';
import { formatDayShort } from '@/shared/lib';
import * as Haptics from 'expo-haptics';
import { List, Search, X } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  selectedDay: string;
  availableDays: string[];
  todayKey: string;
  liveCount: number;
  searchText: string;
  isFiltering: boolean;
  onDayChange: (day: string) => void;
  onListPress: () => void;
  onSearchChange: (text: string) => void;
  onSearchFocus: () => void;
}

export const MapHeader = React.memo(function MapHeader({
  selectedDay,
  availableDays,
  todayKey,
  liveCount,
  searchText,
  isFiltering,
  onDayChange,
  onListPress,
  onSearchChange,
  onSearchFocus,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleDaySelect = useCallback(
    (day: string) => {
      Haptics.selectionAsync();
      onDayChange(day);
    },
    [onDayChange],
  );

  const clearSearch = useCallback(() => onSearchChange(''), [onSearchChange]);

  return (
    <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">

      {/* ── Search row ── */}
      <View style={styles.searchRow} pointerEvents="box-none">
        <View style={[styles.searchPill, isFiltering && styles.searchPillActive]} pointerEvents="auto">
          <Search size={16} color={isFiltering ? Colors.primary : Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca actes…"
            placeholderTextColor={Colors.textDim}
            value={searchText}
            onChangeText={onSearchChange}
            onFocus={onSearchFocus}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {searchText.length > 0 && (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <X size={15} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>

        <Pressable style={styles.listBtn} onPress={onListPress} hitSlop={8} pointerEvents="auto">
          <List size={18} color={Colors.text} />
          {liveCount > 0 && <View style={styles.liveDot} />}
        </Pressable>
      </View>

      {/* ── Day chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
        style={styles.chipsRow}
        pointerEvents="auto"
      >
        {availableDays.map((day) => {
          const isSelected = day === selectedDay;
          const isToday = day === todayKey;
          return (
            <Pressable
              key={day}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => handleDaySelect(day)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {isToday ? 'Avui' : formatDayShort(day)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

    </View>
  );
});

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 12, right: 12, gap: 8 },

  // Search row
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 30,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchPillActive: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    ...Typography.regular,
    paddingVertical: 0,
  },
  listBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  liveDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.stateNow,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },

  // Day chips
  chipsRow: { flexGrow: 0 },
  chipsContent: { paddingHorizontal: 2, gap: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 13, color: Colors.text, ...Typography.semiBold },
  chipTextSelected: { color: '#fff' },
});
