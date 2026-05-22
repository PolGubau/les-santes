import { i18n } from "@/shared/i18n";

/**
 * Date / time formatters.
 *
 * Locale comes from the i18n singleton (kept in sync with the locale store).
 * The navigation tree is keyed by `locale`, so a locale change triggers a
 * remount and these helpers are re-evaluated with the new language.
 */

/** Map app locale ('ca' | 'es' | 'en') to a BCP-47 tag for Intl APIs. */
function intlLocale(): string {
	switch (i18n.locale) {
		case "es":
			return "es-ES";
		case "en":
			return "en-GB";
		default:
			return "ca-ES";
	}
}

function capitalize(s: string): string {
	if (!s) return s;
	return s.charAt(0).toLocaleUpperCase(intlLocale()) + s.slice(1);
}

/** Parse a "YYYY-MM-DD" key as noon local time to avoid TZ boundary issues. */
function dateFromKey(dateKey: string): Date {
	return new Date(`${dateKey}T12:00:00`);
}

/** "Dissabte 27 de juliol" / "Saturday 27 July" / "Sábado 27 de julio" */
export function formatDayFull(dateKey: string): string {
	const d = dateFromKey(dateKey);
	const locale = intlLocale();
	const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d);
	const dayMonth = new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "long",
	}).format(d);
	return `${capitalize(weekday)} ${dayMonth}`;
}

/** "Dissabte 27" / "Saturday 27" / "Sábado 27" */
export function formatDayShort(dateKey: string): string {
	const d = dateFromKey(dateKey);
	const weekday = new Intl.DateTimeFormat(intlLocale(), {
		weekday: "long",
	}).format(d);
	return `${capitalize(weekday)} ${d.getDate()}`;
}

/** Returns "HH:MM" from an ISO 8601 string (24h, locale-independent). */
export function formatTime(isoString: string): string {
	const date = new Date(isoString);
	const h = date.getHours().toString().padStart(2, "0");
	const m = date.getMinutes().toString().padStart(2, "0");
	return `${h}:${m}`;
}

/** Returns "YYYY-MM-DD" - used as map/filter key. Locale-independent. */
export function toDateKey(date: Date): string {
	const y = date.getFullYear();
	const mo = (date.getMonth() + 1).toString().padStart(2, "0");
	const d = date.getDate().toString().padStart(2, "0");
	return `${y}-${mo}-${d}`;
}

/**
 * Festival day key — same as toDateKey but midnight–06:00 belongs to the previous day.
 * Events at 01:00 AM Sunday are considered "Saturday night" of the festival.
 */
export function toFestivalDayKey(date: Date): string {
	const adjusted = new Date(date.getTime() - 6 * 60 * 60 * 1000);
	return toDateKey(adjusted);
}

/** Short weekday + day-of-month chip: "Ds 27" / "Sat 27" / "Sáb 27" */
export function formatDayChip(date: Date): string {
	const weekday = new Intl.DateTimeFormat(intlLocale(), {
		weekday: "short",
	}).format(date);
	// Intl appends "." in some locales (e.g. "sáb."). Strip trailing punctuation.
	const cleaned = weekday.replace(/\.$/, "");
	return `${capitalize(cleaned)} ${date.getDate()}`;
}

/** Same as formatDayChip but takes a "YYYY-MM-DD" key. */
export function formatDayChipFromKey(dateKey: string): string {
	return formatDayChip(dateFromKey(dateKey));
}
