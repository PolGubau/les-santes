import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import { TriangleAlert } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface FallbackProps {
  error: Error;
  retry: () => void;
}

/**
 * Localized error UI shared by the class `ErrorBoundary` and Expo Router
 * segment-level `ErrorBoundary` exports. Kept presentational only.
 */
export function ErrorFallback({ error, retry }: FallbackProps) {
  return (
    <View style={styles.container}>
      <TriangleAlert size={48} color={Colors.primary} />
      <Text style={styles.title}>{t('error.screenTitle')}</Text>
      <Text style={styles.message}>{error.message}</Text>
      <Pressable
        style={styles.button}
        onPress={retry}
        accessibilityRole="button"
        accessibilityLabel={t('error.retry')}
      >
        <Text style={styles.buttonText}>{t('error.retry')}</Text>
      </Pressable>
    </View>
  );
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return <ErrorFallback error={this.state.error} retry={this.reset} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: 12,
    padding: 32,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
