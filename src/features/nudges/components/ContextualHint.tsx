import { Colors } from "@/shared/constants";
import { t } from "@/shared/i18n";
import { Lightbulb, X } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/shared/ui';

interface ContextualHintProps {
	title: string;
	description?: string;
	ctaLabel?: string;
	onCta?: () => void;
	onDismiss: () => void;
}

/**
 * Inline dismissible banner used to suggest a contextual action without
 * blocking the UI. Always pair with `useNudge` to gate visibility.
 */
export function ContextualHint({ title, description, ctaLabel, onCta, onDismiss }: ContextualHintProps) {
	return (
		<View style={styles.container} accessibilityRole="alert">
			<View style={styles.iconWrap}>
				<Lightbulb size={16} color={Colors.primary} />
			</View>
			<View style={styles.body}>
				<Text style={styles.title} numberOfLines={2}>
					{title}
				</Text>
				{description ? (
					<Text style={styles.description} numberOfLines={3}>
						{description}
					</Text>
				) : null}
				{ctaLabel && onCta ? (
					<Pressable
						onPress={onCta}
						style={({ pressed }) => [styles.cta, pressed && { opacity: 0.7 }]}
						accessibilityRole="button"
						accessibilityLabel={ctaLabel}
					>
						<Text style={styles.ctaText}>{ctaLabel}</Text>
					</Pressable>
				) : null}
			</View>
			<Pressable
				onPress={onDismiss}
				style={({ pressed }) => [styles.close, pressed && { opacity: 0.6 }]}
				accessibilityRole="button"
				accessibilityLabel={t('common.close')}
				hitSlop={8}
			>
				<X size={16} color={Colors.textMuted} />
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 10,
		marginHorizontal: 16,
		marginBottom: 12,
		padding: 12,
		borderRadius: 14,
		backgroundColor: Colors.surface,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	iconWrap: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: Colors.surfaceHigh,
		alignItems: "center",
		justifyContent: "center",
	},
	body: { flex: 1, gap: 4 },
	title: { color: Colors.text, fontSize: 14, fontWeight: "700" },
	description: { color: Colors.textMuted, fontSize: 12, lineHeight: 16 },
	cta: {
		marginTop: 6,
		alignSelf: "flex-start",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: Colors.primary,
	},
	ctaText: { color: "#fff", fontSize: 12, fontWeight: "700" },
	close: { padding: 2 },
});
