import { PostalCard } from '@/features/recursos';
import { Colors } from '@/shared/constants';
import { Screen } from '@/shared/ui';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { FlatList, type ListRenderItem, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { Postal } from '@/features/recursos/types';
import POSTALS_RAW from '@/shared/data/postals.json';

const PADDING = 16;
const POSTALS = [...POSTALS_RAW].reverse() as Postal[];

export default function PostalsScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = useMemo(() => width - PADDING * 2, [width]);

  const renderItem: ListRenderItem<Postal> = useCallback(
    ({ item }) => <PostalCard postal={item} width={cardWidth} />,
    [cardWidth],
  );

  return (
    <Screen>
      {/* Header */}
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
          <Text style={styles.title}>Postals de Gegants</Text>
          <Text style={styles.subtitle}>
            {POSTALS.length} postals · geganters convidats
          </Text>
        </View>
      </View>

      <FlatList
        data={POSTALS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingHorizontal: PADDING }]}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: PADDING,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  subtitle: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  list: { paddingTop: 16, paddingBottom: 40, gap: 12 },
});
