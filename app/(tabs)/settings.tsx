import { useAnalyticsStore } from '@/features/analytics/store/useAnalyticsStore';
import { useDismissedAnnouncementsStore } from '@/features/announcements';
import { useFeedback, useStoreReview } from '@/features/feedback';
import { useNudgeStore } from '@/features/nudges';
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore';
import { Colors, Typography } from '@/shared/constants';
import { type EngagementFrequencyDays, useEngagementStore } from '@/shared/hooks/useEngagementStore';
import { type AppLocale, LOCALES, useLocaleStore } from '@/shared/hooks/useLocale';
import { t } from '@/shared/i18n';
import { type EngagementSlot, type ScheduledEventNotification, buildEngagementSchedule, cancelEventNotification, fireTestNotification, getScheduledEventNotifications, isExpoGo, scheduleEngagementNotifications } from '@/shared/lib/notifications';
import { Screen } from '@/shared/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Bell, BellOff, ExternalLink, RotateCcw, Star, Wrench } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { Text } from '@/shared/ui';

const EVENTS_CACHE_KEY = '@les-santes/events-v1';
const PRIVACY_POLICY_URL = 'https://lessantes.polgubau.com/privacy';
const ADMIN_URL = 'https://lessantes.polgubau.com/admin';
const ADMIN_UNLOCKED_KEY = '@les-santes/admin-unlocked';
const ADMIN_TAP_TARGET = 7;

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

function ActionRow({
  label, onPress, destructive, leftIcon, rightIcon,
}: {
  label: string; onPress: () => void; destructive?: boolean;
  leftIcon?: React.ReactNode; rightIcon?: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {leftIcon ? <View style={styles.rowLeftIcon}>{leftIcon}</View> : null}
      <Text style={[styles.rowLabel, { flex: 1 }, destructive && { color: '#E53E3E' }]}>{label}</Text>
      {rightIcon ? <View>{rightIcon}</View> : null}
    </TouchableOpacity>
  );
}

function SwitchRow({ label, description, value, onValueChange }: {
  label: string; description?: string; value: boolean; onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowSublabel}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: Colors.primary, false: Colors.border }}
        thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
      />
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
      <Text
        style={[styles.localeLabel, active && styles.localeLabelActive]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {label}
      </Text>
      {active && <View style={styles.localeDot} />}
    </TouchableOpacity>
  );
}

