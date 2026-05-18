import { Colors } from '@/shared/constants';
import { Screen } from '@/shared/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const JULIANA_IMG = require('../../../assets/media/juliana.avif');

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={s.sectionHead}>
      <View style={s.sectionAccent} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return <View style={s.infoCard}>{children}</View>;
}

function StatChip({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.statChip}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function Ingredient({ text }: { text: string }) {
  return (
    <View style={s.ingredientRow}>
      <View style={s.ingredientDot} />
      <Text style={s.ingredientText}>{text}</Text>
    </View>
  );
}

export default function BegudesScreen() {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero ── */}
        <View style={s.heroWrap}>
          <Image source={JULIANA_IMG} contentFit="cover" style={s.heroImg} transition={400} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.82)']}
            locations={[0.25, 0.6, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={s.heroText} pointerEvents="none">
            <Text style={s.heroEyebrow}>La beguda de la Festa Major</Text>
            <Text style={s.heroTitle}>La Juliana</Text>
            <Text style={s.heroSub}>Únicament el 28 de juliol · des de 1995</Text>
          </View>
        </View>

        {/* ── Stats strip ── */}
        <View style={s.statRow}>
          <StatChip value="1995" label="Any de creació" />
          <View style={s.statDivider} />
          <StatChip value="1.000 L" label="Venuts per nit" />
          <View style={s.statDivider} />
          <StatChip value="6" label="Ingredients" />
        </View>

        {/* ── Sections ── */}
        <SectionTitle title="Què és la Juliana?" />
        <InfoCard>
          <Text style={s.body}>
            La Juliana és el combinat oficial de Les Santes. Allò que la fa única és la seva{' '}
            <Text style={s.bold}>exclusivitat absoluta</Text>: es prepara i es serveix{' '}
            <Text style={s.bold}>únicament una nit a l'any</Text>, el 28 de juliol, durant
            el Ball de Requisits de Festa Major.{'\n\n'}
            Va néixer als anys 90, inspirada en la barreja de begudes de La Patum de Berga.
            Una de les seves creadores és Tere Almar, tècnica de Cultura de l'Ajuntament.
            Durant anys la recepta va ser secreta; el 2015, pel 20è aniversari, es va publicar
            al programa oficial. Des de 2011 se'n venen fins a{' '}
            <Text style={s.bold}>1.000 litres en una sola nit</Text>.
          </Text>
        </InfoCard>

        <SectionTitle title="La Recepta" />
        <View style={s.recipeCard}>
          <Text style={s.recipeLabel}>Ingredients per a 1 got</Text>
          <View style={s.ingredients}>
            <Ingredient text="Granissat de maduixa" />
            <Ingredient text="Suc de taronja natural" />
            <Ingredient text="Cava" />
            <Ingredient text="Ginebra" />
            <Ingredient text="Rom" />
            <Ingredient text="Vodka" />
          </View>
          <View style={s.recipeNote}>
            <Text style={s.recipeNoteText}>
              La proporció exacta la revisa cada any l'equip de Cultura.
              Resultat: dolça, refrescant i amb una pujada sorprenentment ràpida.
            </Text>
          </View>
        </View>

        <SectionTitle title="La Llegenda" />
        <View style={s.quoteCard}>
          <Text style={s.quoteMark}>"</Text>
          <Text style={s.quoteText}>
            Aquella nit, aquell got, en aquell lloc i amb aquella gent —
            una experiència irrepetible fins l'any vinent.
          </Text>
          <Text style={s.quoteAttrib}>
            El nom honora Santa Juliana, copatrona de la ciutat. Beure la Juliana
            la nit del 28 és, per a molts, l'essència de ser mataroní.
          </Text>
        </View>

        <SectionTitle title="Altres begudes de la festa" />
        <InfoCard>
          <Text style={s.body}>
            <Text style={s.bold}>Cervesa artesana de Les Santes{'\n'}</Text>
            Alguns establiments elaboren cerveses específiques per a la Festa Major,
            sovint amb el nom de les Santes o del seguici festiu.{'\n\n'}
            <Text style={s.bold}>Vi del Maresme{'\n'}</Text>
            El blanc fresc i el rosat de la comarca acompanyen els sopars de festa
            als carrers del centre històric.{'\n\n'}
            <Text style={s.bold}>Les galetes de la Convidada{'\n'}</Text>
            La Família Robafaves convida tothom a vi i galetes a la plaça de Santa
            Anna la nit del 25.
          </Text>
        </InfoCard>

        <View style={s.footer}>
          <Text style={s.footerText}>Font: Programa oficial · Ajuntament de Mataró · 2015</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { paddingBottom: 56 },

  /* Hero */
  heroWrap: { height: 320, backgroundColor: Colors.text },
  heroImg: { ...StyleSheet.absoluteFillObject },
  heroText: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, gap: 4 },
  heroEyebrow: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2 },

  /* Stats */
  statRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, paddingVertical: 20 },
  statChip: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { color: Colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { color: Colors.textMuted, fontSize: 11, textAlign: 'center' },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: 4 },

  /* Sections */
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 28, paddingBottom: 10 },
  sectionAccent: { width: 3, height: 18, borderRadius: 2, backgroundColor: Colors.primary },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  infoCard: { marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 16, padding: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border },
  body: { color: Colors.text, fontSize: 15, lineHeight: 25 },
  bold: { fontWeight: '700' },

  /* Recipe */
  recipeCard: { marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border },
  recipeLabel: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12, color: Colors.textDim, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  ingredients: { gap: 0 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  ingredientDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  ingredientText: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  recipeNote: { margin: 12, padding: 14, backgroundColor: `${Colors.primary}0D`, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  recipeNoteText: { color: Colors.textMuted, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },

  /* Quote */
  quoteCard: { marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 16, padding: 20, gap: 10 },
  quoteMark: { color: Colors.primary, fontSize: 52, fontWeight: '900', lineHeight: 44, marginBottom: -4 },
  quoteText: { color: Colors.text, fontSize: 17, fontWeight: '600', lineHeight: 26, fontStyle: 'italic', letterSpacing: -0.2 },
  quoteAttrib: { color: Colors.textMuted, fontSize: 14, lineHeight: 22, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, paddingTop: 12 },

  /* Footer */
  footer: { marginHorizontal: 16, marginTop: 28, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  footerText: { color: Colors.textDim, fontSize: 11, lineHeight: 16, fontStyle: 'italic' },
});
