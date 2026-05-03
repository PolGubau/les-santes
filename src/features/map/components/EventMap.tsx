import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';
import { WifiOff } from 'lucide-react-native';
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

const CENTER_LNG = 2.444;
const CENTER_LAT = 41.5378;

// Mataró bounding box — restricts map panning
const BOUNDS = [[2.39, 41.51], [2.51, 41.57]];

// MapTiler key — set EXPO_PUBLIC_MAPTILER_KEY in EAS secrets / .env
// Falls back to bundled key so the map works even without the env var.
declare const process: { env: Record<string, string | undefined> };
const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY ?? 'xvhIdcAsn7WrwOYPt8W2';

const BASE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link href="https://cdn.jsdelivr.net/npm/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/supercluster@8.0.1/dist/supercluster.min.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body,#map { width:100%; height:100vh; background:#FAF8F5; }
    .m-wrap { display:flex; flex-direction:column; align-items:center; cursor:pointer; user-select:none; }
    .m-wrap:active .m-pin { transform:scale(1.12); }
    .m-pin { width:34px; height:34px; border-radius:50%; display:flex; align-items:center;
      justify-content:center; border:2px solid rgba(255,255,255,0.6);
      box-shadow:0 2px 6px rgba(0,0,0,0.18); transition:transform .15s ease, box-shadow .15s ease; }
    .m-pin.selected { transform:scale(1.38);
      box-shadow:0 0 0 3px rgba(255,255,255,0.95), 0 4px 20px rgba(0,0,0,0.32);
      border-color:rgba(255,255,255,0.95) !important; }
    .m-pin.finished { opacity:0.35; filter:grayscale(0.65); }
    .m-pin .pin-icon { font-size:15px; line-height:1; user-select:none; }
    .m-label { margin-top:3px; font-size:10px; font-weight:700; color:#1A1110;
      text-shadow:0 1px 3px rgba(250,248,245,0.95); max-width:76px; text-align:center;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; letter-spacing:.01em;
      transition:font-size .15s ease; }
    .m-label.selected { font-size:11.5px; font-weight:800; color:#0A0908; }
    .m-cluster-wrap { display:inline-flex; cursor:pointer; user-select:none; }
    .m-cluster { width:42px; height:42px; border-radius:50%; background:#1D4ED8;
      border:3px solid #fff; display:flex; align-items:center; justify-content:center;
      font-size:13px; font-weight:800; color:#fff;
      box-shadow:0 2px 10px rgba(0,0,0,0.2); transition:transform .1s; font-family:sans-serif; }
    .m-cluster-wrap:active .m-cluster { transform:scale(1.1); }
  </style>
</head>
<body>
<div id="map"></div>
<script>
const STATE_COLOR = { now:'#007A5A', upcoming:'#1D4ED8', finished:'#9CA3AF' };
// Metro-style route palette — vivid, high-contrast, clearly distinct
const ROUTE_PALETTE = [
  '#E63946','#FF6B35','#F7C948','#2EC4B6','#3A86FF',
  '#8338EC','#FB5607','#06D6A0','#EF476F','#118AB2',
];
function routeColor(eventId) {
  let h = 0;
  for (let i = 0; i < eventId.length; i++) h = (Math.imul(31, h) + eventId.charCodeAt(i)) | 0;
  return ROUTE_PALETTE[Math.abs(h) % ROUTE_PALETTE.length];
}
// Lucide icon name → emoji (zero external deps)
const ICON_EMOJI = {
  Image:'📸', Mic:'🎤', Users:'👥', Music:'🎵', Megaphone:'📢',
  Flag:'🚩', Flame:'🔥', Crown:'👑', Sailboat:'⛵', Bell:'🔔',
  Church:'⛪', Smile:'😊', BookOpen:'📖', Wand2:'✨', Sparkles:'✨',
  Star:'⭐', MapPin:'📍',
};
function resolveIcon(icon) {
  if (!icon) return '📍';
  const n = typeof icon === 'string' ? icon : (icon.name || '');
  return ICON_EMOJI[n] || '📍';
}
function post(msg) {
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
}

// ── Marker elements ───────────────────────────────────────────────────────────
function makeMarkerEl(event, overrideColor) {
  const color = overrideColor || STATE_COLOR[event.state] || '#888';
  const finished = event.state === 'finished';
  const selected = event.id === _selectedId;
  const wrap = document.createElement('div');
  wrap.className = 'm-wrap';
  wrap.dataset.eventId = event.id;
  const pin = document.createElement('div');
  pin.className = 'm-pin' + (finished ? ' finished' : '') + (selected ? ' selected' : '');
  pin.style.background = color;
  pin.style.borderColor = finished ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)';
  const ic = document.createElement('span');
  ic.className = 'pin-icon';
  ic.textContent = resolveIcon(event.icon);
  pin.appendChild(ic);
  const lbl = document.createElement('div');
  lbl.className = 'm-label' + (selected ? ' selected' : '');
  lbl.textContent = event.title;
  wrap.appendChild(pin);
  wrap.appendChild(lbl);
  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    selectEvent(event.id);
    post({ type:'EVENT_PRESS', event });
  });
  return wrap;
}
function makeClusterEl(count, onClick) {
  const wrap = document.createElement('div');
  wrap.className = 'm-cluster-wrap';
  const el = document.createElement('div');
  el.className = 'm-cluster';
  el.textContent = '+' + count;
  wrap.appendChild(el);
  wrap.addEventListener('click', onClick);
  return wrap;
}

