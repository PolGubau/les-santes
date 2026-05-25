import { Colors } from "@/shared/constants";
import type { LucideIcon } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface EmptyStateCTAProps {
	icon?: LucideIcon;
	title?: string;
	description?: string;
	ctaLabel: string;
	onCta: () => void;
	secondaryLabel?: string;
	onSecondary?: () => void;
}

/**
 * Centred empty‑state with a primary CTA and an optional secondary action.
 * Used when a list/section renders zero items and we want to offer a way out.
 */
export function EmptyStateCTA({
	icon: Icon,
	title,
	description,
	ctaLabel,
	onCta,
	secondaryLabel,
	onSecondary,
}: EmptyStateCTAProps) {
	return (
		<View style={styles.container}>
			{Icon ? (
				<View style={styles.iconWrap}>
					<Icon size={28} color={Colors.primary} />
				</View>
			) : null}
			{title ? <Text style={styles.title}>{title}</Text> : null}
			{description ? <Text style={styles.description}>{description}</Text> : null}
			<Pressable
				onPress={onCta}
				style={({ pressed }) => [styles.cta, pressed && { opacity: 0.8 }]}
				accessibilityRole="button"
				accessibilityLabel={ctaLabel}
			>
				<Text style={styles.ctaText}>{ctaLabel}</Text>
			</Pressable>
			{secondaryLabel && onSecondary ? (
				<Pressable
					onPress={onSecondary}
					style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.6 }]}
					accessibilityRole="button"
					accessibilityLabel={secondaryLabel}
				>
					<Text style={styles.secondaryText}>{secondaryLabel}</Text>
				</Pressable>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 32,
		paddingVertical: 48,
	},
	iconWrap: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: Colors.surfaceHigh,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 4,
	},
	title: {
		color: Colors.text,
		fontSize: 17,
		fontWeight: "700",
		textAlign: "center",
	},
	description: {
		color: Colors.textMuted,
		fontSize: 13,
		lineHeight: 18,
		textAlign: "center",
		maxWidth: 280,
	},
	cta: {
		marginTop: 12,
		paddingHorizontal: 22,
		paddingVertical: 12,
		borderRadius: 999,
		backgroundColor: Colors.primary,
	},
	ctaText: { color: "#fff", fontSize: 14, fontWeight: "700" },
	secondary: { marginTop: 6, padding: 6 },
	secondaryText: { color: Colors.textMuted, fontSize: 13, fontWeight: "600" },
});
