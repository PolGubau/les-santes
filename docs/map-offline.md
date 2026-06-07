# Mapa offline — estat actual i pla de millora

## Estat actual (què funciona avui)

`app/src/features/map/components/EventMap.tsx` ja és **offline-tolerant** a nivell d'app — però **no pre-descarrega tiles**. Concretament:

1. **MapLibre + Supercluster** són `file://` locals via `useLocalMapAssets`
   (es descarreguen una sola vegada del CDN, després viuen a `cacheDirectory/map/`). El mapa carrega sense xarxa.
2. **Estil primari**: MapTiler `streets-v2` si hi ha `EXPO_PUBLIC_MAPTILER_KEY`, si no l'estil gratuït `tiles.openfreemap.org/styles/liberty`.
3. **Fallback automàtic**: si MapTiler falla → openfreemap; si openfreemap també falla → overlay `MAP_OFFLINE` amb CTA "Veure agenda".
4. **Esdeveniments**: el GeoJSON d'events es serialitza a la WebView via `injectJavaScript` — ja viu en memòria, no requereix xarxa.

**El que NO funciona**: les **tiles raster/vector pròpiament dites no es cachegen entre sessions**. La WebView depèn del cache HTTP que el sistema buida agressivament. En una plaça saturada de cobertura, el mapa pot quedar en blanc.

## Per què no es pot implementar avui amb cost baix

MapLibre té API `offline` però **només a la versió nativa** (`@maplibre/maplibre-react-native`). La nostra implementació actual és **MapLibre GL JS dins d'una WebView** — bona decisió de DX i bundle size, però **no exposa offline packs**.

Migrar a `@maplibre/maplibre-react-native` per guanyar offline packs implica:

- Substituir tota la WebView + HTML + supercluster JS-side per components nadius.
- Re-escriure interaccions (markers, clusters, focus, sim time DEV) en API nadiva.
- Afegir un pod / autolinking nadiu — afecta build size i requereix prebuild config.
- ~3-5 dies + risc de regressions visuals.

**Veredicte**: no val la pena per a 2026 si l'app ja serveix mapa en fallback i el detall d'event té `EventMiniMap` independent.

## Pla incremental (sense migració nativa)

Tres millores barates que es poden fer ara, ordenades per cost:

### A) Pre-warm de l'estil i les tiles del centre (1-2 h) — **recomanat**

Aprofitar `useLocalMapAssets` per descarregar **també** la `style.json` i un grup limitat de tiles del bounding box del festival a la primera obertura del mapa.

Bbox de Mataró centre (ja codificat com `maxBounds`):
```
[[2.37, 41.49], [2.53, 41.59]]
```

A `zoom = 14-16` són ~150-250 tiles per estil. Mida estimada: 8-15 MB.

Passos:
1. Afegir constant `TILE_PRECACHE = false` (feature flag) a `EventMap.tsx`.
2. Estendre `prepareMapAssets()` perquè, si flag activat, faci `downloadAsync` de:
   - `style.json` (fixar URL a openfreemap perquè és estable i sense API key).
   - Els PNGs/PBFs de la `sources` declarada a l'estil (parse mínim).
3. Servir-los des de `file://` re-escrivint l'estil amb URL transformes (`transformRequest` a MapLibre GL JS).

Risc: els estils canvien sense avís → re-validar 1 cop / 24 h.

### B) Botó manual a Settings (4 h)

```tsx
// Settings > "Descarregar mapa offline (≈ 12 MB)"
```

Implementa **A** però gated darrere acció explícita de l'usuari → cap descàrrega no consentida. Mostra mida estimada, progrés, i botó "Esborrar mapa offline".

### C) Migració a MapLibre nadiu (3-5 d, **backlog**)

Quan el manteniment de la WebView sigui més car que la migració. Llavors `OfflinePack` resol això de manera estàndard.

## Què escriure si fas (A) o (B)

Esquema d'event Analytics:

```ts
track('map_offline_precache_started', { tiles: number, sizeMb: number });
track('map_offline_precache_completed', { durationMs: number });
track('map_offline_precache_failed', { stage: string, error: string });
```

Mostrar al banner quan l'usuari està servint **del cache**: `track('map_offline_hit')`.

## Decisió per a 2026

**No bloqueja release**. El fallback actual (openfreemap + agenda com a alternativa textual) cobreix el cas pitjor. Proposat per al sprint pre-festival (juny 2026): implementar opció (B) com a setting opt-in.
