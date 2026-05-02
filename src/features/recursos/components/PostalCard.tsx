import { POSTAL_ASSETS } from '@/entities/postal';
import { Colors } from '@/shared/constants';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { ChevronLeft, ChevronRight, Download, ImageOff } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Postal } from '../types';

interface Props {
  postal: Postal;
  width: number;
}

const DEFAULT_BH = 'L6B;DR-;IU?bx]t7t7WB-;_3t7WB';

async function saveAsset(moduleId: number) {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permís denegat', 'Cal donar permís per accedir a la galeria.');
    return;
  }
  const asset = await Asset.fromModule(moduleId).downloadAsync();
  if (!asset.localUri) throw new Error('No localUri');
  await MediaLibrary.saveToLibraryAsync(asset.localUri);
}

export function PostalCard({ postal, width }: Props) {
  const [showDors, setShowDors] = useState(false);
  const [saving, setSaving] = useState(false);

  const cardHeight = width * 0.68;
  const assets = POSTAL_ASSETS[postal.id];
  const activeModule = showDors ? assets?.back : (assets?.front ?? assets?.back);
  const hasFront = Boolean(assets?.front);
  const hasBack = Boolean(assets?.back);

  const handleSave = async () => {
    if (!activeModule) return;
    setSaving(true);
    try {
      await saveAsset(activeModule);
      Alert.alert('Guardat!', `Postal ${postal.year} guardada a la galeria.`);
    } catch {
      Alert.alert('Error', "No s'ha pogut guardar la imatge.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.card, { width, height: cardHeight + 56 }]}>
      {/* Image area */}
      <View style={[styles.imageArea, { height: cardHeight }]}>
        {activeModule ? (
          <Image
            source={activeModule}
            placeholder={{ blurhash: DEFAULT_BH }}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
            transition={250}
          />
        ) : (
          <View style={styles.placeholder}>
            <ImageOff size={28} color={Colors.textDim} />
            <Text style={styles.placeholderText}>
              {postal.year} — {showDors ? 'Dors' : 'Cara'}
            </Text>
            <Text style={styles.placeholderSub}>Imatge no disponible</Text>
          </View>
        )}

        {/* Side badge */}
        <View style={styles.sideBadge}>
          <Text style={styles.sideBadgeText}>{showDors ? 'Dors' : 'Cara'}</Text>
        </View>
      </View>

      {/* Info + flip controls */}
      <View style={styles.footer}>
        <View style={styles.meta}>
          <Text style={styles.year}>{postal.year}</Text>
          <Text style={styles.city} numberOfLines={1}>{postal.city}</Text>
        </View>
        <View style={styles.flipControls}>
          {hasFront && (
            <Pressable
              style={[styles.flipBtn, !showDors && styles.flipBtnActive]}
              onPress={() => setShowDors(false)}
              accessibilityLabel="Veure cara"
            >
              <ChevronLeft size={14} color={!showDors ? '#fff' : Colors.textDim} />
              <Text style={[styles.flipLabel, !showDors && styles.flipLabelActive]}>Cara</Text>
            </Pressable>
          )}
          {hasBack && (
            <Pressable
              style={[styles.flipBtn, showDors && styles.flipBtnActive]}
              onPress={() => setShowDors(true)}
              accessibilityLabel="Veure dors"
            >
              <Text style={[styles.flipLabel, showDors && styles.flipLabelActive]}>Dors</Text>
              <ChevronRight size={14} color={showDors ? '#fff' : Colors.textDim} />
            </Pressable>
          )}
          {activeModule && (
            <Pressable
              style={[styles.flipBtn, saving && styles.flipBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              accessibilityLabel="Guardar a galeria"
            >
              <Download size={14} color={Colors.textDim} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageArea: { position: 'relative' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceHigh,
  },
  placeholderText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  placeholderSub: { color: Colors.textDim, fontSize: 11 },
  sideBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  sideBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 56,
  },
  meta: { flex: 1, marginRight: 8 },
  year: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  city: { color: Colors.text, fontSize: 13, fontWeight: '600', marginTop: 1 },
  flipControls: { flexDirection: 'row', gap: 4 },
  flipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flipBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  flipBtnDisabled: { opacity: 0.4 },
  flipLabel: { color: Colors.textDim, fontSize: 11, fontWeight: '600' },
  flipLabelActive: { color: '#fff' },
});
