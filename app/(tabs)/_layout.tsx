import { useEvents } from '@/entities/event';
import { useFavoritesStore } from '@/features/favorites';
import { useNowEvents } from '@/features/now';
import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { useLocaleStore } from '@/shared/hooks/useLocale';
import * as Haptics from 'expo-haptics';
import * as QuickActions from 'expo-quick-actions';
import { useQuickActionRouting } from 'expo-quick-actions/router';
import { Tabs } from 'expo-router';
import { BookOpen, CalendarDays, Map as MapIcon, Settings, Zap } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Platform } from 'react-native';

const tabPress = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

export default function TabsLayout() {
  const locale = useLocaleStore((s) => s.locale);
  const { events } = useEvents();
  const { now, upcoming } = useNowEvents(events);
  const { favorites } = useFavoritesStore();

  // Handle quick action navigation (both cold and warm starts)
  useQuickActionRouting();

  // Find the most relevant live event for the shortcut subtitle
  const liveSubtitle = useMemo(() => {
    const liveFav = now.find((e) => favorites[e.id]);
    if (liveFav) return `❤️ ${liveFav.title}`;
    if (now.length > 0) return `🔴 ${now[0].title}`;
    if (upcoming.length > 0) return `⏰ Proper: ${upcoming[0].title}`;
    return 'Actes en curs';
  }, [now, upcoming, favorites]);

  // Update shortcuts dynamically with context-aware subtitle (both iOS & Android)
  useEffect(() => {
    QuickActions.setItems([
      {
        id: 'ara',
        title: 'Ara',
        subtitle: liveSubtitle,
        icon: Platform.OS === 'android' ? 'shortcut_ara' : 'time',
        params: { href: '/(tabs)/ara' },
      },
      {
        id: 'agenda',
        title: 'Agenda',
        subtitle: 'Tots els actes',
        icon: Platform.OS === 'android' ? 'shortcut_agenda' : 'date',
        params: { href: '/(tabs)/agenda' },
      },
      {
        id: 'mapa',
        title: 'Mapa',
        subtitle: 'Mapa del festival',
        icon: Platform.OS === 'android' ? 'shortcut_mapa' : 'location',
        params: { href: '/(tabs)/mapa' },
      },
    ]);
  }, [liveSubtitle]);

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
          height: 64,
          paddingBottom: 8,
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
