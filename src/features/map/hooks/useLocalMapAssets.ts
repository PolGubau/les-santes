/**
 * Copies map library assets (MapLibre, Supercluster) from the app bundle
 * into the device cache directory so the WebView can load them via file:// URIs.
 *
 * Returns the URI of the generated index.html once ready.
 */
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";

// Metro requires static require() — no dynamic paths.
// .js files are treated as source modules by Metro, so we use the .pack
// extension (registered in metro.config.js assetExts) for the JS bundles.
const MAP_ASSETS = {
	js: require("../../../../assets/web/maplibre-gl.pack"),
	css: require("../../../../assets/web/maplibre-gl.css"),
	supercluster: require("../../../../assets/web/supercluster.pack"),
} as const;

async function prepareMapAssets(htmlContent: string): Promise<string> {
	// Defer cacheDirectory access to runtime (inside async fn) to avoid
	// triggering TurboModule initialization at module evaluation time.
	const mapDir = `${FileSystem.cacheDirectory}map/`;

	// Ensure the cache directory exists
	const dirInfo = await FileSystem.getInfoAsync(mapDir);
	if (!dirInfo.exists) {
		await FileSystem.makeDirectoryAsync(mapDir, { intermediates: true });
	}

	// Download each asset from the bundle and copy to the cache dir
	const [jsAsset, cssAsset, scAsset] = await Promise.all([
		Asset.fromModule(MAP_ASSETS.js).downloadAsync(),
		Asset.fromModule(MAP_ASSETS.css).downloadAsync(),
		Asset.fromModule(MAP_ASSETS.supercluster).downloadAsync(),
	]);

	if (!jsAsset.localUri || !cssAsset.localUri || !scAsset.localUri) {
		throw new Error(
			"[useLocalMapAssets] Asset localUri is null after downloadAsync",
		);
	}

	await Promise.all([
		FileSystem.copyAsync({
			from: jsAsset.localUri,
			to: `${mapDir}maplibre-gl.js`,
		}),
		FileSystem.copyAsync({
			from: cssAsset.localUri,
			to: `${mapDir}maplibre-gl.css`,
		}),
		FileSystem.copyAsync({
			from: scAsset.localUri,
			to: `${mapDir}supercluster.min.js`,
		}),
	]);

	// Write the HTML file alongside the assets so relative paths resolve
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
		// htmlContent is a module-level constant — safe to omit from deps
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return htmlUri;
}
