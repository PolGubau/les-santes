import type { EventType } from "@/entities/event";
import { MOCK_EVENTS } from "@/entities/event";
import { AgendaList, DayPicker, useAgenda } from "@/features/agenda";
import { Colors } from "@/shared/constants";
import { useUserLocation } from "@/shared/hooks";
import { Screen } from "@/shared/ui";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type React from "react";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type FilterIconDef =
  | { lib: "Ionicons"; name: React.ComponentProps<typeof Ionicons>["name"] }
  | {
    lib: "MaterialCommunityIcons";
    name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  };

const TYPE_FILTERS: Array<{
  label: string;
  value: EventType | undefined;
  icon?: FilterIconDef;
}> = [
    { label: "Tots", value: undefined },
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
  const [refreshing, setRefreshing] = useState(false);
  const userCoords = useUserLocation();
  const {
    filtered,
    filters,
    setType,
    toggleNearMe,
    selectedDay,
    availableDays,
    todayKey,
    setDay,
  } = useAgenda(MOCK_EVENTS, userCoords);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a data reload — replace with real fetch when API is ready
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <Screen>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <Text style={styles.title}>Agenda</Text>
          <Text style={styles.count}>{filtered.length} actes</Text>
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
                onPress={() => setType(f.value)}
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

      <AgendaList events={filtered} userCoords={userCoords} onRefresh={handleRefresh} refreshing={refreshing} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topSection: {
    flexShrink: 0,
  },
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
});
