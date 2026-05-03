import { PostalCard } from '@/features/recursos';
import { Screen, ScreenHeader } from '@/shared/ui';
import { useCallback, useMemo } from 'react';
import { FlatList, type ListRenderItem, StyleSheet, useWindowDimensions } from 'react-native';

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
      <ScreenHeader
        title="Postals de Gegants"
        subtitle={`${POSTALS.length} postals · geganters convidats`}
      />

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
  list: { paddingTop: 16, paddingBottom: 40, gap: 12 },
});
