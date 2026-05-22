import { Colors, Typography } from '@/shared/constants';
import { t } from '@/shared/i18n';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const W = 288;

interface CardProps {
  title: string;
  body: string;
  time: string;
}

function Card({ title, body, time }: CardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>S</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.appName}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>
          {body}
        </Text>
      </View>
    </View>
  );
}

export function NotificationPreview() {
  return (
    <View style={styles.root}>
      {/* back card — faint, peeks above the front one */}
      <Animated.View
        entering={FadeInUp.duration(520).delay(180).springify().damping(24)}
        style={[styles.stack, styles.backWrap]}
      >
        <Card title={t('notification.appName')} time={t('notification.timeNow')} body={t('notification.previewDrums')} />
      </Animated.View>

      {/* front card */}
      <Animated.View
        entering={FadeInDown.duration(520).delay(320).springify().damping(22)}
        style={styles.stack}
      >
        <Card
          title={t('notification.appName')}
          time={t('notification.timeNow')}
          body={t('notification.previewFireworks')}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: W + 24,
    height: 168,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    width: W,
  },
  backWrap: {
    position: 'absolute',
    top: 28,
    width: W - 28,
    opacity: 0.6,
    transform: [{ scale: 0.94 }],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 18,
    ...Typography.bold,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    color: Colors.text,
    fontSize: 12,
    letterSpacing: 0.4,
    ...Typography.semiBold,
  },
  time: {
    color: Colors.textMuted,
    fontSize: 12,
    ...Typography.regular,
  },
  body: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 19,
    ...Typography.regular,
  },
});
