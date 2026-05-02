import { Colors } from '@/shared/constants';
import { Stack } from 'expo-router';

export default function RecursosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
