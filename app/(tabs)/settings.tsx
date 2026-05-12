import { Colors, Typography } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { LOCALES, useLocaleStore, type AppLocale } from '@/shared/hooks/useLocale';
import { cancelEventNotification, getScheduledEventNotifications, type ScheduledEventNotification } from '@/shared/lib/notifications';
import { Screen } from '@/shared/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { Bell, BellOff } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const EVENTS_CACHE_KEY = '@les-santes/events-v1';
const PRIVACY_POLICY_URL = `${SITE_URL}/privacy';

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

function ActionRow({ label, onPress, destructive }: { label: string; onPress: () => void; destructive?: boolean }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.rowLabel, destructive && { color: '#E53E3E' }]}>{label}</Text>
    </TouchableOpacity>
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
      <Text style={[styles.localeLabel, active && styles.localeLabelActive]}>{label}</Text>
      {active && <View style={styles.localeDot} />}
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { locale, setLocale } = useLocaleStore();
  const [scheduledNotifs, setScheduledNotifs] = useState<ScheduledEventNotification[]>([]);

  // Load scheduled notifications when screen mounts
  useEffect(() => {
    getScheduledEventNotifications().then(setScheduledNotifs).catch(() => { });
  }, []);

  const handleCancelNotif = useCallback((eventId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cancelEventNotification(eventId).then(() => {
      setScheduledNotifs((prev) => prev.filter((n) => n.eventId !== eventId));
    }).catch(() => { });
  }, []);

  const handleNotifications = () => Linking.openSettings();

  const handleClearCache = () => {
    Alert.alert(
      t('settings.clearCache'),
      t('settings.clearCacheConfirm'),
      [
        { text: 'Cancel·la', style: 'cancel' },
        {
          text: t('settings.clearCache'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(EVENTS_CACHE_KEY);
            Alert.alert(t('settings.clearCacheSuccess'));
          },
        },
      ],
    );
  };

  const handlePrivacyPolicy = () => Linking.openURL(PRIVACY_POLICY_URL);

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

        {/* ── Notifications ───────────────────────────────────────────────── */}
        <SectionTitle label={t('settings.notifications')} />
        <View style={styles.card}>
          <ActionRow label={t('settings.openNotificationSettings')} onPress={handleNotifications} />
        </View>

        {/* Scheduled event notifications */}
        {scheduledNotifs.length > 0 && (
          <>
            <SectionTitle label="Actes amb recordatori" />
            <View style={styles.card}>
              {scheduledNotifs.map((notif, idx) => (
                <React.Fragment key={notif.eventId}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.notifRow}>
                    <Bell size={16} color={Colors.primary} style={{ flexShrink: 0 }} />
                    <Text style={styles.notifText} numberOfLines={2}>{notif.title}</Text>
                    <TouchableOpacity
                      onPress={() => handleCancelNotif(notif.eventId)}
                      hitSlop={10}
                      accessibilityLabel="Cancel·lar recordatori"
                    >
                      <BellOff size={18} color={Colors.textDim} />
                    </TouchableOpacity>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </>
        )}

        {/* ── Cache ───────────────────────────────────────────────────────── */}
        <SectionTitle label="Dades" />
        <View style={styles.card}>
          <ActionRow label={t('settings.clearCache')} onPress={handleClearCache} destructive />
        </View>

        {/* ── Links ───────────────────────────────────────────────────────── */}
        <SectionTitle label={t('settings.links')} />
        <View style={styles.card}>
          <ActionRow label={t('settings.privacyPolicy')} onPress={handlePrivacyPolicy} />
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
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  notifText: { flex: 1, fontSize: 13, color: Colors.text, lineHeight: 18 },
});
