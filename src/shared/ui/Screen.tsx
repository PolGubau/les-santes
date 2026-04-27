import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants';

interface Props extends ViewProps {
  children: React.ReactNode;
  safe?: boolean;
}

export function Screen({ children, safe = true, style, ...props }: Props) {
  const Wrapper = safe ? SafeAreaView : View;
  return (
    <Wrapper style={[styles.root, style]} {...props}>
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
