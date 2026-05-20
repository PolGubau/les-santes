/**
 * Minimal RFC4122 v4 generator. Used only as a stable install identifier —
 * non‑cryptographic. Prefers `globalThis.crypto.randomUUID` when available
 * (Hermes / RN ≥ 0.76 expose it) and falls back to Math.random otherwise.
 */
export function uuidv4(): string {
	const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
	if (c?.randomUUID) return c.randomUUID();

	// RFC4122 v4 fallback
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
		const r = (Math.random() * 16) | 0;
		const v = ch === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
