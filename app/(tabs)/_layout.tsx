import { Colors } from '@/shared/constants';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { BookOpen, CalendarDays, Map as MapIcon, Zap } from 'lucide-react-native';

const tabPress = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

export default function TabsLayout() {
  return (
    <Tabs
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
          title: 'Ara',
          tabBarIcon: ({ color }) => <Zap size={22} color={color} />,
        }}
        listeners={{ tabPress }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <MapIcon size={22} color={color} />,
        }}
        listeners={{ tabPress }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => <CalendarDays size={22} color={color} />,
        }}
        listeners={{ tabPress }}
      />
      <Tabs.Screen
        name="recursos"
        options={{
          title: 'Recursos',
          tabBarIcon: ({ color }) => <BookOpen size={22} color={color} />,
        }}
        listeners={{ tabPress }}
      />
    </Tabs>
  );
}
