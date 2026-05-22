import { useEvents } from '@/entities/event';
import { useFavoritesStore } from '@/features/favorites';
import { useNowEvents } from '@/features/now';
import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { useLocaleStore } from '@/shared/hooks/useLocale';
import { ErrorFallback } from '@/shared/ui';
import * as Haptics from 'expo-haptics';
import * as QuickActions from 'expo-quick-actions';
import { useQuickActionRouting } from 'expo-quick-actions/router';
import { Tabs } from 'expo-router';
import { BookOpen, CalendarDays, Map as MapIcon, Settings, Zap } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabPress = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Expo Router segment-level boundary: a crash anywhere inside (tabs) is
// caught here instead of bubbling up to root, so the modals (Feedback,
// Onboarding) mounted at the root layout stay alive and the user can recover.
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <ErrorFallback error={error} retry={retry} />;
}

export default function TabsLayout() {
  const locale = useLocaleStore((s) => s.locale);
  const { events } = useEvents();
  const { now, upcoming } = useNowEvents(events);
  const { favorites } = useFavoritesStore();
  const insets = useSafeAreaInsets();

  // Handle quick action navigation (both cold and warm starts)
  useQuickActionRouting();

  // Find the most relevant live event for the shortcut subtitle.
  // `locale` is in the deps so we re-render strings when the user changes language.
  const liveSubtitle = useMemo(() => {
    const liveFav = now.find((e) => favorites[e.id]);
    if (liveFav) return `❤️ ${liveFav.title}`;
    if (now.length > 0) return `🔴 ${now[0].title}`;
    if (upcoming.length > 0) return `⏰ ${t('quickActions.upNext')}: ${upcoming[0].title}`;
    return t('quickActions.eventsInProgress');
  }, [now, upcoming, favorites, locale]);

  // Update shortcuts dynamically with context-aware subtitle (both iOS & Android)
  useEffect(() => {
    QuickActions.setItems([
      {
        id: 'ara',
        title: t('tabs.ara'),
        subtitle: liveSubtitle,
        icon: Platform.OS === 'android' ? 'shortcut_ara' : 'time',
        params: { href: '/(tabs)/ara' },
      },
      {
        id: 'agenda',
        title: t('tabs.agenda'),
        subtitle: t('quickActions.allEvents'),
        icon: Platform.OS === 'android' ? 'shortcut_agenda' : 'date',
        params: { href: '/(tabs)/agenda' },
      },
      {
        id: 'mapa',
        title: t('tabs.mapa'),
        subtitle: t('quickActions.festivalMap'),
        icon: Platform.OS === 'android' ? 'shortcut_mapa' : 'location',
        params: { href: '/(tabs)/mapa' },
      },
    ]);
  }, [liveSubtitle, locale]);

  return (
    <Tabs
      key={locale}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          shadowColor: '#8B6F6F',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
          height: 64 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.4,
          marginTop: 2,
        },
        tabBarIconStyle: { marginBottom: -2 },
      }}
    >
      <Tabs.Screen
        name="ara"
        options={{
          title: t('tabs.ara'),
          tabBarIcon: ({ color }) => <Zap size={22} color={color} />,
        }}
        listeners={{ tabPress }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: t('tabs.mapa'),
          tabBarIcon: ({ color }) => <MapIcon size={22} color={color} />,
        }}
        listeners={{ tabPress }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: t('tabs.agenda'),
          tabBarIcon: ({ color }) => <CalendarDays size={22} color={color} />,
        }}
        listeners={{ tabPress }}
      />
      <Tabs.Screen
        name="recursos"
        options={{
          title: t('tabs.recursos'),
          tabBarIcon: ({ color }) => <BookOpen size={22} color={color} />,
        }}
        listeners={{ tabPress }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
        listeners={{ tabPress }}
      />
    </Tabs>
  );
}
