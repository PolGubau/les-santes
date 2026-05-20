import { track } from "@/features/analytics";
import { Colors } from "@/shared/constants";
import { t } from "@/shared/i18n";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeOut,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { requestLocationPermission, requestNotificationPermission } from "../lib/permissions";
import { LocationPreview } from "./LocationPreview";
import { NotificationPreview } from "./NotificationPreview";
import { WelcomeHero } from "./WelcomeHero";

type SlideId = "welcome" | "location" | "notifications";

interface SlideContent {
	id: SlideId;
	visual: React.ReactNode;
	title: string;
	description: string;
	primaryLabel: string;
	skipLabel?: string;
	onPrimary?: () => Promise<unknown> | void;
}

const DOT_WIDTH = 24;
const DOT_WIDTH_ACTIVE = 32;

function ProgressDot({ active }: { active: boolean }) {
	const width = useSharedValue(active ? DOT_WIDTH_ACTIVE : DOT_WIDTH);
	useEffect(() => {
		width.value = withSpring(active ? DOT_WIDTH_ACTIVE : DOT_WIDTH, {
			damping: 14,
			stiffness: 180,
		});
	}, [active, width]);
	const style = useAnimatedStyle(() => ({ width: width.value }));
	return (
		<Animated.View
			style={[styles.progressDot, active && styles.progressDotActive, style]}
		/>
	);
}

interface OnboardingFlowProps {
	visible: boolean;
	onFinish: () => void;
}

const SLIDE_ORDER: SlideId[] = ["welcome", "location", "notifications"];

export function OnboardingFlow({ visible, onFinish }: OnboardingFlowProps) {
	const insets = useSafeAreaInsets();
	const [index, setIndex] = useState(0);
	const [busy, setBusy] = useState(false);

	const startedRef = useRef(false);
	useEffect(() => {
		if (visible) {
			if (!startedRef.current) {
				startedRef.current = true;
				track("onboarding_started");
			}
		} else {
			// Reset when modal closes so the next open starts from slide 0
			startedRef.current = false;
			setIndex(0);
			setBusy(false);
		}
	}, [visible]);

	const advance = useCallback(() => {
		setIndex((i) => {
			if (i >= SLIDE_ORDER.length - 1) {
				track("onboarding_completed", { last_step: SLIDE_ORDER[i] });
				onFinish();
				return i;
			}
			return i + 1;
		});
	}, [onFinish]);

	const handlePrimary = useCallback(
		async (action?: () => Promise<unknown> | void) => {
			if (busy) return;
			Haptics.selectionAsync().catch(() => { });
			if (action) {
				setBusy(true);
				try {
					await action();
				} finally {
					setBusy(false);
				}
			}
			advance();
		},
		[advance, busy],
	);

	const handleSkip = useCallback(
		(slideId: SlideId) => {
			Haptics.selectionAsync().catch(() => { });
			track("onboarding_step_skipped", { step: slideId });
			advance();
		},
		[advance],
	);

	const slides: SlideContent[] = [
		{
			id: "welcome",
			visual: <WelcomeHero />,
			title: t("onboarding.welcomeTitle"),
			description: t("onboarding.welcomeDesc"),
			primaryLabel: t("onboarding.welcomeCta"),
		},
		{
			id: "location",
			visual: <LocationPreview />,
			title: t("onboarding.locationTitle"),
			description: t("onboarding.locationDesc"),
			primaryLabel: t("onboarding.locationCta"),
			skipLabel: t("onboarding.notNow"),
			onPrimary: requestLocationPermission,
		},
		{
			id: "notifications",
			visual: <NotificationPreview />,
			title: t("onboarding.notificationsTitle"),
			description: t("onboarding.notificationsDesc"),
			primaryLabel: t("onboarding.notificationsCta"),
			skipLabel: t("onboarding.notNow"),
			onPrimary: requestNotificationPermission,
		},
	];

	const slide = slides[index];

	return (
		<Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
			<View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
				<View style={styles.progress}>
					{SLIDE_ORDER.map((id, i) => (
						<ProgressDot key={id} active={i === index} />
					))}
				</View>

				<Animated.View
					key={slide.id}
					entering={FadeIn.duration(420)}
					exiting={FadeOut.duration(180)}
					style={styles.body}
				>
					{slide.visual}
					<Animated.Text entering={FadeInDown.duration(500).delay(520)} style={styles.title}>
						{slide.title}
					</Animated.Text>
					<Animated.Text
						entering={FadeInDown.duration(500).delay(620)}
						style={styles.description}
					>
						{slide.description}
					</Animated.Text>
				</Animated.View>

				<Animated.View entering={FadeInDown.duration(500).delay(720)} style={styles.footer}>

					<Pressable
						style={({ pressed }) => [styles.primary, (pressed || busy) && { opacity: 0.85 }]}
						onPress={() => handlePrimary(slide.onPrimary)}
						accessibilityRole="button"
						accessibilityLabel={slide.primaryLabel}
						disabled={busy}
					>
						<Text style={styles.primaryText}>{slide.primaryLabel}</Text>
					</Pressable>
					{slide.skipLabel ? (
						<Pressable
							onPress={() => handleSkip(slide.id)}
							style={({ pressed }) => [styles.skip, pressed && { opacity: 0.6 }]}
							accessibilityRole="button"
							accessibilityLabel={slide.skipLabel}
							disabled={busy}
						>
							<Text style={styles.skipText}>{slide.skipLabel}</Text>
						</Pressable>
					) : null}
				</Animated.View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: Colors.background,
		paddingHorizontal: 32,
	},
	progress: { flexDirection: "row", justifyContent: "center", gap: 8 },
	progressDot: {
		height: 4,
		borderRadius: 2,
		backgroundColor: Colors.border,
	},
	progressDotActive: { backgroundColor: Colors.primary },
	body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 18 },
	title: { color: Colors.text, fontSize: 24, fontWeight: "800", textAlign: "center" },
	description: {
		color: Colors.textMuted,
		fontSize: 15,
		lineHeight: 22,
		textAlign: "center",
		maxWidth: 320,
	},
	footer: { gap: 8 },
	primary: {
		paddingVertical: 16,
		borderRadius: 14,
		backgroundColor: Colors.primary,
		alignItems: "center",
	},
	primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
	skip: { alignItems: "center", paddingVertical: 10 },
	skipText: { color: Colors.textMuted, fontSize: 14, fontWeight: "600" },
});
