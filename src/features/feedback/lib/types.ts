/**
 * Public types for the in-app feedback feature.
 *
 * Kept dependency-free so the UI layer, the API layer and the store can
 * share them without creating cycles.
 */

export type FeedbackType = "bug" | "suggestion" | "general";

export type FeedbackTag =
	| "map"
	| "events"
	| "agenda"
	| "navigation"
	| "language"
	| "design"
	| "performance"
	| "data"
	| "other";

/** Snapshot of usage context captured automatically at submit time. */
export interface FeedbackContext {
	route?: string;
	sessionSeconds: number;
	favoritesCount: number;
	appOpens: number;
	eventViews: number;
	mapVisits: number;
	agendaVisits: number;
}

/** What the modal collects from the user. */
export interface FeedbackInput {
	rating: number;
	type: FeedbackType;
	message?: string;
	tags: FeedbackTag[];
}

/** Final wire shape that hits Supabase. */
export interface FeedbackPayload extends FeedbackInput {
	festival_id: string;
	locale: string;
	platform: "ios" | "android" | "web";
	app_version: string | null;
	context: FeedbackContext;
}

export const FEEDBACK_TYPES: readonly FeedbackType[] = [
	"bug",
	"suggestion",
	"general",
] as const;

export const FEEDBACK_TAGS: readonly FeedbackTag[] = [
	"map",
	"events",
	"agenda",
	"navigation",
	"language",
	"design",
	"performance",
	"data",
	"other",
] as const;

export const FEEDBACK_MESSAGE_MAX = 500;
