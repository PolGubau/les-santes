/**
 * Prepares the MapLibre + Supercluster JS/CSS in the device cache directory
 * so the WebView can load them via file:// URIs (fully offline after first use).
 *
 * Strategy:
 *  1. On first launch (or after cache eviction), download from CDN and persist.
 *  2. On subsequent launches, use the cached copies — no network needed.
 *  3. Writes the HTML alongside the assets so relative paths resolve correctly.
 *
 * Why not expo-asset? Asset.fromModule() requires Metro to register binary files
 * (via assetExts), which is fragile with New Architecture and large files (~745 KB).
 * FileSystem.downloadAsync is simpler, more portable, and survives cache clears.
 */
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";

const CDN_BASE = "https://cdn.jsdelivr.net/npm";

const REMOTE_ASSETS = [
	{
		name: "maplibre-gl.js",
		url: `${CDN_BASE}/maplibre-gl@3.6.2/dist/maplibre-gl.js`,
	},
	{
		name: "maplibre-gl.css",
		url: `${CDN_BASE}/maplibre-gl@3.6.2/dist/maplibre-gl.css`,
	},
	{
		name: "supercluster.min.js",
		url: `${CDN_BASE}/supercluster@8.0.1/dist/supercluster.min.js`,
	},
] as const;

async function prepareMapAssets(htmlContent: string): Promise<string> {
	const mapDir = `${FileSystem.cacheDirectory}map/`;

	const dirInfo = await FileSystem.getInfoAsync(mapDir);
	if (!dirInfo.exists) {
		await FileSystem.makeDirectoryAsync(mapDir, { intermediates: true });
	}

	// Download each asset only if not already cached
	await Promise.all(
		REMOTE_ASSETS.map(async ({ name, url }) => {
			const dest = `${mapDir}${name}`;
			const info = await FileSystem.getInfoAsync(dest);
			if (!info.exists) {
				await FileSystem.downloadAsync(url, dest);
			}
		}),
	);

	// Write the HTML file alongside the assets so relative <script>/<link> paths work
	const htmlUri = `${mapDir}index.html`;
	await FileSystem.writeAsStringAsync(htmlUri, htmlContent, {
		encoding: FileSystem.EncodingType.UTF8,
	});

	return htmlUri;
}

export function useLocalMapAssets(htmlContent: string): string | null {
	const [htmlUri, setHtmlUri] = useState<string | null>(null);

	useEffect(() => {
		prepareMapAssets(htmlContent)
			.then(setHtmlUri)
			.catch((err) => console.error("[useLocalMapAssets]", err));
		// htmlContent is a stable module-level constant — safe to omit from deps
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return htmlUri;
}
