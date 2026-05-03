import { POSTERS } from "@/features/recursos";
import type { PosterEntry } from "@/features/recursos";
import { Colors } from "@/shared/constants";
import { Screen, stripMarkdown } from "@/shared/ui";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowLeft, ImageOff } from "lucide-react-native";
import { memo, useCallback } from "react";
import {
  FlatList,
  type ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const CREDITS =
  "L'exposició ha estat organitzada pel Museu Arxiu de Santa Maria - Centre d'Estudis Locals de Mataró, amb el suport de la Fundació Iluro i la Direcció de Cultura de l'Ajuntament de Mataró. També hi han col·laborat l'Arxiu Comarcal del Maresme, Cabré Junqueras, Folgarona, MataróAudiovisual, Publicitat Fermalli, Ferreteria Colomer, Fustes Pram, Finques Pous, Copy-Rap, Avet-Set i Calçats Boixet.";

const THUMB_W = 80;
const THUMB_H = 108; // ~3:4 ratio

const CreditsFooter = memo(function CreditsFooter() {
  return (
    <View style={styles.credits}>
      <Text style={styles.creditsLabel}>Crèdits</Text>
      <Text style={styles.creditsText}>{CREDITS}</Text>
    </View>
  );
});

const PosterRow = memo(function PosterRow({
  poster,
  onPress,
}: { poster: PosterEntry; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Cartell ${poster.year}${poster.author ? `, ${poster.author}` : ""}`}
    >
      <View style={styles.thumb}>
        {poster.asset ? (
          <Image
            source={poster.asset}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
            transition={200}
          />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <ImageOff size={18} color={Colors.textDim} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.year}>{poster.year}</Text>
        {poster.author && (
          <Text style={styles.author} numberOfLines={1}>
            {poster.author}
          </Text>
        )}
        {poster.description && (
          <Text style={styles.desc} numberOfLines={2}>
            {stripMarkdown(poster.description)}
          </Text>
        )}
      </View>
    </Pressable>
  );
});

export default function CartellsScreen() {
  const renderItem: ListRenderItem<PosterEntry> = useCallback(
    ({ item }) => (
      <PosterRow
        poster={item}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({
            pathname: "/(tabs)/recursos/cartell/[id]",
            params: { id: item.id },
          });
        }}
      />
    ),
    [],
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Tornar"
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Cartells Oficials</Text>
          <Text style={styles.subtitle}>
            {POSTERS.length} cartells · festa major de Mataró
          </Text>
        </View>
      </View>

      <FlatList
        data={POSTERS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={<CreditsFooter />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerText: { flex: 1 },
  title: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  subtitle: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowPressed: { opacity: 0.6 },
  thumb: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    flexShrink: 0,
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, paddingTop: 2 },
  year: { color: Colors.text, fontSize: 20, fontWeight: "800", lineHeight: 24 },
  author: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },
  desc: { color: Colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  credits: {
    marginTop: 32,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  creditsLabel: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  creditsText: { color: Colors.textMuted, fontSize: 12, lineHeight: 19 },
});
