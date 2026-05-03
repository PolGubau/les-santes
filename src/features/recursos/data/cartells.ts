/* eslint-disable @typescript-eslint/no-require-imports */
import type { PosterEntry } from "../types";
import { POSTER_ASSETS } from "./posterAssets";

interface RawPoster {
	year: number;
	author?: string;
	description?: string;
}

// Metro/Node require — JSON outside the src/ alias tree
const POSTERS_JSON: RawPoster[] = require("../../../shared/data/posters.json");

// Years that appear more than once in the JSON (two official posters that year)
const DUPLICATE_YEARS = new Set([1975, 1976]);

/**
 * Full festival poster catalogue, newest-first (matches JSON order).
 * Each entry has a stable string ID (its array index) for navigation.
 */
const yearSeenCount: Record<number, number> = {};

export const POSTERS: PosterEntry[] = (POSTERS_JSON as RawPoster[]).map(
	(entry, index) => {
		yearSeenCount[entry.year] = (yearSeenCount[entry.year] ?? 0) + 1;
		const count = yearSeenCount[entry.year];

		let assetKey = String(entry.year);
		if (DUPLICATE_YEARS.has(entry.year) && count > 1) {
			assetKey = `${entry.year}-${count}`;
		}

		return {
			id: String(index),
			year: entry.year,
			author: entry.author,
			description: entry.description,
			asset: POSTER_ASSETS[assetKey],
		};
	},
);
