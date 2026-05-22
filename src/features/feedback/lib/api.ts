import { FESTIVAL_ID } from "@/shared/constants";
import { i18n, t } from "@/shared/i18n";
import { getSupabaseClient } from "@/shared/lib/supabase";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { buildFeedbackContext } from "./context";
import type { FeedbackInput, FeedbackPayload } from "./types";

/** Hard ceiling on how long we wait for the Supabase insert to resolve. */
const REQUEST_TIMEOUT_MS = 12_000;

function resolvePlatform(): FeedbackPayload["platform"] {
	if (Platform.OS === "ios" || Platform.OS === "android") return Platform.OS;
	return "web";
}

interface SubmitOptions {
	/** When triggered, the submission is aborted (e.g. user closes the modal). */
	signal?: AbortSignal;
}

/**
 * Persist a feedback submission. The caller passes only what the user
 * actually filled in; context, locale, platform and app version are
 * resolved here so the UI stays UI.
 *
 * Cancellation: pass an AbortSignal to bail out when the user dismisses the
 * modal or navigates away. A `REQUEST_TIMEOUT_MS` hard timeout also fires
 * so a hung network call can never leave the submit button spinning forever.
 */
export async function submitFeedback(
	input: FeedbackInput,
	route?: string,
	options: SubmitOptions = {},
): Promise<void> {
	if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");

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
	const insertPromise = supabase.from("feedback").insert(
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

	const { error } = await raceWithSignalAndTimeout(insertPromise, options.signal);
	if (error) throw new Error(error.message);
}

/**
 * Race a thenable against an AbortSignal and a timeout.
 * The original supabase request is not actually cancelled (the client doesn't
 * expose abort), but we stop waiting on it so the UI can recover immediately.
 */
function raceWithSignalAndTimeout<T extends { error: { message: string } | null }>(
	promise: PromiseLike<T>,
	signal: AbortSignal | undefined,
): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		let settled = false;
		const finish = (fn: () => void) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			signal?.removeEventListener("abort", onAbort);
			fn();
		};

		const onAbort = () => finish(() => reject(new DOMException("Aborted", "AbortError")));
		signal?.addEventListener("abort", onAbort);

		const timeoutId = setTimeout(
			() => finish(() => reject(new Error(t("feedback.error")))),
			REQUEST_TIMEOUT_MS,
		);

		Promise.resolve(promise).then(
			(value) => finish(() => resolve(value)),
			(err) => finish(() => reject(err)),
		);
	});
}
