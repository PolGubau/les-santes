import { POSTERS } from '@/features/recursos';
import { Colors } from '@/shared/constants';
import { BackButton, RichText, Screen } from '@/shared/ui';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartellDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const poster = POSTERS.find((p) => p.id === id);

  if (!poster) {
    return (
      <Screen>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Cartell no trobat.</Text>
        </View>
      </Screen>
    );
  }

  const imageHeight = width * 1.4; // ~3:4 poster ratio

  return (
    <Screen safe={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero image */}
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          {poster.asset ? (
            <Image
              source={poster.asset}
              contentFit="contain"
              style={StyleSheet.absoluteFill}
              transition={300}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderYear}>{poster.year}</Text>
              <Text style={styles.placeholderText}>Imatge no disponible</Text>
            </View>
          )}

          {/* Back button overlay */}
          <BackButton
            variant="overlay"
            style={{ position: 'absolute', top: insets.top + 12, left: 16 }}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.year}>{poster.year}</Text>
              <Text style={styles.titleLabel}>Cartell de Les Santes</Text>
            </View>
          </View>

          {poster.author && (
            <Text style={styles.author}>{poster.author}</Text>
          )}

          {poster.description && (
            <View style={styles.descriptionContainer}>
              <RichText content={poster.description} />
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48 },
  imageContainer: {
    width: '100%',
    backgroundColor: Colors.surface,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderYear: { color: Colors.textDim, fontSize: 40, fontWeight: '800' },
  placeholderText: { color: Colors.textDim, fontSize: 13 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: { flex: 1 },
  year: { color: Colors.text, fontSize: 36, fontWeight: '800', lineHeight: 40 },
  titleLabel: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  author: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  descriptionContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textMuted, fontSize: 15 },
});
