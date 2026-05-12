import { COMPARSES } from '@/features/recursos/data/comparses';
import type { ComparsaEntry } from '@/features/recursos/data/comparses';
import { Colors } from '@/shared/constants';
import { Screen, ScreenHeader } from '@/shared/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Flame } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

const CARD_H = 200;

function ComparsaCard({ comparsa }: { comparsa: ComparsaEntry }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.card, anim]}>
      {/* Hero image */}
      <Image
        source={comparsa.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />
      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.78)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Content */}
      <View style={styles.cardContent} pointerEvents="none">
        <View style={styles.cardTop}>
          {comparsa.isFire && (
            <View style={styles.fireBadge}>
              <Flame size={11} color="#fff" />
              <Text style={styles.fireBadgeText}>Foc</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBottom}>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardSince}>{comparsa.since}</Text>
            <Text style={styles.cardName}>{comparsa.name}</Text>
            <Text style={styles.cardType}>{comparsa.type}</Text>
          </View>
        </View>
      </View>
      {/* Pressable overlay */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => router.push(`/(tabs)/recursos/comparsa/${comparsa.id}` as never)}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 80 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
        accessibilityRole="button"
        accessibilityLabel={comparsa.name}
      />
    </Animated.View>
  );
}

export default function ComparsesScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Comparses"
        subtitle="El seguici festiu de Mataró"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Les comparses institucionals de Mataró formen part del patrimoni cultural de la ciutat.
          Más de 300 voluntaris fan possible la seva presència a Les Santes i altres celebracions.
        </Text>
        <View style={styles.list}>
          {COMPARSES.map((c) => (
            <ComparsaCard key={c.id} comparsa={c} />
          ))}
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Vols formar-ne part? Les colles obren llista d'espera periòdicament. Contacta amb la Direcció de Cultura de l'Ajuntament de Mataró.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  intro: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    paddingTop: 16,
    paddingBottom: 4,
  },
  list: { gap: 12 },
  card: {
    height: CARD_H,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.text,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12 },
      android: { elevation: 5 },
    }),
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  cardTop: { alignItems: 'flex-end' },
  fireBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(220,60,10,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  fireBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBottom: { flexDirection: 'row', alignItems: 'flex-end' },
  cardTextWrap: { flex: 1, gap: 1 },
  cardSince: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600' },
  cardName: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3, lineHeight: 24 },
  cardType: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 1 },
  footer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  footerText: { color: Colors.textMuted, fontSize: 13, lineHeight: 19 },
});
