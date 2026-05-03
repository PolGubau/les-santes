import { POSTAL_ASSETS } from '@/entities/postal';
import { Colors } from '@/shared/constants';
import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { ChevronLeft, ChevronRight, Download, ImageOff, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, Modal, Pressable, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import type { Postal } from '../types';

interface Props {
  postal: Postal;
  width: number;
}

const DEFAULT_BH = 'L6B;DR-;IU?bx]t7t7WB-;_3t7WB';

const SWIPE_THRESHOLD = 60;
const RUBBER_BAND_FACTOR = 0.25;

export function PostalCard({ postal, width }: Props) {
  const [showDors, setShowDors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({ granularPermissions: ['photo'] });
  const { width: screenW, height: screenH } = useWindowDimensions();

  const cardHeight = width * 0.68;
  const assets = POSTAL_ASSETS[postal.id];
  const activeModule = showDors ? assets?.back : (assets?.front ?? assets?.back);
  const hasFront = Boolean(assets?.front);
  const hasBack = Boolean(assets?.back);

  const dragX = useSharedValue(0);

  const flipToBack = useCallback(() => {
    setShowDors(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const flipToFront = useCallback(() => {
    setShowDors(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const openLightbox = useCallback(() => setLightbox(true), []);

  // Animated style: translate the image area horizontally
  const imageAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }));

  const tap = Gesture.Tap()
    .maxDistance(8)
    .onEnd(() => { 'worklet'; runOnJS(openLightbox)(); });

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-8, 8])
    .onUpdate((e) => {
      'worklet';
      const dx = e.translationX;
      // Apply rubber-band resistance at the limits:
      // dragging left when on cara (no previous) or dragging right when on dors (no next)
      const atLeftEdge = !showDors;
      const atRightEdge = showDors;

      if ((dx < 0 && atRightEdge) || (dx > 0 && atLeftEdge)) {
        // Rubberband: resist motion that goes "out of bounds"
        dragX.value = dx * RUBBER_BAND_FACTOR;
      } else {
        dragX.value = dx;
      }
    })
    .onEnd((e) => {
      'worklet';
      const dx = e.translationX;
      const vx = e.velocityX;
      const isFlick = Math.abs(vx) > 400;

      if ((dx < -SWIPE_THRESHOLD || (isFlick && vx < 0)) && !showDors && hasBack) {
        // Swipe left → show dors
        dragX.value = withTiming(-width, { duration: 160 }, () => {
          dragX.value = width;
          runOnJS(flipToBack)();
          dragX.value = withSpring(0, { damping: 20, stiffness: 200 });
        });
      } else if ((dx > SWIPE_THRESHOLD || (isFlick && vx > 0)) && showDors && hasFront) {
        // Swipe right → show cara
        dragX.value = withTiming(width, { duration: 160 }, () => {
          dragX.value = -width;
          runOnJS(flipToFront)();
          dragX.value = withSpring(0, { damping: 20, stiffness: 200 });
        });
      } else {
        // Snap back
        dragX.value = withSpring(0, { damping: 18, stiffness: 250 });
      }
    });

  const handleSave = async () => {
    if (!activeModule) return;
    setSaving(true);
    try {
      let perm = permissionResponse;
      if (!perm?.granted) perm = await requestPermission();
      if (!perm?.granted) {
        Alert.alert('Permís denegat', 'Cal accés a la galeria per guardar la imatge.');
        return;
      }
      const [asset] = await Asset.loadAsync(activeModule);
      const uri = asset.localUri ?? asset.uri;
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Guardat!', `Postal ${postal.year} guardada a la galeria.`);
    } catch {
      Alert.alert('Error', "No s'ha pogut guardar la imatge.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.card, { width, height: cardHeight + 56 }]}>
      {/* ── Lightbox modal ── */}
      {activeModule && (
        <Modal
          visible={lightbox}
          transparent
          statusBarTranslucent
          animationType="fade"
          onRequestClose={() => setLightbox(false)}
        >
          <StatusBar hidden />
          <Pressable style={styles.lbBackdrop} onPress={() => setLightbox(false)}>
            <Image
              source={activeModule}
              contentFit="contain"
              style={{ width: screenW, height: screenH }}
            />
          </Pressable>
          <Pressable style={styles.lbClose} onPress={() => setLightbox(false)} hitSlop={12}>
            <X size={20} color="#fff" />
          </Pressable>
        </Modal>
      )}

      {/* Image area — wrapped in GestureDetector for swipe-to-flip + tap to lightbox */}
      <GestureDetector gesture={Gesture.Race(tap, pan)}>
        <View style={[styles.imageArea, { height: cardHeight }]}>
          <Animated.View style={[StyleSheet.absoluteFill, imageAnimStyle]}>
            {activeModule ? (
              <Image
                source={activeModule}
                placeholder={{ blurhash: DEFAULT_BH }}
                contentFit="cover"
                contentPosition="top"
                style={StyleSheet.absoluteFill}
                transition={200}
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
          </Animated.View>

          {/* Side badge */}
          <View style={styles.sideBadge}>
            <Text style={styles.sideBadgeText}>{showDors ? 'Dors' : 'Cara'}</Text>
          </View>

          {/* Swipe hint dots — only when both sides exist */}
          {hasFront && hasBack && (
            <View style={styles.dots}>
              <View style={[styles.dot, !showDors && styles.dotActive]} />
              <View style={[styles.dot, showDors && styles.dotActive]} />
            </View>
          )}
        </View>
      </GestureDetector>

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
  dots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: 14,
  },
  /* Lightbox */
  lbBackdrop: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbClose: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
