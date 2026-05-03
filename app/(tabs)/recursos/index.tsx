import { POSTERS } from '@/features/recursos';
import { Colors } from '@/shared/constants';
import POSTALS from '@/shared/data/postals.json';
import { Screen } from '@/shared/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import type React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

/* ── Layout constants ── */
const CELL_SIZE = 72;
const MOSAIC_SIZE = CELL_SIZE * 2;

/* ── Static assets (Metro requires literal paths) ── */
const BANNER = require('../../../assets/media/posters-banner.avif');

const POSTAL_PREVIEWS: { key: string; src: number }[] = [
  { key: '2024', src: require('../../../assets/resources/postals/2024-c.avif') },
  { key: '2010', src: require('../../../assets/resources/postals/2010-d.avif') },
  { key: '1999', src: require('../../../assets/resources/postals/1999-d.avif') },
  { key: '1990', src: require('../../../assets/resources/postals/1990-c.avif') },
];

/* ── Screen ── */
export default function RecursosScreen() {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Recursos</Text>
          <Text style={styles.subtitle}>Arxiu històric de les Santes</Text>
        </View>

        <View style={styles.cards}>
          <HeroCard
            title="Cartells Oficials"
            subtitle="Pòsters oficials des de 1892"
            count={POSTERS.length}
            href="/(tabs)/recursos/cartells"
            renderVisual={() => (
              <Image source={BANNER} contentFit="cover" style={StyleSheet.absoluteFill} transition={300} />
            )}
          />

          <PostalsCard
            title="Postals de Gegants"
            subtitle="Escaneacions de geganters convidats"
            count={POSTALS.length}
            href="/(tabs)/recursos/postals"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

/* ── Hero card (banner image background) ── */
function HeroCard({
  title, subtitle, count, href, renderVisual,
}: {
  title: string; subtitle: string; count: number; href: string;
  renderVisual: () => React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.heroCard, anim]}>
      {renderVisual()}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.82)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.heroContent} pointerEvents="none">
        <View>
          <Text style={styles.heroLabel}>{count} peces</Text>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.heroCta}>
          <Text style={styles.heroCtaText}>Explorar</Text>
          <ArrowRight size={14} color="#fff" />
        </View>
      </View>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => router.push(href as never)}
        onPressIn={() => { scale.value = withTiming(0.975, { duration: 80 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 220 }); }}
        accessibilityRole="button"
        accessibilityLabel={title}
      />
    </Animated.View>
  );
}

/* ── Postals card (mosaic grid) ── */
function PostalsCard({
  title, subtitle, count, href,
}: {
  title: string; subtitle: string; count: number; href: string;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.postalsCard, anim]}>
      {/* Left: mosaic */}
      <View style={styles.mosaic} pointerEvents="none">
        {POSTAL_PREVIEWS.map(({ key, src }) => (
          <View key={key} style={styles.mosaicCell}>
            <Image source={src} contentFit="cover" style={{ width: CELL_SIZE, height: CELL_SIZE }} transition={200} />
          </View>
        ))}
      </View>

      {/* Right: text */}
      <View style={styles.postalsContent} pointerEvents="none">
        <View>
          <Text style={styles.postalsLabel}>{count} postals</Text>
          <Text style={styles.postalsTitle}>{title}</Text>
          <Text style={styles.postalsSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.postalsCta}>
          <Text style={styles.postalsCtaText}>Veure</Text>
          <ArrowRight size={13} color={Colors.primary} />
        </View>
      </View>

      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => router.push(href as never)}
        onPressIn={() => { scale.value = withTiming(0.975, { duration: 80 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 220 }); }}
        accessibilityRole="button"
        accessibilityLabel={title}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 48 },
  header: { paddingTop: 20, paddingBottom: 24 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 2 },
  cards: { gap: 14 },

  /* Hero card */
  heroCard: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.text,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    gap: 12,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  heroSubtitle: { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 2, lineHeight: 18 },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroCtaText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  /* Postals card */
  postalsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    minHeight: 160,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  mosaic: {
    width: MOSAIC_SIZE,
    height: MOSAIC_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexShrink: 0,
  },
  mosaicCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceHigh,
  },
  postalsContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  postalsLabel: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  postalsTitle: { color: Colors.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  postalsSubtitle: { color: Colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  postalsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  postalsCtaText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
});
