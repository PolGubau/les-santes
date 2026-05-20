import { Colors, Typography } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { Screen, ScreenHeader } from '@/shared/ui';
import { BarChart2, Bell, HardDrive, MapPin, MessageSquare } from 'lucide-react-native';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CONTACT_EMAIL = 'gubaupol+lessantes-support@gmail.com';
const PRIVACY_POLICY_URL = 'https://lessantes.polgubau.com/privacy';

function SectionTitle({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

function DataRow({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
  return (
    <View style={styles.dataRow}>
      <View style={styles.dataIcon}>{icon}</View>
      <View style={styles.dataText}>
        <Text style={styles.dataLabel}>{label}</Text>
        <Text style={styles.dataDesc}>{desc}</Text>
      </View>
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <Screen edges={['top']}>
      <ScreenHeader title={t('privacy.title')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Privacitat ──────────────────────────────────────────────────── */}
        <SectionTitle label={t('privacy.sectionPrivacy')} />
        <View style={styles.card}>
          <Text style={styles.bodyText}>{t('privacy.privacyText')}</Text>
        </View>

        {/* ── Dades que utilitzem ─────────────────────────────────────────── */}
        <SectionTitle label={t('privacy.sectionData')} />
        <View style={styles.card}>
          <DataRow
            icon={<BarChart2 size={18} color={Colors.primary} />}
            label={t('privacy.analyticsLabel')}
            desc={t('privacy.analyticsDesc')}
          />
          <View style={styles.divider} />
          <DataRow
            icon={<MessageSquare size={18} color={Colors.primary} />}
            label={t('privacy.feedbackLabel')}
            desc={t('privacy.feedbackDesc')}
          />
          <View style={styles.divider} />
          <DataRow
            icon={<MapPin size={18} color={Colors.primary} />}
            label={t('privacy.locationLabel')}
            desc={t('privacy.locationDesc')}
          />
          <View style={styles.divider} />
          <DataRow
            icon={<Bell size={18} color={Colors.primary} />}
            label={t('privacy.notificationsLabel')}
            desc={t('privacy.notificationsDesc')}
          />
          <View style={styles.divider} />
          <DataRow
            icon={<HardDrive size={18} color={Colors.primary} />}
            label={t('privacy.cacheLabel')}
            desc={t('privacy.cacheDesc')}
          />
        </View>

        {/* ── Contacte ────────────────────────────────────────────────────── */}
        <SectionTitle label={t('privacy.sectionContact')} />
        <View style={styles.card}>
          <Text style={styles.bodyText}>{t('privacy.contactText')}</Text>
          <TouchableOpacity
            style={styles.emailBtn}
            onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.emailText}>{CONTACT_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Política completa ────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.policyLink}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          activeOpacity={0.7}
        >
          <Text style={styles.policyLinkText}>{t('privacy.privacyPolicyLink')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 48, gap: 8 },
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
    padding: 16,
    gap: 12,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.text,
    ...Typography.regular,
  },
  dataRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  dataIcon: { marginTop: 1 },
  dataText: { flex: 1, gap: 2 },
  dataLabel: { fontSize: 14, color: Colors.text, ...Typography.semiBold },
  dataDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 19, ...Typography.regular },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  emailBtn: { marginTop: 4 },
  emailText: { fontSize: 14, color: Colors.primary, ...Typography.semiBold },
  policyLink: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  policyLinkText: { fontSize: 13, color: Colors.textMuted, textDecorationLine: 'underline', ...Typography.regular },
});