// ── Map ───────────────────────────────────────────────────────────────────────
const STYLE_PRIMARY  = 'https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}';
const STYLE_FALLBACK = 'https://tiles.openfreemap.org/styles/liberty';
let _styleFailed = false;
let _offlineNotified = false;
const map = new maplibregl.Map({
  container:'map', style:STYLE_PRIMARY,
  center:[${CENTER_LNG}, ${CENTER_LAT}], zoom:14.5, minZoom:12, maxZoom:19,
  maxBounds:[[2.37,41.49],[2.53,41.59]], attributionControl:false,
});
map.on('error', (e) => {
  // Catch both network failures (no status) and HTTP errors (status >= 400)
  const isNetworkOrServerError = !e?.error?.status || e.error.status >= 400;
  if (!isNetworkOrServerError || _offlineNotified) return;
  if (!_styleFailed) {
    _styleFailed = true;
    map.setStyle(STYLE_FALLBACK);
  } else {
    _offlineNotified = true;
    post({ type: 'MAP_OFFLINE' });
  }
});

// ── State ─────────────────────────────────────────────────────────────────────
let _staticMarkers = [], _clusterMarkers = [], _routeMarkers = [];
let _routeLayerIds = [], _routeSourceIds = [];
let _userMarker = null, _mapReady = false, _pending = null;
let _selectedId = null;
const sc = new Supercluster({ radius:55, maxZoom:16 });
let _scLoaded = false;

// ── Helpers ───────────────────────────────────────────────────────────────────
function clearStaticMarkers() {
  _staticMarkers.forEach(m => m.remove()); _staticMarkers = [];
  _clusterMarkers.forEach(m => m.remove()); _clusterMarkers = [];
}
function clearRoutes() {
  // Remove layers BEFORE sources (MapLibre requirement)
  _routeLayerIds.forEach(id => { try { if (map.getLayer(id)) map.removeLayer(id); } catch(e){} });
  _routeSourceIds.forEach(id => { try { if (map.getSource(id)) map.removeSource(id); } catch(e){} });
  _routeLayerIds = []; _routeSourceIds = [];
  // Route start markers are tracked separately — not in _staticMarkers
  _routeMarkers.forEach(m => m.remove()); _routeMarkers = [];
}

// ── Cluster update ────────────────────────────────────────────────────────────
function renderClusters() {
  if (!_scLoaded) return;
  clearStaticMarkers();
  const b = map.getBounds();
  const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
  const zoom = Math.floor(map.getZoom());
  sc.getClusters(bbox, zoom).forEach(f => {
    const [lng, lat] = f.geometry.coordinates;
    if (f.properties.cluster) {
      const count = f.properties.point_count;
      const cid = f.properties.cluster_id;
      const el = makeClusterEl(count, () => {
        const z = sc.getClusterExpansionZoom(cid);
        map.easeTo({ center:[lng,lat], zoom:z+0.5, duration:350 });
      });
      _clusterMarkers.push(new maplibregl.Marker({ element:el }).setLngLat([lng,lat]).addTo(map));
    } else {
      const event = f.properties._event;
      const el = makeMarkerEl(event);
      _staticMarkers.push(new maplibregl.Marker({ element:el }).setLngLat([lng,lat]).addTo(map));
    }
  });
}

// ── Arrow SDF image (generated once on map load) ─────────────────────────────
function addArrowImage() {
  const size = 32;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  // Draw a right-pointing chevron (›) centred in the canvas
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(9,  8);
  ctx.lineTo(22, 16);
  ctx.lineTo(9,  24);
  ctx.lineTo(12, 16);
  ctx.closePath();
  ctx.fill();
  const imgData = ctx.getImageData(0, 0, size, size);
  map.addImage('route-arrow', { width:size, height:size, data:imgData.data }, { sdf:true });
}

