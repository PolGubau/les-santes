import { Colors } from '@/shared/constants';
import { POSTERS } from '@/features/recursos';
import { Screen } from '@/shared/ui';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Download } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

export default function CartellDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const [saving, setSaving] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

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

  const handleSave = async () => {
    if (!poster.asset) return;
    setSaving(true);
    try {
      let perm = permissionResponse;
      if (!perm?.granted) perm = await requestPermission();
      if (!perm?.granted) {
        Alert.alert('Permís denegat', 'Cal accés a la galeria per desar la imatge.');
        return;
      }
      const [asset] = await Asset.loadAsync(poster.asset);
      const uri = asset.localUri ?? asset.uri;
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Desat!', `Cartell ${poster.year} desat a la galeria.`);
    } catch {
      Alert.alert('Error', "No s'ha pogut desar la imatge.");
    } finally {
      setSaving(false);
    }
  };

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
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Tornar"
          >
            <ArrowLeft size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.year}>{poster.year}</Text>
              <Text style={styles.titleLabel}>Cartell de Les Santes</Text>
            </View>

            {/* Save button */}
            {poster.asset && (
              <Pressable
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel={`Desar cartell ${poster.year}`}
              >
                <Download size={16} color="#fff" />
                <Text style={styles.saveBtnText}>
                  {saving ? 'Desant…' : 'Desa'}
                </Text>
              </Pressable>
            )}
          </View>

          {poster.author && (
            <Text style={styles.author}>{poster.author}</Text>
          )}

          {poster.description && (
            <Text style={styles.description}>{poster.description}</Text>
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
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  description: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textMuted, fontSize: 15 },
});
