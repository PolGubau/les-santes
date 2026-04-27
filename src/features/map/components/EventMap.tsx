import type { Event } from '@/entities/event';
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
const STATE_COLOR = { now:'#00C896', upcoming:'#4A9EFF', finished:'#666' };
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
function makeMarkerEl(event) {
  const color = STATE_COLOR[event.state] || '#888';
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
let _staticMarkers = [], _clusterMarkers = [];
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
  // Always remove layers BEFORE sources (MapLibre requirement)
  _routeLayerIds.forEach(id => { try { if (map.getLayer(id)) map.removeLayer(id); } catch(e){} });
  _routeSourceIds.forEach(id => { try { if (map.getSource(id)) map.removeSource(id); } catch(e){} });
  _routeLayerIds = []; _routeSourceIds = [];
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

// ── Route rendering ───────────────────────────────────────────────────────────
function renderRoute(event) {
  const color = STATE_COLOR[event.state] || '#888';
  const finished = event.state === 'finished';
  const coords = event.route.map(p => [p.lng, p.lat]);
  const srcId = 'route-' + event.id;
  _routeSourceIds.push(srcId);
  map.addSource(srcId, { type:'geojson',
    data:{ type:'Feature', properties:{}, geometry:{ type:'LineString', coordinates:coords } } });

  if (!finished) {
    const haloId = srcId + '-halo';
    _routeLayerIds.push(haloId);
    map.addLayer({ id:haloId, type:'line', source:srcId,
      paint:{ 'line-color':color, 'line-width':13, 'line-opacity':0.10, 'line-blur':6 } });
  }
  const lineId = srcId + '-line';
  _routeLayerIds.push(lineId);
  map.addLayer({ id:lineId, type:'line', source:srcId,
    paint:{ 'line-color':color, 'line-width':event.state==='now'?5:3.5,
      'line-opacity':finished?0.3:0.85, 'line-cap':'round', 'line-join':'round' } });

  map.on('click', lineId, () => post({ type:'EVENT_PRESS', event }));

  // Start-of-route marker
  const el = makeMarkerEl(event);
  _staticMarkers.push(new maplibregl.Marker({ element:el }).setLngLat(coords[0]).addTo(map));
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
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useImperativeHandle(ref, () => ({
    focusOnEvent: (id: string) => {
      const js = `window.focusOnEvent(${JSON.stringify(id)}, ${JSON.stringify(eventsRef.current)}); true;`;
      webviewRef.current?.injectJavaScript(js);
    },
  }));

  useEffect(() => {
    if (!mapReady) return;
    const js = `window.updateEvents(${JSON.stringify(events)}); true;`;
    webviewRef.current?.injectJavaScript(js);
  }, [events, mapReady]);

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
      geolocationEnabled
      allowUniversalAccessFromFileURLs
      onMessage={handleMessage}
    />
  );
}));

const styles = StyleSheet.create({
  map: { flex: 1 },
});
