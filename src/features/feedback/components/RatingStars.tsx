import { Colors } from "@/shared/constants";
import * as Haptics from "expo-haptics";
import { Star } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface RatingStarsProps {
	value: number;
	onChange: (value: number) => void;
	size?: number;
}

const STARS = [1, 2, 3, 4, 5] as const;

/**
 * 1–5 star rating input. Tap-to-set with light haptic feedback.
 * Renders as a radio group for accessibility.
 */
export function RatingStars({ value, onChange, size = 36 }: RatingStarsProps) {
	return (
		<View style={styles.row} accessibilityRole="radiogroup">
			{STARS.map((n) => {
				const active = value >= n;
				return (
					<Pressable
						key={n}
						hitSlop={8}
						onPress={() => {
							Haptics.selectionAsync().catch(() => {});
							onChange(n);
						}}
						accessibilityRole="radio"
						accessibilityState={{ checked: value === n }}
						accessibilityLabel={`${n}`}
					>
						<Star
							size={size}
							color={active ? Colors.primary : Colors.border}
							fill={active ? Colors.primary : "transparent"}
						/>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", justifyContent: "center", gap: 10 },
});
