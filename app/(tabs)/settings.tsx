import { Colors, Typography } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { LOCALES, useLocaleStore, type AppLocale } from '@/shared/hooks/useLocale';
import { Screen } from '@/shared/ui';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ─── Build info ──────────────────────────────────────────────────────────────
const cfg = Constants.expoConfig;
const bundleId = Platform.OS === 'ios'
  ? cfg?.ios?.bundleIdentifier
  : cfg?.android?.package;

function envLabel(env: string): string {
  if (env === ExecutionEnvironment.StoreClient) return t('settings.envStoreClient');
  if (env === ExecutionEnvironment.Standalone) return t('settings.envStandalone');
  return t('settings.envBare');
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function SectionTitle({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function LocaleOption({ label, flag, active, onPress }: {
  code: AppLocale; label: string; flag: string; active: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.localeBtn, active && styles.localeBtnActive]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      accessibilityLabel={label}
    >
      <Text style={styles.localeFlag}>{flag}</Text>
      <Text style={[styles.localeLabel, active && styles.localeLabelActive]}>{label}</Text>
      {active && <View style={styles.localeDot} />}
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { locale, setLocale } = useLocaleStore();

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Language ────────────────────────────────────────────────────── */}
        <SectionTitle label={t('settings.language')} />
        <View style={styles.localeGroup}>
          {LOCALES.map((loc) => (
            <LocaleOption
              key={loc.code}
              {...loc}
              active={locale === loc.code}
              onPress={() => setLocale(loc.code)}
            />
          ))}
        </View>

        {/* ── App info ────────────────────────────────────────────────────── */}
        <SectionTitle label={t('settings.appInfo')} />
        <View style={styles.card}>
          <InfoRow label={t('settings.version')} value={cfg?.version ?? '—'} />
          <View style={styles.divider} />
          <InfoRow label={t('settings.environment')} value={envLabel(Constants.executionEnvironment)} />
          <View style={styles.divider} />
          <InfoRow label={t('settings.bundleId')} value={bundleId ?? '—'} />
        </View>

      </ScrollView>
    </Screen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: Colors.text,
    ...Typography.bold,
  },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textDim,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 4,
    ...Typography.bold,
  },
  localeGroup: { flexDirection: 'row', gap: 10 },
  localeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  localeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FDF0F2',
  },
  localeFlag: { fontSize: 20 },
  localeLabel: { flex: 1, fontSize: 15, color: Colors.textMuted, ...Typography.semiBold },
  localeLabelActive: { color: Colors.primary },
  localeDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowLabel: { fontSize: 14, color: Colors.text, ...Typography.regular },
  rowValue: { fontSize: 13, color: Colors.textMuted, ...Typography.regular },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginLeft: 16 },
});
