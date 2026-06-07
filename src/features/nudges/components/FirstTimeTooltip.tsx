import { Colors } from "@/shared/constants";
import { X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/shared/ui';

interface FirstTimeTooltipProps {
	title: string;
	description?: string;
	onDismiss: () => void;
	/** Auto-dismiss timeout in ms. 0 disables. Defaults to 6000. */
	autoDismissMs?: number;
}

/**
 * Floating tooltip pinned to the bottom of the screen. Self‑dismisses
 * after `autoDismissMs` and reports `onDismiss` so the engine marks it as
 * shown. Non‑blocking — touches pass through everywhere except the card.
 */
export function FirstTimeTooltip({
	title,
	description,
	onDismiss,
	autoDismissMs = 6000,
}: FirstTimeTooltipProps) {
	const opacity = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(16)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
			Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
		]).start();

		if (autoDismissMs <= 0) return;
		const timer = setTimeout(onDismiss, autoDismissMs);
		return () => clearTimeout(timer);
	}, [autoDismissMs, onDismiss, opacity, translateY]);

	return (
		<Animated.View
			pointerEvents="box-none"
			style={[styles.wrapper, { opacity, transform: [{ translateY }] }]}
		>
			<Pressable
				onPress={onDismiss}
				style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
				accessibilityRole="button"
				accessibilityLabel={title}
			>
				<Text style={styles.title}>{title}</Text>
				{description ? <Text style={styles.description}>{description}</Text> : null}
				<X size={14} color="rgba(255,255,255,0.7)" style={styles.close} />
			</Pressable>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: "absolute",
		left: 16,
		right: 16,
		bottom: 24,
	},
	card: {
		backgroundColor: Colors.text,
		paddingHorizontal: 16,
		paddingVertical: 12,
		paddingRight: 36,
		borderRadius: 14,
		shadowColor: "#000",
		shadowOpacity: 0.18,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
		elevation: 6,
	},
	title: { color: "#fff", fontSize: 14, fontWeight: "700" },
	description: { color: "rgba(255,255,255,0.78)", fontSize: 12, marginTop: 2 },
	close: { position: "absolute", top: 10, right: 10 },
});
