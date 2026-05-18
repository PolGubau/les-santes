import { POSTERS } from '@/features/recursos';
import { COMPARSES } from '@/features/recursos/data/comparses';
import { Colors } from '@/shared/constants';
import POSTALS from '@/shared/data/postals.json';
import { Screen } from '@/shared/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

/* ── Static assets (Metro requires literal paths) ── */
const BANNER = require('../../../assets/media/posters-banner.avif');
const ALIGA = require('../../../assets/media/comparses/aliga.avif');
const ROBAFAVES = require('../../../assets/media/comparses/familia-robafabes.avif');
const JULIANA = require('../../../assets/media/juliana.avif');
const POSTAL = require('../../../assets/resources/postals/2024-c.avif');

/* ── Single card component for all resources ── */
function ResourceCard({
  imageSource, label, title, subtitle, href, height = 200, flex,
}: {
  imageSource: number; label?: string; title: string; subtitle?: string;
  href: string; height?: number; flex?: number;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[s.card, { height, flex }, anim]}>
      <Image source={imageSource} contentFit="cover" style={StyleSheet.absoluteFill} transition={300} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.94)']}
        locations={[0.1, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={s.cardContent} pointerEvents="none">
        {label && <Text style={s.cardLabel}>{label}</Text>}
        <Text style={s.cardTitle}>{title}</Text>
        {subtitle && <Text style={s.cardSubtitle}>{subtitle}</Text>}
        <View style={s.cardCta}>
          <Text style={s.cardCtaText}>Explorar</Text>
          <ArrowRight size={13} color="#fff" />
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

/* ── Screen ── */
export default function RecursosScreen() {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.title}>Recursos</Text>
          <Text style={s.subtitle}>Arxiu de les Santes</Text>
        </View>
        <View style={s.cards}>
          <ResourceCard
            imageSource={BANNER}
            label={`${POSTERS.length} peces`}
            title="Cartells Oficials"
            subtitle="Pòsters des de 1892"
            href="/(tabs)/recursos/cartells"
            height={220}
          />
          <ResourceCard
            imageSource={ALIGA}
            label="Guia cultural"
            title="Història de la Festa"
            subtitle="Patrones, comparses, tradicions i el Bequetero"
            href="/(tabs)/recursos/historia"
            height={160}
          />
          <ResourceCard
            imageSource={POSTAL}
            label={`${POSTALS.length} postals`}
            title="Postals de Gegants"
            subtitle="Escaneacions de geganters convidats"
            href="/(tabs)/recursos/postals"
            height={160}
          />
          <View style={s.row}>
            <ResourceCard
              imageSource={ROBAFAVES}
              label={`${COMPARSES.length} colles`}
              title="Comparses"
              href="/(tabs)/recursos/comparses"
              height={180}
              flex={1}
            />
            <ResourceCard
              imageSource={JULIANA}
              label="La Juliana i més"
              title="Begudes"
              href="/(tabs)/recursos/begudes"
              height={180}
              flex={1}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
const s = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 48 },
  header: { paddingTop: 20, paddingBottom: 24 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 2 },
  cards: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },

  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.text,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  cardContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 18, gap: 2,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardTitle: {
    color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18, marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardCta: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  cardCtaText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
