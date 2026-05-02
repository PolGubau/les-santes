import { Colors } from '@/shared/constants';
import { PostalCard } from '@/features/recursos';
import { Screen } from '@/shared/ui';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import POSTALS from '@/shared/data/postals.json';

const PADDING = 16;

export default function PostalsScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = width - PADDING * 2;

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

      {/* List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingHorizontal: PADDING }]}
      >
        {[...POSTALS].reverse().map((p) => (
          <PostalCard key={p.id} postal={p} width={cardWidth} />
        ))}
      </ScrollView>
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
