/**
 * scrape-program.ts — Descarrega el programa resumit de lessantes.cat i desa
 * l'HTML de l'element <santes-paper-program> a internal/data/events-YYYY.html.
 *
 * La pàgina és SSR: no cal cap navegador headless.
 *
 * Usage:
 *   npx tsx scripts/scrape-program.ts
 *   npx tsx scripts/scrape-program.ts --year 2027
 *   npx tsx scripts/scrape-program.ts --url https://... --out internal/data/custom.html
 *
 * El fitxer de sortida és directament llegible per la IA per comparar
 * contra la BD (mock-YYYY.ts / seed-events.ts).
 */

import { writeFileSync } from "fs";
import { join } from "path";

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const arg = (flag: string): string | undefined => {
	const i = args.indexOf(flag);
	return i !== -1 ? args[i + 1] : undefined;
};

const YEAR = arg("--year") ?? "2026";
const URL_TARGET =
	arg("--url") ??
	`https://www.lessantes.cat/les-santes-${YEAR}/programa-resumit-1`;
const OUT_FILE =
	arg("--out") ??
	join(__dirname, "..", "internal", "data", `events-${YEAR}.html`);

const CLASS_MARKER = "santes-paper-program";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extreu el primer element HTML que té CLASS_MARKER al seu atribut class.
 * Fa un compte de nesting per trobar el tag de tancament correcte.
 */
function extractElement(html: string, classMarker: string): string {
	// Trova l'índex del primer atribut class que conté el marcador
	const classIdx = html.indexOf(`class="${classMarker}`);
	if (classIdx === -1) {
		throw new Error(`No element with class "${classMarker}" found in page.`);
	}

	// Camina enrere per trobar l'inici del tag d'obertura
	let openStart = classIdx;
	while (openStart > 0 && html[openStart] !== "<") openStart--;

	// Extreu el nom del tag (e.g. "article", "div", "section")
	const tagMatch = html.slice(openStart).match(/^<([a-zA-Z][a-zA-Z0-9]*)/);
	if (!tagMatch) throw new Error("Could not determine tag name.");
	const tagName = tagMatch[1];

	// Localitza el final del tag d'obertura (>)
	const openEnd = html.indexOf(">", openStart);

	// Compta el nesting per trobar el </tagName> corresponent
	const closeTag = `</${tagName}>`;
	let depth = 1;
	let pos = openEnd + 1;

	while (pos < html.length && depth > 0) {
		const nextOpen = html.indexOf(`<${tagName}`, pos);
		const nextClose = html.indexOf(closeTag, pos);

		if (nextClose === -1) throw new Error(`Closing </${tagName}> not found.`);

		if (nextOpen !== -1 && nextOpen < nextClose) {
			depth++;
			pos = nextOpen + 1;
		} else {
			depth--;
			pos = nextClose + closeTag.length;
		}
	}

	return html.slice(openStart, pos);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
	console.log(`🌐  Fetching: ${URL_TARGET}`);

	const res = await fetch(URL_TARGET, {
		headers: {
			// Evita bloquejos per User-Agent bàsic
			"User-Agent":
				"Mozilla/5.0 (compatible; les-santes-scraper/1.0; +https://github.com/PolGubau)",
			Accept: "text/html,application/xhtml+xml",
		},
	});

	if (!res.ok) {
		throw new Error(`HTTP ${res.status} ${res.statusText} → ${URL_TARGET}`);
	}

	const rawHtml = await res.text();
	console.log(`   ✓  Downloaded ${(rawHtml.length / 1024).toFixed(1)} KB`);

	const elementHtml = extractElement(rawHtml, CLASS_MARKER);
	console.log(
		`   ✓  Extracted .${CLASS_MARKER} (${(elementHtml.length / 1024).toFixed(1)} KB)`,
	);

	// Compta ítems per donar feedback ràpid
	const itemCount = (elementHtml.match(/class="program-item"/g) ?? []).length;
	console.log(`   ✓  ${itemCount} program-item(s) found`);

	writeFileSync(OUT_FILE, elementHtml, "utf8");
	console.log(`\n✅  Saved → ${OUT_FILE}`);
	console.log(
		`\nNext step: ask the AI to compare ${OUT_FILE} against mock-${YEAR}.ts or the Supabase events table.`,
	);
}

main().catch((err) => {
	console.error("❌ ", err.message ?? err);
	process.exit(1);
});
