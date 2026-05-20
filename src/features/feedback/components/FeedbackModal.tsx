import { Colors, Typography } from "@/shared/constants";
import { t } from "@/shared/i18n";
import * as Haptics from "expo-haptics";
import { usePathname } from "expo-router";
import { CheckCircle2, X } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFeedback } from "../hooks/useFeedback";
import {
	FEEDBACK_MESSAGE_MAX,
	FEEDBACK_TAGS,
	FEEDBACK_TYPES,
	type FeedbackTag,
	type FeedbackType,
} from "../lib/types";
import { Chip } from "./Chip";
import { RatingStars } from "./RatingStars";

/**
 * Globally mounted feedback modal. Reads its open state from
 * `useFeedbackStore` so any component can trigger it via `useFeedback()`.
 * Captures runtime context (route, session time, behaviour counters)
 * automatically — never asks the user.
 */
export function FeedbackModal() {
	const { isOpen, close, submit } = useFeedback();
	const insets = useSafeAreaInsets();
	const pathname = usePathname();

	const [rating, setRating] = useState(0);
	const [type, setType] = useState<FeedbackType>("general");
	const [tags, setTags] = useState<FeedbackTag[]>([]);
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const reset = useCallback(() => {
		setRating(0);
		setType("general");
		setTags([]);
		setMessage("");
		setError(null);
		setSuccess(false);
	}, []);

	const handleClose = useCallback(() => {
		reset();
		close();
	}, [reset, close]);

	const toggleTag = useCallback((tag: FeedbackTag) => {
		setTags((curr) =>
			curr.includes(tag) ? curr.filter((x) => x !== tag) : [...curr, tag],
		);
	}, []);

	const handleSubmit = useCallback(async () => {
		if (rating < 1 || submitting) return;
		setSubmitting(true);
		setError(null);
		try {
			await submit({ rating, type, tags, message }, pathname);
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
				() => { },
			);
			setSuccess(true);
			setTimeout(() => {
				reset();
				close();
			}, 1400);
		} catch (e) {
			setError((e as Error).message || t("feedback.error"));
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
				() => { },
			);
		} finally {
			setSubmitting(false);
		}
	}, [rating, type, tags, message, pathname, submit, reset, close, submitting]);

	const canSubmit = rating >= 1 && !submitting;

	return (
		<Modal
			visible={isOpen}
			animationType="slide"
			transparent
			onRequestClose={handleClose}
			statusBarTranslucent
		>
			<View style={styles.backdrop}>
				<Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
				>
					<View style={styles.header}>
						<Text style={styles.title}>{t("feedback.title")}</Text>
						<Pressable
							onPress={handleClose}
							hitSlop={10}
							accessibilityRole="button"
							accessibilityLabel={t("feedback.close")}
						>
							<X size={22} color={Colors.textMuted} />
						</Pressable>
					</View>

					{success ? (
						<View style={styles.successBox}>
							<CheckCircle2 size={48} color={Colors.stateNow} />
							<Text style={styles.successText}>{t("feedback.thanks")}</Text>
						</View>
					) : (
						<ScrollView
							keyboardShouldPersistTaps="handled"
							showsVerticalScrollIndicator={false}
							contentContainerStyle={styles.body}
						>
							<Text style={styles.subtitle}>{t("feedback.subtitle")}</Text>

							<Text style={styles.label}>{t("feedback.ratingLabel")}</Text>
							<RatingStars value={rating} onChange={setRating} />

							<Text style={styles.label}>{t("feedback.typeLabel")}</Text>
							<View style={styles.chipRow}>
								{FEEDBACK_TYPES.map((tp) => (
									<Chip
										key={tp}
										label={t(`feedback.type.${tp}`)}
										active={type === tp}
										onPress={() => setType(tp)}
									/>
								))}
							</View>

							<Text style={styles.label}>{t("feedback.tagsLabel")}</Text>
							<View style={styles.chipRow}>
								{FEEDBACK_TAGS.map((tag) => (
									<Chip
										key={tag}
										label={t(`feedback.tag.${tag}`)}
										active={tags.includes(tag)}
										onPress={() => toggleTag(tag)}
									/>
								))}
							</View>

							<Text style={styles.label}>{t("feedback.messageLabel")}</Text>
							<TextInput
								style={styles.input}
								value={message}
								onChangeText={setMessage}
								placeholder={t("feedback.messagePlaceholder")}
								placeholderTextColor={Colors.textDim}
								multiline
								maxLength={FEEDBACK_MESSAGE_MAX}
							/>

							{error ? <Text style={styles.errorText}>{error}</Text> : null}

							<Pressable
								style={[styles.submit, !canSubmit && styles.submitDisabled]}
								disabled={!canSubmit}
								onPress={handleSubmit}
								accessibilityRole="button"
								accessibilityLabel={t("feedback.submit")}
							>
								{submitting ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text style={styles.submitText}>{t("feedback.submit")}</Text>
								)}
							</Pressable>
						</ScrollView>
					)}
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: Colors.surface,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 20,
		paddingTop: 16,
		maxHeight: "92%",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingBottom: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Colors.border,
	},
	title: {
		fontSize: 18,
		color: Colors.text,
		letterSpacing: -0.3,
		...Typography.bold,
	},
	body: { paddingTop: 16, paddingBottom: 8, gap: 8 },
	subtitle: {
		fontSize: 13,
		color: Colors.textMuted,
		lineHeight: 19,
		marginBottom: 4,
		...Typography.regular,
	},
	label: {
		fontSize: 11,
		color: Colors.textDim,
		letterSpacing: 0.8,
		textTransform: "uppercase",
		marginTop: 16,
		marginBottom: 4,
		...Typography.bold,
	},
	chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	input: {
		minHeight: 88,
		backgroundColor: Colors.background,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Colors.border,
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 14,
		color: Colors.text,
		textAlignVertical: "top",
		...Typography.regular,
	},
	errorText: {
		marginTop: 8,
		color: Colors.primary,
		fontSize: 13,
		...Typography.semiBold,
	},
	submit: {
		marginTop: 18,
		paddingVertical: 15,
		borderRadius: 14,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 50,
	},
	submitDisabled: { opacity: 0.4 },
	submitText: {
		color: "#fff",
		fontSize: 15,
		...Typography.bold,
	},
	successBox: {
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
		paddingVertical: 48,
	},
	successText: {
		color: Colors.text,
		fontSize: 16,
		textAlign: "center",
		...Typography.semiBold,
	},
});
