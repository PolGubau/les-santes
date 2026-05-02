import { Colors } from "@/shared/constants";
import type React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { type Edge, SafeAreaView } from "react-native-safe-area-context";

interface Props extends ViewProps {
  children: React.ReactNode;
  safe?: boolean;
  edges?: Edge[];
}

export function Screen({
  children,
  safe = true,
  edges,
  style,
  ...props
}: Props) {
  if (safe) {
    return (
      <SafeAreaView edges={edges} style={[styles.root, style]} {...props}>
        {children}
      </SafeAreaView>
    );
  }
  return (
    <View style={[styles.root, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
