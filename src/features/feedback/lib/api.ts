import { FESTIVAL_ID } from "@/shared/constants";
import { i18n } from "@/shared/i18n";
import { getSupabaseClient } from "@/shared/lib/supabase";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { buildFeedbackContext } from "./context";
import type { FeedbackInput, FeedbackPayload } from "./types";

function resolvePlatform(): FeedbackPayload["platform"] {
	if (Platform.OS === "ios" || Platform.OS === "android") return Platform.OS;
	return "web";
}

/**
 * Persist a feedback submission. The caller passes only what the user
 * actually filled in; context, locale, platform and app version are
 * resolved here so the UI stays UI.
 */
export async function submitFeedback(
	input: FeedbackInput,
	route?: string,
): Promise<void> {
	const payload: FeedbackPayload = {
		rating: input.rating,
		type: input.type,
		tags: input.tags,
		message: input.message?.trim() ? input.message.trim() : undefined,
		festival_id: FESTIVAL_ID,
		locale: i18n.locale,
		platform: resolvePlatform(),
		app_version: Constants.expoConfig?.version ?? null,
		context: buildFeedbackContext(route),
	};

	const supabase = getSupabaseClient();
	const { error } = await supabase.from("feedback").insert(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{
			festival_id: payload.festival_id,
			rating: payload.rating,
			type: payload.type,
			message: payload.message ?? null,
			tags: payload.tags,
			context: payload.context,
			locale: payload.locale,
			platform: payload.platform,
			app_version: payload.app_version,
		} as any,
	);

	if (error) throw new Error(error.message);
}
