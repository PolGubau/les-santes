import { Colors } from '@/shared/constants';
import { Screen, ScreenHeader } from '@/shared/ui';
import { Beer, BookOpen, Cherry, Citrus, ClipboardList, FlaskConical, Lightbulb, Sparkles, Wine } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionIconWrap}>{icon}</View>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return <View style={s.infoCard}>{children}</View>;
}

function IngredientRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={s.ingredientRow}>
      <View style={s.ingredientIcon}>{icon}</View>
      <Text style={s.ingredientText}>{text}</Text>
    </View>
  );
}

export default function BegudesScreen() {
  return (
    <Screen>
      <ScreenHeader title="Begudes" subtitle="Les Santes de Mataró" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIconWrap}>
            <Wine size={40} color={Colors.primary} />
          </View>
          <Text style={s.heroTitle}>La Juliana</Text>
          <Text style={s.heroSub}>La beguda exclusiva de les Santes</Text>
        </View>

        <SectionTitle icon={<Sparkles size={18} color={Colors.primary} />} title="Què és la Juliana?" />
        <InfoCard>
          <Text style={s.body}>
            La Juliana és el combinat oficial de Les Santes, i allò que la fa especialment especial és la seva
            <Text style={s.bold}> exclusivitat absoluta</Text>: es prepara i es serveix{' '}
            <Text style={s.bold}>únicament una nit a l'any</Text>, el 28 de juliol, durant el Ball de Requisits de Festa Major.{'\n\n'}
            Va néixer als anys 90, inspirada en la barreja de begudes que es fan a La Patum de Berga. Una de les seves creadores és Tere Almar, tècnica de Cultura de l'Ajuntament, que va voler crear una beguda que fos tan única i irrepetible com la pròpia festa.{'\n\n'}
            Durant anys, la recepta va ser un secret celosament guardat. El 2015, pel 20è aniversari de la Juliana, es va decidir fer-la pública al programa oficial de la festa. Des de 2011, se'n venen fins a{' '}
            <Text style={s.bold}>1.000 litres en una sola nit</Text>.
          </Text>
        </InfoCard>

        <SectionTitle icon={<ClipboardList size={18} color={Colors.primary} />} title="La Recepta" />
        <View style={s.recipeCard}>
          <Text style={s.recipeTitle}>Ingredients per a 1 got</Text>
          <View style={s.ingredients}>
            <IngredientRow icon={<Cherry size={18} color={Colors.primary} />} text="Granissat de maduixa" />
            <IngredientRow icon={<Citrus size={18} color={Colors.primary} />} text="Suc de taronja natural" />
            <IngredientRow icon={<Wine size={18} color={Colors.primary} />} text="Cava" />
            <IngredientRow icon={<FlaskConical size={18} color={Colors.primary} />} text="Ginebra" />
            <IngredientRow icon={<FlaskConical size={18} color={Colors.primary} />} text="Rom" />
            <IngredientRow icon={<FlaskConical size={18} color={Colors.primary} />} text="Vodka" />
          </View>
          <View style={s.recipeDivider} />
          <View style={s.recipeNoteRow}>
            <Lightbulb size={14} color={Colors.textDim} />
            <Text style={s.recipeNote}>
              La proporció exacta segueix sent un secret que cada any revisa l'equip de Cultura. El resultat: dolç, refrescant i amb una pujada al cap sorprenentment ràpida.
            </Text>
          </View>
        </View>

        <SectionTitle icon={<BookOpen size={18} color={Colors.primary} />} title="La Llegenda" />
        <InfoCard>
          <Text style={s.body}>
            La Juliana és una beguda que molts mataronins esperen tot l'any. La seva exclusivitat és part del mite: saber que aquella nit, aquell got, en aquell lloc i amb aquella gent és una experiència irrepetible fins l'any vinent.{'\n\n'}
            El nom, evidentment, honora Santa Juliana, copatronaessen de la ciutat. Beure la Juliana durant la nit del 28 és per a molts l'essència de ser mataroní.
          </Text>
        </InfoCard>

        <SectionTitle icon={<Beer size={18} color={Colors.primary} />} title="Altres begudes de la festa" />
        <InfoCard>
          <Text style={s.body}>
            <Text style={s.bold}>La cervesa artesana de Les Santes</Text>{'\n'}
            Des de fa uns anys, alguns establiments de Mataró elaboren cerveses artesanes específiques per a la Festa Major, sovint amb el nom de les Santes o dels elements del seguici festiu.{'\n\n'}
            <Text style={s.bold}>El vi del Maresme</Text>{'\n'}
            La comarca del Maresme té una llarga tradició vinícula. Els vins locals —especialment el vi blanc fresc i el rosat— acompanyen els sopars de festa major als carrers del centre histó.{'\n\n'}
            <Text style={s.bold}>Les galetes de les Santes</Text>{'\n'}
            No és una beguda, però no pot faltar: la Convidada de la Família Robafaves inclou vi i galetes per a tothom a la plaça de Santa Anna la nit del 25.
          </Text>
        </InfoCard>

        <View style={s.footer}>
          <Text style={s.footerText}>Font: Programa oficial de Les Santes 2015 · Ajuntament de Mataró</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { paddingBottom: 48 },
  hero: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20, backgroundColor: Colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, gap: 8 },
  heroIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: `${Colors.primary}12`, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroTitle: { color: Colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  heroSub: { color: Colors.textMuted, fontSize: 15, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  sectionIconWrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  infoCard: { marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border },
  body: { color: Colors.text, fontSize: 15, lineHeight: 24 },
  bold: { fontWeight: '700' },
  recipeCard: { marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border, gap: 12 },
  recipeTitle: { color: Colors.textDim, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  ingredients: { gap: 8 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ingredientIcon: { width: 28, alignItems: 'center' },
  ingredientText: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  recipeDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  recipeNoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  recipeNote: { flex: 1, color: Colors.textMuted, fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
  footer: { marginHorizontal: 16, marginTop: 24, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  footerText: { color: Colors.textDim, fontSize: 11, lineHeight: 16, fontStyle: 'italic' },
});