// ── Route rendering (metro style) ────────────────────────────────────────────
function renderRoute(event) {
  const color = routeColor(event.id);
  const finished = event.state === 'finished';
  const opacity = finished ? 0.45 : 1;
  const coords = event.route.map(p => [p.lng, p.lat]);
  const srcId = 'route-' + event.id;
  _routeSourceIds.push(srcId);
  map.addSource(srcId, {
    type:'geojson',
    data:{ type:'Feature', properties:{}, geometry:{ type:'LineString', coordinates:coords } },
  });

  const isSelected = event.id === _selectedId;

  // Layer order: casing (bottom) → fill → arrows (top)
  // 1. White casing — metro "border" feel
  const casingId = srcId + '-casing';
  _routeLayerIds.push(casingId);
  map.addLayer({
    id:casingId, type:'line', source:srcId,
    layout:{ 'line-cap':'round', 'line-join':'round' },
    paint:{ 'line-color':'#ffffff', 'line-width': isSelected ? 18 : 8, 'line-opacity': finished ? 0.28 : 0.9 },
  });

  // 2. Vivid colored fill on top of casing
  const lineId = srcId + '-line';
  _routeLayerIds.push(lineId);
  map.addLayer({
    id:lineId, type:'line', source:srcId,
    layout:{ 'line-cap':'round', 'line-join':'round' },
    paint:{ 'line-color':color, 'line-width': isSelected ? 11 : 5, 'line-opacity':opacity },
  });

  // 3. Directional arrow symbols spaced along the line
  if (!finished) {
    const arrowId = srcId + '-arrows';
    _routeLayerIds.push(arrowId);
    map.addLayer({
      id:arrowId, type:'symbol', source:srcId,
      layout:{
        'symbol-placement':'line',
        'symbol-spacing':80,
        'icon-image':'route-arrow',
        'icon-size':0.55,
        'icon-allow-overlap':true,
        'icon-ignore-placement':true,
        'icon-rotation-alignment':'map',
      },
      paint:{ 'icon-color':'#ffffff', 'icon-opacity':0.9 },
    });
  }

  map.on('click', lineId,   () => { selectEvent(event.id); post({ type:'EVENT_PRESS', event }); });
  map.on('click', casingId, () => { selectEvent(event.id); post({ type:'EVENT_PRESS', event }); });

  // Start-of-route marker — tracked separately so renderClusters() doesn't wipe it
  const el = makeMarkerEl(event, color);
  _routeMarkers.push(new maplibregl.Marker({ element:el }).setLngLat(coords[0]).addTo(map));
}

// ── Main render ───────────────────────────────────────────────────────────────
function renderEvents(events) {
  clearStaticMarkers();
  clearRoutes();
  const points = [];
  events.forEach(event => {
    if (event.kind === 'static' && event.location)
      points.push({ type:'Feature',
        geometry:{ type:'Point', coordinates:[event.location.lng, event.location.lat] },
        properties:{ _event:event } });
    if (event.kind === 'mobile' && event.route && event.route.length > 1)
      renderRoute(event);
  });
  sc.load(points); _scLoaded = true;
  renderClusters();
}

map.on('moveend', renderClusters);

// ── Selection ─────────────────────────────────────────────────────────────────
function selectEvent(id) {
  const prev = _selectedId;
  _selectedId = id;

  // 1. Refresh cluster/static markers (makeMarkerEl reads _selectedId)
  renderClusters();

  // 2. Update route start markers
  _routeMarkers.forEach(m => {
    const el = m.getElement();
    const eid = el.dataset.eventId;
    el.querySelector('.m-pin')?.classList.toggle('selected', eid === id);
    el.querySelector('.m-label')?.classList.toggle('selected', eid === id);
  });

  // 3. Animate route line widths via paint properties
  const thin  = { casing: 8,  line: 5  };
  const thick = { casing: 18, line: 11 };
  [prev, id].forEach(eid => {
    if (!eid) return;
    const w = eid === id ? thick : thin;
    const lId = 'route-' + eid + '-line';
    const cId = 'route-' + eid + '-casing';
    try { if (map.getLayer(lId)) map.setPaintProperty(lId, 'line-width', w.line); } catch(e) {}
    try { if (map.getLayer(cId)) map.setPaintProperty(cId, 'line-width', w.casing); } catch(e) {}
  });
}

