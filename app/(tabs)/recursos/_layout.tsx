import { Colors } from '@/shared/constants';
import { ErrorFallback } from '@/shared/ui';
import { Stack } from 'expo-router';

// Contains crashes inside the Recursos stack so the tab bar (and the rest of
// the app) keeps working when one of these nested screens throws.
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <ErrorFallback error={error} retry={retry} />;
}

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
