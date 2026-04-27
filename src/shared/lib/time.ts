const WEEKDAYS_CA_FULL = [
	"Diumenge",
	"Dilluns",
	"Dimarts",
	"Dimecres",
	"Dijous",
	"Divendres",
	"Dissabte",
];
const MONTHS_CA = [
	"gener",
	"febrer",
	"març",
	"abril",
	"maig",
	"juny",
	"juliol",
	"agost",
	"setembre",
	"octubre",
	"novembre",
	"desembre",
];

/** "Dissabte 27 de juliol" – used in MapHeader */
export function formatDayFull(dateKey: string): string {
	const d = new Date(`${dateKey}T12:00:00`);
	return `${WEEKDAYS_CA_FULL[d.getDay()]} ${d.getDate()} de ${MONTHS_CA[d.getMonth()]}`;
}

/** "Dissabte 27" – used in MapEventsDrawer header */
export function formatDayShort(dateKey: string): string {
	const d = new Date(`${dateKey}T12:00:00`);
	return `${WEEKDAYS_CA_FULL[d.getDay()]} ${d.getDate()}`;
}

/** Returns "HH:MM" from an ISO 8601 string */
export function formatTime(isoString: string): string {
	const date = new Date(isoString);
	const h = date.getHours().toString().padStart(2, "0");
	const m = date.getMinutes().toString().padStart(2, "0");
	return `${h}:${m}`;
}

/** Returns "YYYY-MM-DD" - used as map/filter key */
export function toDateKey(date: Date): string {
	const y = date.getFullYear();
	const mo = (date.getMonth() + 1).toString().padStart(2, "0");
	const d = date.getDate().toString().padStart(2, "0");
	return `${y}-${mo}-${d}`;
}

/** Returns short Catalan label: "Ds 27" */
export function formatDayChip(date: Date): string {
	const day = date.getDate();
	const labels = ["Dg", "Dl", "Dm", "Dc", "Dj", "Dv", "Ds"];
	return `${labels[date.getDay()]} ${day}`;
}
