import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { useLocaleStore } from '@/shared/hooks/useLocale';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { BookOpen, CalendarDays, Map as MapIcon, Settings, Zap } from 'lucide-react-native';

const tabPress = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

export default function TabsLayout() {
  // Subscribing to locale forces this layout (and all tab labels) to re-render
  // whenever the user switches language in the settings screen.
  const locale = useLocaleStore((s) => s.locale);

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
