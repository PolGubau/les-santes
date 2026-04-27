import type { EventType } from "@/entities/event";
import { MOCK_EVENTS, withState } from "@/entities/event";
import { AgendaList, DayPicker, useAgenda } from "@/features/agenda";
import { useFavoritesStore } from "@/features/favorites";
import { Colors } from "@/shared/constants";
import { useNow, useUserLocation } from "@/shared/hooks";
import { Screen } from "@/shared/ui";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type FilterIconDef =
  | { lib: "Ionicons"; name: React.ComponentProps<typeof Ionicons>["name"] }
  | {
    lib: "MaterialCommunityIcons";
    name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  };

const TYPE_FILTERS: Array<{
  label: string;
  value: EventType;
  icon?: FilterIconDef;
}> = [
    {
      label: "Correfoc",
      value: "correfoc",
      icon: { lib: "MaterialCommunityIcons", name: "fire" },
    },
    {
      label: "Concerts",
      value: "concert",
      icon: { lib: "Ionicons", name: "mic" },
    },
    {
      label: "Sardanes",
      value: "sardanes",
      icon: { lib: "Ionicons", name: "musical-notes" },
    },
    {
      label: "Gegants",
      value: "gegants",
      icon: { lib: "MaterialCommunityIcons", name: "crown" },
    },
    {
      label: "Castellers",
      value: "castellera",
      icon: { lib: "Ionicons", name: "people" },
    },
    {
      label: "Cercavila",
      value: "cercavila",
      icon: { lib: "Ionicons", name: "flag" },
    },
    {
      label: "Havaneres",
      value: "havaneres",
      icon: { lib: "Ionicons", name: "boat" },
    },
    {
      label: "Espectacle",
      value: "espectacle",
      icon: { lib: "Ionicons", name: "ticket" },
    },
    {
      label: "Familiar",
      value: "jocs",
      icon: { lib: "Ionicons", name: "happy" },
    },
  ];

function FilterIcon({ icon, color }: { icon: FilterIconDef; color: string }) {
  if (icon.lib === "Ionicons") {
    return <Ionicons name={icon.name} size={15} color={color} />;
  }
  return <MaterialCommunityIcons name={icon.name} size={15} color={color} />;
}

export default function AgendaScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const userCoords = useUserLocation();
  const flatRef = useRef<FlatList<string>>(null);
  const isScrollingFromPicker = useRef(false);
  const now = useNow();

  const { favorites, isFavorite } = useFavoritesStore();
  const favoriteEvents = useMemo(
    () => MOCK_EVENTS.filter((e) => isFavorite(e.id)).map((e) => withState(e, now)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [favorites, now],
  );

  const {
    filteredByDay,
    filters,
    setType,
    toggleNearMe,
    selectedDay,
    availableDays,
    todayKey,
    setDay,
  } = useAgenda(MOCK_EVENTS, userCoords);

  const dayCount = showFavorites
    ? favoriteEvents.length
    : filteredByDay.get(selectedDay)?.length ?? 0;

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
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <Screen>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <Text style={styles.title}>Agenda</Text>
          <Text style={styles.count}>{dayCount} actes</Text>
        </View>

        {!showFavorites && (
          <DayPicker
            days={availableDays}
            selected={selectedDay}
            todayKey={todayKey}
            onSelect={setDay}
          />
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {/* "Favorits" chip */}
          <Pressable
            style={[styles.chip, showFavorites && styles.chipFavorites]}
            onPress={() => {
              Haptics.selectionAsync();
              setShowFavorites((v) => !v);
            }}
            accessibilityRole="tab"
            accessibilityLabel="Filtre: Favorits"
            accessibilityState={{ selected: showFavorites }}
          >
            <Ionicons
              name={showFavorites ? "heart" : "heart-outline"}
              size={15}
              color={showFavorites ? "#fff" : Colors.primary}
            />
            <Text style={[styles.chipText, showFavorites && styles.chipTextActive]}>
              Favorits
            </Text>
            {favoriteEvents.length > 0 && (
              <View style={[styles.favBadge, showFavorites && styles.favBadgeActive]}>
                <Text style={[styles.favBadgeText, showFavorites && styles.favBadgeTextActive]}>
                  {favoriteEvents.length}
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
              <Ionicons
                name="location"
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
                {f.icon && <FilterIcon icon={f.icon} color={iconColor} />}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {showFavorites ? (
        <AgendaList
          events={favoriteEvents}
          userCoords={userCoords}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          emptyText="Encara no tens cap acte preferit"
          emptyIcon="heart-outline"
        />
      ) : (
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
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            </View>
          )}
        />
      )}
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
  count: { color: Colors.textMuted, fontSize: 14 },
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
  },
  favBadgeTextActive: {
    color: "#fff",
  },
});
