import type { Event } from '@/entities/event';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

const CENTER_LNG = 2.444;
const CENTER_LAT = 41.5378;

// Mataró bounding box — restricts map panning
const BOUNDS = [[2.39, 41.51], [2.51, 41.57]];

const BASE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link href="https://unpkg.com/maplibre-gl@5.1.0/dist/maplibre-gl.css" rel="stylesheet">
  <script src="https://unpkg.com/maplibre-gl@5.1.0/dist/maplibre-gl.js"></script>
  <script src="https://unpkg.com/supercluster@8/dist/supercluster.min.js"></script>
  <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body,#map { width:100%; height:100vh; background:#0d0d0d; }
    .m-wrap { display:flex; flex-direction:column; align-items:center; cursor:pointer; user-select:none; }
    .m-wrap:active .m-pin { transform:scale(1.18); }
    .m-pin { width:38px; height:38px; border-radius:50%; display:flex; align-items:center;
      justify-content:center; border:2.5px solid rgba(255,255,255,0.35);
      box-shadow:0 2px 8px rgba(0,0,0,0.5); transition:transform .12s; }
    .m-pin.finished { opacity:0.35; filter:grayscale(0.65); }
    .m-pin ion-icon { font-size:18px; color:#fff; --ionicon-stroke-width:40; }
    .m-label { margin-top:3px; font-size:10px; font-weight:700; color:#fff;
      text-shadow:0 1px 4px rgba(0,0,0,0.9); max-width:76px; text-align:center;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; letter-spacing:.01em; }
    .m-cluster { width:42px; height:42px; border-radius:50%; background:#4A9EFF;
      border:3px solid #fff; display:flex; align-items:center; justify-content:center;
      font-size:13px; font-weight:800; color:#fff; cursor:pointer;
      box-shadow:0 2px 10px rgba(0,0,0,0.5); transition:transform .1s; font-family:sans-serif; }
    .m-cluster:active { transform:scale(1.1); }
  </style>
</head>
<body>
<div id="map"></div>
<script>
const STATE_COLOR = { now:'#00C896', upcoming:'#4A9EFF', finished:'#888' };
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
// MaterialCommunityIcons → Ionicons name mapping
const ICON_MAP = { 'account-group':'people', 'fire':'flame', 'crown':'trophy',
  'flag':'flag', 'candle':'flame', 'church':'business', 'bell-ring':'notifications',
  'firework':'sparkles', 'hat-fedora':'ticket-outline', 'fireworks':'sparkles' };

function resolveIcon(icon) {
  if (!icon) return 'location';
  const n = typeof icon === 'string' ? icon : (icon.name || 'location');
  return ICON_MAP[n] || n;
}
function post(msg) {
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
}

// ── Marker elements ───────────────────────────────────────────────────────────
function makeMarkerEl(event, overrideColor) {
  const color = overrideColor || STATE_COLOR[event.state] || '#888';
  const finished = event.state === 'finished';
  const wrap = document.createElement('div');
  wrap.className = 'm-wrap';
  const pin = document.createElement('div');
  pin.className = 'm-pin' + (finished ? ' finished' : '');
  pin.style.background = color;
  pin.style.borderColor = finished ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)';
  const ic = document.createElement('ion-icon');
  ic.setAttribute('name', resolveIcon(event.icon));
  pin.appendChild(ic);
  const lbl = document.createElement('div');
  lbl.className = 'm-label';
  lbl.textContent = event.title;
  wrap.appendChild(pin);
  wrap.appendChild(lbl);
  wrap.addEventListener('click', (e) => { e.stopPropagation(); post({ type:'EVENT_PRESS', event }); });
  return wrap;
}
function makeClusterEl(count, onClick) {
  const el = document.createElement('div');
  el.className = 'm-cluster';
  el.textContent = '+' + count;
  el.addEventListener('click', onClick);
  return el;
}

// ── Map ───────────────────────────────────────────────────────────────────────
const map = new maplibregl.Map({
  container:'map', style:'https://tiles.openfreemap.org/styles/liberty',
  center:[${CENTER_LNG}, ${CENTER_LAT}], zoom:14.5, minZoom:12, maxZoom:19,
  maxBounds:[[2.37,41.49],[2.53,41.59]], attributionControl:false,
});

// ── State ─────────────────────────────────────────────────────────────────────
let _staticMarkers = [], _clusterMarkers = [], _routeMarkers = [];
let _routeLayerIds = [], _routeSourceIds = [];
let _userMarker = null, _mapReady = false, _pending = null;
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

  // Layer order: casing (bottom) → fill → arrows (top)
  // 1. White casing — metro "border" feel
  const casingId = srcId + '-casing';
  _routeLayerIds.push(casingId);
  map.addLayer({
    id:casingId, type:'line', source:srcId,
    layout:{ 'line-cap':'round', 'line-join':'round' },
    paint:{ 'line-color':'#ffffff', 'line-width':14, 'line-opacity': finished ? 0.28 : 0.92 },
  });

  // 2. Vivid colored fill on top of casing
  const lineId = srcId + '-line';
  _routeLayerIds.push(lineId);
  map.addLayer({
    id:lineId, type:'line', source:srcId,
    layout:{ 'line-cap':'round', 'line-join':'round' },
    paint:{ 'line-color':color, 'line-width':9, 'line-opacity':opacity },
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

  map.on('click', lineId,   () => post({ type:'EVENT_PRESS', event }));
  map.on('click', casingId, () => post({ type:'EVENT_PRESS', event }));

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

// ── Public API ────────────────────────────────────────────────────────────────
window.updateEvents = function(events) {
  if (_mapReady) renderEvents(events); else _pending = events;
};
window.focusOnEvent = function(id, allEvents) {
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

map.on('load', () => {
  addArrowImage();
  _mapReady = true;
  if (_pending) { renderEvents(_pending); _pending = null; }
  post({ type:'MAP_READY' });
});
</script>
</body>
</html>`;

export interface EventMapHandle {
  focusOnEvent: (id: string) => void;
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
      } else if (data.type === 'EVENT_PRESS' && onEventPress) {
        onEventPress(data.event as Event);
      }
    } catch { /* ignore */ }
  }, [onEventPress]);

  return (
    <WebView
      ref={webviewRef}
      style={styles.map}
      source={{ html: BASE_HTML }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      allowUniversalAccessFromFileURLs
      onMessage={handleMessage}
    />
  );
}));

const styles = StyleSheet.create({
  map: { flex: 1 },
});
