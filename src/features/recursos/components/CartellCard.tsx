import { Colors } from '@/shared/constants';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { Download } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Cartell } from '../types';

interface Props {
  cartell: Cartell;
  width: number;
}

export function CartellCard({ cartell, width }: Props) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!cartell.asset) return;
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permís denegat', 'Cal accés a la galeria per desar la imatge.');
        return;
      }
      const [asset] = await Asset.loadAsync(cartell.asset);
      const uri = asset.localUri ?? asset.uri;
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Desat!', `Cartell ${cartell.year} desat a la galeria.`);
    } catch {
      Alert.alert('Error', 'No s\'ha pogut desar la imatge.');
    } finally {
      setSaving(false);
    }
  };

  const cardHeight = width * 1.4; // poster aspect ratio ~3:4

  return (
    <View style={[styles.card, { width, height: cardHeight }]}>
      {cartell.asset ? (
        <Image
          source={cartell.asset}
          placeholder={{ blurhash: cartell.blurhash }}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
          transition={300}
        />
      ) : (
        <View style={[styles.placeholder, { height: cardHeight }]}>
          <Text style={styles.placeholderYear}>{cartell.year}</Text>
          <Text style={styles.placeholderText}>Pròximament</Text>
        </View>
      )}

      {/* Year badge */}
      <View style={styles.yearBadge}>
        <Text style={styles.yearText}>{cartell.year}</Text>
      </View>

      {/* Save button */}
      {cartell.asset && (
        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityLabel={`Desar cartell ${cartell.year}`}
        >
          <Download size={14} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholderYear: { color: Colors.textDim, fontSize: 28, fontWeight: '700' },
  placeholderText: { color: Colors.textDim, fontSize: 11 },
  yearBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  yearText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  saveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
});