function FrequencyOption({ label, active, onPress }: {
  label: string; active: boolean; onPress: () => void;
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
      <Text
        style={[styles.localeLabel, active && styles.localeLabelActive]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {label}
      </Text>
      {active && <View style={styles.localeDot} />}
    </TouchableOpacity>
  );
}

/**
 * Dev-only panel that shows the simulated engagement notification schedule
 * and a button to fire a test notification in 5 seconds.
 *
 * Local scheduled notifications work in iOS Expo Go.
 * Android Expo Go may fail due to SDK 53 native module limitations.
 */
function EngagementDebugPanel({ frequencyDays }: { frequencyDays: number }) {
  const { FESTIVAL_START } = require('@/shared/constants/festival') as { FESTIVAL_START: Date };
  const schedule = buildEngagementSchedule(new Date(), frequencyDays, FESTIVAL_START);
  const [testing, setTesting] = React.useState(false);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;

  const handleTest = async () => {
    setTesting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
    const msg = await fireTestNotification(5);
    setTesting(false);
    Alert.alert('Test notification', msg);
  };

  return (
    <View style={{ marginTop: 8 }}>
      <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
        {isExpoGo ? '⚠️ Expo Go — push no disponible' : '✅ Standalone — notificaciones activas'}
      </Text>

      {/* Test button */}
      <TouchableOpacity
        style={[styles.card, { paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 8 }]}
        onPress={handleTest}
        disabled={testing}
        activeOpacity={0.7}
      >
        <Bell size={15} color={testing ? Colors.textDim : Colors.primary} />
        <Text style={[styles.rowLabel, { color: testing ? Colors.textDim : Colors.primary, flex: 1 }]}>
          {testing ? 'Programando…' : 'Probar notificación en 5 s'}
        </Text>
      </TouchableOpacity>

      {/* Slot list */}
      <View style={[styles.card, { marginTop: 8 }]}>
        {schedule.length === 0 ? (
          <View style={styles.row}>
            <Text style={styles.rowSublabel}>Festival iniciado — sin slots.</Text>
          </View>
        ) : (
          schedule.map((slot: EngagementSlot) => (
            <View key={slot.slot}>
              {slot.slot > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>
                    Slot {slot.slot + 1} · body{slot.bodyIndex}
                  </Text>
                  <Text style={styles.rowSublabel}>{fmt(slot.triggerDate)}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { locale, setLocale } = useLocaleStore();
  const { isEnabled, setEnabled } = useAnalyticsStore();
  const engagementFrequency = useEngagementStore((s) => s.frequencyDays);
  const setEngagementFrequency = useEngagementStore((s) => s.setFrequencyDays);
  const { open: openFeedback } = useFeedback();
  const { canRate, rateApp } = useStoreReview();
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const dismissedAnnouncementIds = useDismissedAnnouncementsStore((s) => s.dismissedIds);
  const restoreDismissedAnnouncements = useDismissedAnnouncementsStore((s) => s.restoreAll);
  const [scheduledNotifs, setScheduledNotifs] = useState<ScheduledEventNotification[]>([]);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const tapCount = useRef(0);

  // Load scheduled notifications + admin unlock flag when screen mounts
  useEffect(() => {
    getScheduledEventNotifications().then(setScheduledNotifs).catch(() => { });
    AsyncStorage.getItem(ADMIN_UNLOCKED_KEY).then((v) => {
      if (v === 'true') setAdminUnlocked(true);
    }).catch(() => { });
  }, []);

  const handleVersionTap = useCallback(() => {
    tapCount.current += 1;
    if (tapCount.current === ADMIN_TAP_TARGET - 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (tapCount.current === ADMIN_TAP_TARGET) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAdminUnlocked(true);
      AsyncStorage.setItem(ADMIN_UNLOCKED_KEY, 'true').catch(() => { });
    }
  }, []);

  const handleCancelNotif = useCallback((eventId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cancelEventNotification(eventId).then(() => {
      setScheduledNotifs((prev) => prev.filter((n) => n.eventId !== eventId));
    }).catch(() => { });
  }, []);

  const handleNotifications = () => Linking.openSettings();

  const handleEngagementFrequency = useCallback(
    (days: EngagementFrequencyDays) => {
      if (days === engagementFrequency) return;
      Haptics.selectionAsync().catch(() => { });
      setEngagementFrequency(days);
      // Re-schedule with the new cadence; safe to fire-and-forget.
      scheduleEngagementNotifications().catch(() => { });
    },
    [engagementFrequency, setEngagementFrequency],
  );

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
  const handlePrivacyScreen = () => router.push('/privacy');
  const handleFeedback = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    openFeedback();
  }, [openFeedback]);
  const handleRateApp = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    void rateApp('settings');
  }, [rateApp]);

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

        {/* ── Engagement reminders cadence ───────────────────────────────── */}
        <SectionTitle label={t('settings.engagementSection')} />
        <View style={styles.card}>
          <View style={[styles.row, { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
            <View>
              <Text style={styles.rowLabel}>{t('settings.engagementFrequency')}</Text>
              <Text style={styles.rowSublabel}>{t('settings.engagementFrequencyDesc')}</Text>
            </View>
            <View style={styles.localeGroup}>
              <FrequencyOption
                label={t('settings.engagementEveryDay')}
                active={engagementFrequency === 1}
                onPress={() => handleEngagementFrequency(1)}
              />
              <FrequencyOption
                label={t('settings.engagementEveryTwoDays')}
                active={engagementFrequency === 2}
                onPress={() => handleEngagementFrequency(2)}
              />
            </View>
          </View>
        </View>

        {/* Scheduled event notifications */}
        {scheduledNotifs.length > 0 && (
          <>
            <SectionTitle label={t('settings.scheduledReminders')} />
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

        {/* ── Dismissed announcements ─────────────────────────────────────── */}
        {dismissedAnnouncementIds.length > 0 && (
          <>
            <SectionTitle label={t('settings.announcements')} />
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.rowLabel}>{t('settings.dismissedAnnouncements')}</Text>
                  <Text style={styles.rowSublabel}>{t('settings.dismissedAnnouncementsDesc')}</Text>
                </View>
                <Text style={styles.rowValue}>{dismissedAnnouncementIds.length}</Text>
              </View>
              <View style={styles.divider} />
              <ActionRow
                label={t('settings.restoreDismissedAnnouncements')}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
                  restoreDismissedAnnouncements();
                }}
              />
            </View>
          </>
        )}

        {/* ── Feedback ────────────────────────────────────────────────────── */}
        <SectionTitle label={t('settings.feedback')} />
        <View style={styles.card}>
          <ActionRow label={t('settings.feedbackHint')} onPress={handleFeedback} />
          {canRate && (
            <>
              <View style={styles.divider} />
              <ActionRow
                label={t('settings.rateAppHint')}
                leftIcon={<Star size={15} color={Colors.primary} />}
                onPress={handleRateApp}
              />
            </>
          )}
        </View>

        {/* ── Cache ───────────────────────────────────────────────────────── */}
        <SectionTitle label={t('settings.data')} />
        <View style={styles.card}>
          <SwitchRow
            label={t('settings.analytics')}
            description={t('settings.analyticsDesc')}
            value={isEnabled}
            onValueChange={setEnabled}
          />
          <View style={styles.divider} />
          <ActionRow label={t('settings.clearCache')} onPress={handleClearCache} destructive />
        </View>

        {/* ── Links ───────────────────────────────────────────────────────── */}
        <SectionTitle label={t('settings.links')} />
        <View style={styles.card}>
          <ActionRow label={t('settings.privacyAndData')} onPress={handlePrivacyScreen} />
          <View style={styles.divider} />
          <ActionRow label={t('settings.privacyPolicy')} onPress={handlePrivacyPolicy} />
        </View>

        {/* ── App info ────────────────────────────────────────────────────── */}
        <SectionTitle label={t('settings.appInfo')} />
        <View style={styles.card}>
          <TouchableOpacity onPress={handleVersionTap} activeOpacity={1}>
            <InfoRow label={t('settings.version')} value={cfg?.version ?? '—'} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <InfoRow label={t('settings.environment')} value={envLabel(Constants.executionEnvironment)} />
          <View style={styles.divider} />
          <InfoRow label={t('settings.bundleId')} value={bundleId ?? '—'} />
          {adminUnlocked && (
            <>
              <View style={styles.divider} />
              <ActionRow
                label="Admin"
                leftIcon={<Wrench size={15} color={Colors.textDim} />}
                rightIcon={<ExternalLink size={14} color={Colors.textDim} />}
                onPress={() => Linking.openURL(ADMIN_URL)}
              />
            </>
          )}
        </View>

        {/* ── Dev tools (admin mode only) ─────────────────────────────────── */}
        {adminUnlocked && (
          <>
            <SectionTitle label="Dev tools" />
            <View style={styles.card}>
              <ActionRow
                label="Veure onboarding"
                leftIcon={<RotateCcw size={15} color={Colors.textDim} />}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
                  resetOnboarding();
                }}
              />
              <View style={styles.divider} />
              <ActionRow
                label="Resetear nudges"
                leftIcon={<RotateCcw size={15} color={Colors.textDim} />}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
                  useNudgeStore.getState().resetAll();
                }}
              />
            </View>
            <EngagementDebugPanel frequencyDays={engagementFrequency} />
          </>
        )}

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
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
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
  localeLabel: { flex: 1, fontSize: 14, color: Colors.textMuted, ...Typography.semiBold },
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
  rowLeftIcon: { marginRight: 4 },
  rowLabel: { fontSize: 14, color: Colors.text, ...Typography.regular },
  rowSublabel: { fontSize: 12, color: Colors.textDim, marginTop: 2, ...Typography.regular },
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
