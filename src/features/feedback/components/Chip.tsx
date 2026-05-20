import { Colors, Typography } from "@/shared/constants";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface ChipProps {
	label: string;
	active: boolean;
	onPress: () => void;
}

/**
 * Small toggle chip used for selecting feedback type and tags.
 * Visual contract matches the locale buttons in Settings.
 */
export function Chip({ label, active, onPress }: ChipProps) {
	return (
		<Pressable
			onPress={() => {
				Haptics.selectionAsync().catch(() => {});
				onPress();
			}}
			style={[styles.chip, active && styles.chipActive]}
			accessibilityRole="button"
			accessibilityState={{ selected: active }}
			accessibilityLabel={label}
		>
			<Text style={[styles.text, active && styles.textActive]}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: Colors.surface,
		borderWidth: 1.5,
		borderColor: Colors.border,
	},
	chipActive: {
		backgroundColor: "#FDF0F2",
		borderColor: Colors.primary,
	},
	text: {
		fontSize: 13,
		color: Colors.textMuted,
		...Typography.semiBold,
	},
	textActive: {
		color: Colors.primary,
	},
});
