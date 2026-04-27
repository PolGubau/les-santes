import type { Event } from '@/entities/event';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

const CENTER_LNG = 2.444;
const CENTER_LAT = 41.5378;

// Stable HTML — the map is initialised once and never reloaded.
// Events are pushed via window.updateEvents() through injectJavaScript.
const BASE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link href="https://unpkg.com/maplibre-gl@5.1.0/dist/maplibre-gl.css" rel="stylesheet">
  <script src="https://unpkg.com/maplibre-gl@5.1.0/dist/maplibre-gl.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body,#map { width:100%; height:100vh; background:#0d0d0d; }
    .marker { font-size:26px; cursor:pointer; filter:drop-shadow(0 2px 6px rgba(0,0,0,.6)); transition:transform .15s; }
    .marker:active { transform:scale(1.3); }
    .marker-finished { opacity:0.4; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
const STATE_COLOR = { now:'#00C896', upcoming:'#4A9EFF', finished:'#555555' };
const ICON_EMOJI = { drum:'🥁', church:'⛪', 'musical-notes':'🎵', crown:'👑', happy:'😊', candle:'🕯️', fire:'🔥', mic:'🎤', 'map-marker':'📍' };

function resolveEmoji(icon) {
  if (typeof icon === 'string') return icon;
  return ICON_EMOJI[icon && icon.name] || '📍';
}
function postEvent(event) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EVENT_PRESS', event }));
  }
}
function makeMarker(event, lngLat) {
  const el = document.createElement('div');
  el.className = 'marker' + (event.state === 'finished' ? ' marker-finished' : '');
  el.textContent = resolveEmoji(event.icon);
  el.addEventListener('click', () => postEvent(event));
  return new maplibregl.Marker({ element: el }).setLngLat(lngLat);
}

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [${CENTER_LNG}, ${CENTER_LAT}],
  zoom: 14.5,
  attributionControl: false,
});

// Track active markers and layer IDs so we can clean them up on update
let _markers = [];
let _layerIds = [];
let _mapReady = false;
let _pendingEvents = null;

function clearLayer(id) {
  if (map.getLayer(id)) map.removeLayer(id);
  if (map.getSource(id)) map.removeSource(id);
}

function renderEvents(events) {
  // Remove previous markers
  _markers.forEach(m => m.remove());
  _markers = [];
  // Remove previous layers/sources
  _layerIds.forEach(id => clearLayer(id));
  _layerIds = [];

  events.forEach(event => {
    const color = STATE_COLOR[event.state] || '#888';
    const width = event.state === 'now' ? 6 : 3;
    const opacity = event.state === 'finished' ? 0.35 : 0.9;

    if (event.kind === 'static' && event.location) {
      const m = makeMarker(event, [event.location.lng, event.location.lat]);
      m.addTo(map);
      _markers.push(m);
    }

    if (event.kind === 'mobile' && event.route && event.route.length > 1) {
      const coords = event.route.map(p => [p.lng, p.lat]);
      const srcId = 'route-' + event.id;
      _layerIds.push(srcId);
      map.addSource(srcId, {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
      });
      if (event.state === 'now') {
        const haloId = srcId + '-halo';
        _layerIds.push(haloId);
        map.addLayer({ id: haloId, type: 'line', source: srcId,
          paint: { 'line-color': color, 'line-width': 14, 'line-opacity': 0.15 } });
      }
      map.addLayer({ id: srcId, type: 'line', source: srcId,
        paint: { 'line-color': color, 'line-width': width, 'line-opacity': opacity, 'line-cap': 'round', 'line-join': 'round' } });
      map.on('click', srcId, () => postEvent(event));
      map.on('mouseenter', srcId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', srcId, () => { map.getCanvas().style.cursor = ''; });
      const m = makeMarker(event, coords[0]);
      m.addTo(map);
      _markers.push(m);
    }
  });
}

map.on('load', () => {
  _mapReady = true;
  if (_pendingEvents) { renderEvents(_pendingEvents); _pendingEvents = null; }
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
  }
});

// Called from React Native via injectJavaScript
window.updateEvents = function(events) {
  if (_mapReady) {
    renderEvents(events);
  } else {
    _pendingEvents = events;
  }
};
</script>
</body>
</html>`;

interface Props {
  events: Event[];
  onEventPress?: (event: Event) => void;
}

export const EventMap = memo(function EventMap({ events, onEventPress }: Props) {
  const webviewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);

  // Push events whenever they change — but only after the map is ready
  useEffect(() => {
    const js = `window.updateEvents(${JSON.stringify(events)}); true;`;
    if (mapReady) {
      webviewRef.current?.injectJavaScript(js);
    }
  }, [events, mapReady]);

  const handleMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setMapReady(true);
      } else if (data.type === 'EVENT_PRESS' && onEventPress) {
        onEventPress(data.event as Event);
      }
    } catch { /* ignore malformed messages */ }
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
});

const styles = StyleSheet.create({
  map: { flex: 1 },
});
