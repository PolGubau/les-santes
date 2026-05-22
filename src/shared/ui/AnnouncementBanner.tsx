import type { Announcement } from '@/entities/announcement';
import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const SEVERITY_STYLE: Record<
  Announcement['severity'],
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  info: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1D4ED8',
    icon: <Info size={15} color="#1D4ED8" />,
  },
  warning: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#B45309',
    icon: <AlertTriangle size={15} color="#B45309" />,
  },
  critical: {
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#DC2626',
    icon: <AlertCircle size={15} color="#DC2626" />,
  },
};

interface Props {
  announcements: Announcement[];
}

export function AnnouncementBanner({ announcements }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <View style={styles.container}>
      {visible.map((a) => {
        const s = SEVERITY_STYLE[a.severity];
        return (
          <View
            key={a.id}
            style={[styles.banner, { backgroundColor: s.bg, borderColor: s.border }]}
          >
            <View style={styles.iconWrap}>{s.icon}</View>
            <View style={styles.textWrap}>
              <Text style={[styles.title, { color: s.text }]} numberOfLines={1}>
                {a.title}
              </Text>
              {a.message ? (
                <Text style={[styles.message, { color: s.text }]} numberOfLines={2}>
                  {a.message}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={() => setDismissed((prev) => new Set([...prev, a.id]))}
              hitSlop={8}
              style={styles.dismiss}
              accessibilityLabel={t('common.dismissNotice')}
            >
              <X size={14} color={s.text} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6, paddingHorizontal: 12, paddingVertical: 6 },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  iconWrap: { paddingTop: 1 },
  textWrap: { flex: 1, gap: 2 },
  title: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  message: { fontSize: 12, lineHeight: 16, opacity: 0.85 },
  dismiss: { paddingTop: 2, opacity: 0.7 },
});
