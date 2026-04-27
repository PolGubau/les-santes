import type { EventType } from "@/entities/event";
import { MOCK_EVENTS } from "@/entities/event";
import { AgendaList, useAgenda } from "@/features/agenda";
import { Colors } from "@/shared/constants";
import { Screen } from "@/shared/ui";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type React from "react";
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
      icon: { lib: "Ionicons", name: "musical-notes" },
    },
    {
      label: "Cercavila",
      value: "cercavila",
      icon: { lib: "MaterialCommunityIcons", name: "music" },
    },
    {
      label: "Gegants",
      value: "gegants",
      icon: { lib: "MaterialCommunityIcons", name: "crown" },
    },
    {
      label: "Teatre",
      value: "teatre",
      icon: { lib: "Ionicons", name: "ticket" },
    },
  ];

export default function AgendaScreen() {
  const { filtered, filters, setType } = useAgenda(MOCK_EVENTS);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.count}>{filtered.length} actes</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {TYPE_FILTERS.map((f) => {
          const active = filters.type === f.value;
          const iconColor = active ? "#fff" : Colors.textMuted;
          return (
            <Pressable
              key={f.label}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setType(f.value)}
            >
              {f.icon && f.icon.lib === "MaterialCommunityIcons" && (
                <MaterialCommunityIcons
                  name={f.icon.name}
                  size={14}
                  color={iconColor}
                />
              )}
              {f.icon && f.icon.lib === "Ionicons" && (
                <Ionicons name={f.icon.name} size={14} color={iconColor} />
              )}
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <AgendaList events={filtered} />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { color: Colors.textMuted, fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "700" },
});
