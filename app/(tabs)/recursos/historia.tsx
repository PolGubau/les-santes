import { Colors } from '@/shared/constants';
import { Screen, ScreenHeader } from '@/shared/ui';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const DIES = [
  { day: '25 jul', emoji: '🌙', nom: 'La Nit Boja', desc: "Desvetllament Bellugós (gegants per La Riera), Escapada a Negra Nit (correfoc) i La Ruixada: milers de persones banyades sota la música en directe." },
  { day: '26 jul', emoji: '🔔', nom: 'La Barram', desc: "Concert de campanes a la Basílica de Santa Maria. Set campanes — la Juliana, la Semproniana i cinc més — sonen trenta minuts anunciant la vigília." },
  { day: '27 jul', emoji: '⭐', nom: 'El Dia Gran', desc: "Festiu a Mataró. Les Matinades anuncien l'alba amb grallers. La Missa de Glòria de Manuel Blanch (1848). A la nit, el gran Castell de Focs." },
  { day: '28 jul', emoji: '💃', nom: 'El Ball de Requisits', desc: "La nit del Ball de Requisits i La Juliana, la beguda exclusiva. Acaba amb el No n'hi ha prou!: totes les comparses juntes ben entrada la matinada." },
  { day: '29 jul', emoji: '🎆', nom: 'El Comiat', desc: "L'Anem a Tancar porta les comparses per última vegada. Tronada de Fi de Festa, Espetec final i L'Albada tanquen el cercle fins l'any vinent." },
];

function SectionTitle({ emoji, title }: { emoji: string; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionEmoji}>{emoji}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return <View style={s.infoCard}>{children}</View>;
}

export default function HistoriaScreen() {
  return (
    <Screen>
      <ScreenHeader title="Història" subtitle="Les Santes de Mataró" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <View style={s.hero}>
          <Text style={s.heroTitle}>Les Santes</Text>
          <Text style={s.heroSub}>Festa Major de Mataró · 25–29 de juliol</Text>
          <Text style={s.heroBadge}>🏅 Festa Patrimonial d'Interès Nacional des del 2010</Text>
        </View>

        <SectionTitle emoji="⛪" title="Les Patrones" />
        <InfoCard>
          <Text style={s.body}>
            Santa Juliana i Santa Semproniana van néixer a <Text style={s.bold}>Iluro</Text> —l'antiga Mataró— al darrer quart del segle II. Deixebles de sant Cugat, van ser martiritzades l'any 304 a Sant Cugat del Vallès mentre enterraven el cos del sant.{'\n\n'}
            L'any <Text style={s.bold}>1772</Text>, fruit d'un estudi del frare Joan Gaspart Roig i Jalpí, van arribar les relíquies a Mataró en una urna d'argent que es treu a la processó cada any. El 1852, el papa Pius IX les va proclamar <Text style={s.bold}>patrones de la ciutat</Text>.
          </Text>
        </InfoCard>

        <SectionTitle emoji="🎉" title="La Refundació (1979)" />
        <InfoCard>
          <Text style={s.body}>
            La festa tal com la coneixem avui va néixer el <Text style={s.bold}>1979</Text>, quan un grup de joves del Foment Mataroní van llançar el repte: <Text style={s.italic}>"Les Santes: fem-ne festa major"</Text>.{'\n\n'}
            Era la transició democràtica. L'objectiu era reconquerir els carrers i la identitat festiva de la ciutat. Van recuperar les comparses, van fer els portadors de gegants voluntaris i van crear la primera Momerota. La festa va créixer any rere any.{'\n\n'}
            El <Text style={s.bold}>2010</Text>, la Generalitat de Catalunya la va declarar <Text style={s.bold}>Festa Patrimonial d'Interès Nacional</Text> —el reconeixement màxim— al costat de Santa Tecla de Tarragona i La Patum de Berga.
          </Text>
        </InfoCard>

        <SectionTitle emoji="📅" title="La Setmana de Festa" />
        <View style={s.dayList}>
          {DIES.map((d) => (
            <View key={d.day} style={s.dayRow}>
              <View style={s.dayBadge}>
                <Text style={s.dayEmoji}>{d.emoji}</Text>
                <Text style={s.dayDate}>{d.day}</Text>
              </View>
              <View style={s.dayContent}>
                <Text style={s.dayName}>{d.nom}</Text>
                <Text style={s.dayDesc}>{d.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <SectionTitle emoji="😴" title="La Dormida" />
        <InfoCard>
          <Text style={s.body}>
            Al final de cada gran acte, les comparses fan la <Text style={s.bold}>Dormida</Text>: entren una rere l'altra a l'Ajuntament, fan els seus balls propis davant del públic i es retiren fins a la pròxima sortida.{'\n\n'}
            La Dormida del 27 a la tarda és la més especial: les figures van entrant de manera individual, cadascuna amb la seva música i el seu ball. Un dels moments més emotius per als mataronins.
          </Text>
        </InfoCard>

        <View style={s.footer}>
          <Text style={s.footerText}>Fonts: Wikipedia/Viquipèdia · lessantes.cat · Generalitat de Catalunya (Patrimoni Festiu) · Museu Arxiu de Santa Maria de Mataró</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { paddingBottom: 48 },
  hero: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24, gap: 4 },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  heroBadge: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  infoCard: { marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border },
  body: { color: Colors.text, fontSize: 15, lineHeight: 24 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  dayList: { marginHorizontal: 16, gap: 8 },
  dayRow: { flexDirection: 'row', gap: 12, backgroundColor: Colors.surface, borderRadius: 14, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border, alignItems: 'flex-start' },
  dayBadge: { alignItems: 'center', gap: 2, width: 46, flexShrink: 0 },
  dayEmoji: { fontSize: 22 },
  dayDate: { color: Colors.primary, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  dayContent: { flex: 1, gap: 3 },
  dayName: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  dayDesc: { color: Colors.textMuted, fontSize: 12, lineHeight: 18 },
  footer: { marginHorizontal: 16, marginTop: 24, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  footerText: { color: Colors.textDim, fontSize: 11, lineHeight: 16, fontStyle: 'italic' },
});