// ── Public API ────────────────────────────────────────────────────────────────
window.updateEvents = function(events) {
  if (_mapReady) renderEvents(events); else _pending = events;
};
window.selectEvent = function(id) { selectEvent(id); };
window.focusOnEvent = function(id, allEvents) {
  selectEvent(id);
  const ev = allEvents.find(e => e.id === id);
  if (!ev) return;
  const center = ev.kind === 'static' && ev.location
    ? [ev.location.lng, ev.location.lat]
    : ev.route && ev.route.length ? [ev.route[0].lng, ev.route[0].lat] : null;
  if (center) map.easeTo({ center, zoom:16.5, duration:600 });
};
window.updateUserLocation = function(lat, lng) {
  if (!_mapReady) return;
  const ll = [lng, lat];
  if (_userMarker) { _userMarker.setLngLat(ll); return; }
  const el = document.createElement('div');
  el.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#007AFF;' +
    'border:3px solid #fff;box-shadow:0 0 0 5px rgba(0,122,255,0.22);';
  _userMarker = new maplibregl.Marker({ element:el }).setLngLat(ll).addTo(map);
};

map.on('style.load', () => {
  addArrowImage();
  if (!_mapReady) {
    _mapReady = true;
    post({ type:'MAP_READY' });
  }
  if (_pending) { renderEvents(_pending); _pending = null; }
  else if (_scLoaded) renderClusters();
});
</script>
</body>
</html>`;

export interface EventMapHandle {
  focusOnEvent: (id: string) => void;
  deselect: () => void;
}

interface Props {
  events: Event[];
  onEventPress?: (event: Event) => void;
}

export const EventMap = memo(forwardRef<EventMapHandle, Props>(function EventMap(
  { events, onEventPress },
  ref,
) {
  const webviewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapOffline, setMapOffline] = useState(false);
  const loaderOpacity = useRef(new Animated.Value(1)).current;
  const pendingFocusId = useRef<string | null>(null);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  const injectFocus = useCallback((id: string) => {
    const js = `window.focusOnEvent(${JSON.stringify(id)}, ${JSON.stringify(eventsRef.current)}); true;`;
    webviewRef.current?.injectJavaScript(js);
  }, []);

  useImperativeHandle(ref, () => ({
    focusOnEvent: (id: string) => {
      if (!mapReady) {
        pendingFocusId.current = id;
        return;
      }
      injectFocus(id);
    },
    deselect: () => {
      webviewRef.current?.injectJavaScript('window.selectEvent(null); true;');
    },
  }), [injectFocus, mapReady]);

  // Keep screen on while map is visible
  useEffect(() => {
    activateKeepAwakeAsync();
    return () => { deactivateKeepAwake(); };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    const js = `window.updateEvents(${JSON.stringify(events)}); true;`;
    webviewRef.current?.injectJavaScript(js);
  }, [events, mapReady]);

  useEffect(() => {
    if (!mapReady || !pendingFocusId.current) return;
    injectFocus(pendingFocusId.current);
    pendingFocusId.current = null;
  }, [injectFocus, mapReady]);

  // Native location → WebView bridge
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        ({ coords }) => {
          const js = `window.updateUserLocation(${coords.latitude}, ${coords.longitude}); true;`;
          webviewRef.current?.injectJavaScript(js);
        },
      );
    })();
    return () => { sub?.remove(); };
  }, []);

  const handleMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setMapReady(true);
        Animated.timing(loaderOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } else if (data.type === 'EVENT_PRESS' && onEventPress) {
        onEventPress(data.event as Event);
      } else if (data.type === 'MAP_OFFLINE') {
        setMapOffline(true);
        // Fade out the loader (prevents it from staying on top of offline overlay)
        Animated.timing(loaderOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } catch { /* ignore */ }
  }, [loaderOpacity, onEventPress]);

  return (
    <View style={styles.map}>
      <WebView
        ref={webviewRef}
        style={StyleSheet.absoluteFill}
        source={{ html: BASE_HTML, baseUrl: 'https://localhost' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
      />

      {/* Loader overlay — fades out when MAP_READY fires */}
      <Animated.View
        style={[styles.loader, { opacity: loaderOpacity }]}
        pointerEvents={mapReady ? 'none' : 'auto'}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loaderText}>Carregant el mapa…</Text>
      </Animated.View>

      {/* Offline overlay — shown when both tile sources fail */}
      {mapOffline && (
        <View style={styles.offlineOverlay}>
          <WifiOff size={40} color={Colors.textMuted} />
          <Text style={styles.offlineTitle}>Mapa no disponible</Text>
          <Text style={styles.offlineBody}>
            El mapa necessita connexió a internet per carregar les tessel·les.
            La resta de l'app segueix funcionant amb les dades desades.
          </Text>
          <Pressable
            style={styles.offlineBtn}
            onPress={() => {
              setMapOffline(false);
              webviewRef.current?.reload();
            }}
          >
            <Text style={styles.offlineBtnText}>Torna-ho a intentar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}));

const styles = StyleSheet.create({
  map: { flex: 1 },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  offlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  offlineTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  offlineBody: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  offlineBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.primary,
  },
  offlineBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
