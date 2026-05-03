import type { Event, EventType } from "@/entities/event";
import { useEvents } from "@/entities/event";
import { AgendaList, DayPicker, useAgenda } from "@/features/agenda";
import { useFavoritesStore } from "@/features/favorites";
import { useMapFocusStore } from "@/features/map";
import { Colors } from "@/shared/constants";
import { useUserLocation } from "@/shared/hooks";
import { ErrorState, OfflineBanner, Screen } from "@/shared/ui";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  Crown, Flag, Flame, Heart, MapPin, Mic, Music, Sailboat, Smile, Ticket, Users,
} from "lucide-react-native";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import type { LucideIcon } from "lucide-react-native";

const TYPE_FILTERS: Array<{
  label: string;
  value: EventType;
  Icon?: LucideIcon;
}> = [
    { label: "Correfoc", value: "correfoc", Icon: Flame },
    { label: "Concerts", value: "concert", Icon: Mic },
    { label: "Sardanes", value: "sardanes", Icon: Music },
    { label: "Gegants", value: "gegants", Icon: Crown },
    { label: "Castellers", value: "castellera", Icon: Users },
    { label: "Cercavila", value: "cercavila", Icon: Flag },
    { label: "Havaneres", value: "havaneres", Icon: Sailboat },
    { label: "Espectacle", value: "espectacle", Icon: Ticket },
    { label: "Familiar", value: "jocs", Icon: Smile },
  ];

export default function AgendaScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { focusEvent } = useMapFocusStore();

  const userCoords = useUserLocation();
  const flatRef = useRef<FlatList<string>>(null);
  const isScrollingFromPicker = useRef(false);

  const { events, loading, error, isOffline, cacheTimestamp, refresh } = useEvents();
  // `loading` is true on first fetch; use it as pull-to-refresh indicator only after first data
  const refreshing = loading && events.length > 0;

  const { favorites } = useFavoritesStore();
  const favoriteIds = useMemo(() => new Set(Object.keys(favorites)), [favorites]);
  const totalFavorites = favoriteIds.size;

  const {
    filteredByDay,
    filters,
    setType,
    toggleNearMe,
    toggleFavorites,
    selectedDay,
    availableDays,
    todayKey,
    setDay,
  } = useAgenda(events, userCoords, favoriteIds);

  const dayCount = filteredByDay.get(selectedDay)?.length ?? 0;

  // Sync FlatList position when DayPicker selection changes
  useEffect(() => {
    const idx = availableDays.indexOf(selectedDay);
    if (idx < 0 || !flatRef.current) return;
    isScrollingFromPicker.current = true;
    flatRef.current.scrollToIndex({ index: idx, animated: true });
    // Safety: reset flag even if scrollToIndex doesn't fire onMomentumScrollEnd
    const timer = setTimeout(() => { isScrollingFromPicker.current = false; }, 500);
    return () => clearTimeout(timer);
  }, [selectedDay, availableDays]);

  const handleFlatListScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isScrollingFromPicker.current) {
        isScrollingFromPicker.current = false;
        return;
      }
      const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      const day = availableDays[idx];
      if (day && day !== selectedDay) {
        Haptics.selectionAsync();
        setDay(day);
      }
    },
    [SCREEN_WIDTH, availableDays, selectedDay, setDay],
  );

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleEventPress = useCallback((event: Event) => {
    focusEvent(event.id);
    router.push('/(tabs)/mapa');
  }, [focusEvent]);

  if (error && events.length === 0) {
    return (
      <Screen>
        <ErrorState
          message="No s'han pogut carregar els actes del festival."
          onRetry={refresh}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <Text style={styles.title}>Agenda</Text>
          <Text style={styles.count}>{dayCount} actes</Text>
        </View>

        <DayPicker
          days={availableDays}
          selected={selectedDay}
          todayKey={todayKey}
          onSelect={setDay}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {/* "Favorits" chip */}
          <Pressable
            style={[styles.chip, filters.onlyFavorites && styles.chipFavorites]}
            onPress={() => {
              Haptics.selectionAsync();
              toggleFavorites();
            }}
            accessibilityRole="tab"
            accessibilityLabel="Filtre: Favorits"
            accessibilityState={{ selected: !!filters.onlyFavorites }}
          >
            <Heart
              size={15}
              color={filters.onlyFavorites ? "#fff" : Colors.primary}
              fill={filters.onlyFavorites ? "#fff" : "none"}
            />
            <Text style={[styles.chipText, filters.onlyFavorites && styles.chipTextActive]}>
              Favorits
            </Text>
            {totalFavorites > 0 && (
              <View style={[styles.favBadge, filters.onlyFavorites && styles.favBadgeActive]}>
                <Text style={[styles.favBadgeText, filters.onlyFavorites && styles.favBadgeTextActive]}>
                  {totalFavorites}
                </Text>
              </View>
            )}
          </Pressable>

          {/* "Aprop meu" chip */}
          {userCoords && (
            <Pressable
              style={[styles.chip, filters.nearMe && styles.chipNearMe]}
              onPress={() => {
                Haptics.selectionAsync();
                toggleNearMe();
              }}
              accessibilityRole="tab"
              accessibilityLabel="Filtre: Aprop meu"
              accessibilityState={{ selected: !!filters.nearMe }}
            >
              <MapPin
                size={15}
                color={filters.nearMe ? "#fff" : Colors.primary}
              />
              <Text style={[styles.chipText, filters.nearMe && styles.chipTextActive]}>
                Aprop meu
              </Text>
            </Pressable>
          )}
          {TYPE_FILTERS.map((f) => {
            const active = filters.type === f.value;
            const iconColor = active ? "#fff" : Colors.textDim;
            return (
              <Pressable
                key={f.label}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setType(active ? undefined : f.value)}
                accessibilityRole="tab"
                accessibilityLabel={`Filtre: ${f.label}`}
                accessibilityState={{ selected: active }}
              >
                {f.Icon && <f.Icon size={15} color={iconColor} />}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isOffline && (
        <OfflineBanner cacheTimestamp={cacheTimestamp} onRefresh={refresh} />
      )}

      <FlatList
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
        onMomentumScrollEnd={handleFlatListScroll}
        renderItem={({ item: day }) => (
          <View style={[styles.page, { width: SCREEN_WIDTH }]}>
            <AgendaList
              events={filteredByDay.get(day) ?? []}
              userCoords={userCoords}
              onEventPress={handleEventPress}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              loading={loading}
              emptyText={filters.onlyFavorites ? 'Cap favorit aquest dia' : 'Cap acte trobat'}
              emptySubtext={
                filters.onlyFavorites
                  ? 'Afegeix actes als favorits des de l\'agenda'
                  : filters.type || filters.nearMe
                    ? 'Prova a canviar els filtres'
                    : undefined
              }
            />
          </View>
        )}
      />
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
  chips: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 0,
  },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  chipNearMe: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipFavorites: {
    backgroundColor: "#e11d48",
    borderColor: "#e11d48",
  },
  favBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  favBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  favBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    fontVariant: ['tabular-nums'],
  },
  favBadgeTextActive: {
    color: "#fff",
  },
});
