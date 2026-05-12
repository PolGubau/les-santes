import { useAnnouncements } from "@/entities/announcement";
import type { Event } from "@/entities/event";
import { useEvents } from "@/entities/event";
import { AgendaFilterBar, AgendaList, DayPicker, useAgenda } from "@/features/agenda";
import { useFavoritesStore } from "@/features/favorites";
import { Colors } from "@/shared/constants";
import { t } from "@/shared/i18n";
import { useUserLocation } from "@/shared/hooks";
import { AnnouncementBanner, ErrorState, LoadingState, OfflineBanner, Screen } from "@/shared/ui";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Search, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";

export default function AgendaScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const announcements = useAnnouncements();
  const userCoords = useUserLocation();
  const flatRef = useRef<FlatList<string>>(null);
  // 'picker' = DayPicker tapped, 'swipe' = user dragged FlatList
  const swipeSourceRef = useRef<'picker' | 'swipe'>('picker');

  const { events, loading, error, isOffline, isRefreshing, cacheTimestamp, refresh } = useEvents();

  const { favorites } = useFavoritesStore();
  const favoriteIds = useMemo(() => new Set(Object.keys(favorites)), [favorites]);
  const totalFavorites = favoriteIds.size;

  const [searchText, setSearchText] = useState('');

  const {
    filteredByDay,
    filters,
    setSearch,
    setType,
    setCategory,
    toggleNearMe,
    toggleFavorites,
    selectedDay,
    availableDays,
    todayKey,
    setDay,
  } = useAgenda(events, userCoords, favoriteIds);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    setSearch(text);
  }, [setSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setSearch('');
    Haptics.selectionAsync();
  }, [setSearch]);

  const dayCount = filteredByDay.get(selectedDay)?.length ?? 0;

  // DayPicker tap → scroll FlatList (skip when change came from swipe)
  useEffect(() => {
    if (swipeSourceRef.current === 'swipe') {
      swipeSourceRef.current = 'picker';
      return;
    }
    const idx = availableDays.indexOf(selectedDay);
    if (idx < 0 || !flatRef.current) return;
    flatRef.current.scrollToIndex({ index: idx, animated: true });
  }, [selectedDay, availableDays]);

  // Commit day change only after momentum stops — no re-renders during scroll
  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      const day = availableDays[idx];
      if (day && day !== selectedDay) {
        swipeSourceRef.current = 'swipe';
        Haptics.selectionAsync();
        setDay(day);
      }
    },
    [SCREEN_WIDTH, availableDays, selectedDay, setDay],
  );

  const handleEventPress = useCallback((event: Event) => {
    router.push(`/event/${event.id}`);
  }, []);

  if (error && events.length === 0) {
    return (
      <Screen>
        <ErrorState
          message={t('error.eventsMessage')}
          onRetry={refresh}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('agenda.title')}</Text>
          <Text style={styles.count}>{t('agenda.eventsCount', { count: dayCount })}</Text>
        </View>

        <DayPicker
          days={availableDays}
          selected={selectedDay}
          todayKey={todayKey}
          onSelect={setDay}
        />

        {/* Search bar */}
        <View style={styles.searchWrap}>
          <Search size={18} color={Colors.textDim} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={handleSearchChange}
            placeholder="Cerca un acte…"
            placeholderTextColor={Colors.textDim}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="never"
          />
          {searchText.length > 0 && (
            <Pressable onPress={handleClearSearch} hitSlop={10} accessibilityLabel="Esborrar cerca">
              <X size={18} color={Colors.textDim} />
            </Pressable>
          )}
        </View>

        <AgendaFilterBar
          filters={filters}
          totalFavorites={totalFavorites}
          userCoords={userCoords}
          onToggleFavorites={toggleFavorites}
          onToggleNearMe={toggleNearMe}
          onSetType={setType}
          onSetCategory={setCategory}
        />
      </View>

      {isOffline && (
        <OfflineBanner cacheTimestamp={cacheTimestamp} onRefresh={refresh} isRefreshing={isRefreshing} />
      )}

      <AnnouncementBanner announcements={announcements} />

      {loading && events.length === 0 && <LoadingState />}

      {(!loading || events.length > 0) && <FlatList
        ref={flatRef}
        data={availableDays}
        keyExtractor={(day) => day}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.pager}
        initialScrollIndex={Math.max(0, availableDays.indexOf(selectedDay))}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        windowSize={5}
        maxToRenderPerBatch={2}
        initialNumToRender={1}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item: day }) => (
          <View style={[styles.page, { width: SCREEN_WIDTH }]}>
            <AgendaList
              events={filteredByDay.get(day) ?? []}
              userCoords={userCoords}
              onEventPress={handleEventPress}
              onRefresh={refresh}
              refreshing={isRefreshing}
              loading={loading}
              emptyText={filters.onlyFavorites ? t('agenda.emptyFavorites') : t('agenda.emptyFiltered')}
              emptySubtext={
                filters.onlyFavorites
                  ? t('agenda.emptyFavoritesSubtext')
                  : filters.type || filters.nearMe
                    ? t('agenda.emptyFilteredSubtext')
                    : undefined
              }
            />
          </View>
        )}
      />}


    </Screen>
  );
}

const styles = StyleSheet.create({
  topSection: { flexShrink: 0 },
  pager: { flex: 1 },
  page: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: { color: Colors.text, fontSize: 24, fontWeight: "700" },
  count: { color: Colors.textMuted, fontSize: 14, fontVariant: ['tabular-nums'] },
  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchIcon: { flexShrink: 0 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 0,
  },
});
