import type { Event } from '@/entities/event';
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
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body,#map { width:100%; height:100vh; background:#0d0d0d; }
    .pin { display:flex; align-items:center; justify-content:center; width:38px; height:38px;
      border-radius:50%; border:2.5px solid rgba(255,255,255,0.25);
      box-shadow:0 3px 10px rgba(0,0,0,0.45); cursor:pointer;
      transition:transform .12s, box-shadow .12s; font-size:17px; }
    .pin:active { transform:scale(1.25); box-shadow:0 6px 18px rgba(0,0,0,0.6); }
    .pin-finished { opacity:0.38; filter:grayscale(0.6); }
    .maplibregl-ctrl-geolocate { margin:8px !important; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
const STATE_COLOR = { now:'#00C896', upcoming:'#4A9EFF', finished:'#666666' };
const ICON_EMOJI = { drum:'🥁', church:'⛪', 'musical-notes':'🎵', crown:'👑', happy:'😊',
  candle:'🕯️', fire:'🔥', mic:'🎤', 'map-marker':'📍', people:'👥', flag:'🚩',
  boat:'⛵', ticket:'🎟️' };

function resolveEmoji(icon) {
  if (typeof icon === 'string') return ICON_EMOJI[icon] || icon;
  return ICON_EMOJI[icon && icon.name] || '📍';
}
function post(msg) {
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
}
function makePin(event, lngLat) {
  const color = STATE_COLOR[event.state] || '#888';
  const el = document.createElement('div');
  el.className = 'pin' + (event.state === 'finished' ? ' pin-finished' : '');
  el.style.background = color + '22';
  el.style.borderColor = color;
  el.textContent = resolveEmoji(event.icon);
  el.addEventListener('click', () => post({ type: 'EVENT_PRESS', event }));
  return new maplibregl.Marker({ element: el }).setLngLat(lngLat);
}

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [${CENTER_LNG}, ${CENTER_LAT}],
  zoom: 14.5,
  minZoom: 12,
  maxZoom: 19,
  maxBounds: [[2.37, 41.49], [2.53, 41.59]],
  attributionControl: false,
});

// Geolocation control — uses browser/native location API
const geolocate = new maplibregl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,
  showUserHeading: true,
  showAccuracyCircle: true,
});
map.addControl(geolocate, 'bottom-right');

let _markers = [], _layerIds = [], _mapReady = false, _pending = null;

function clearLayer(id) {
  if (map.getLayer(id)) map.removeLayer(id);
  if (map.getSource(id)) map.removeSource(id);
}

function renderEvents(events) {
  _markers.forEach(m => m.remove()); _markers = [];
  _layerIds.forEach(id => clearLayer(id)); _layerIds = [];

  events.forEach(event => {
    const color = STATE_COLOR[event.state] || '#888';
    const finished = event.state === 'finished';
    const lineOpacity = finished ? 0.3 : 0.88;
    const lineWidth = event.state === 'now' ? 5 : 3.5;

    if (event.kind === 'static' && event.location) {
      const m = makePin(event, [event.location.lng, event.location.lat]);
      m.addTo(map); _markers.push(m);
    }

    if (event.kind === 'mobile' && event.route && event.route.length > 1) {
      const coords = event.route.map(p => [p.lng, p.lat]);
      const srcId = 'route-' + event.id;
      _layerIds.push(srcId);
      map.addSource(srcId, { type:'geojson',
        data:{ type:'Feature', properties:{}, geometry:{ type:'LineString', coordinates:coords } } });

      if (!finished) {
        const haloId = srcId + '-halo';
        _layerIds.push(haloId);
        map.addLayer({ id:haloId, type:'line', source:srcId,
          paint:{ 'line-color':color, 'line-width':lineWidth+10, 'line-opacity':0.12, 'line-blur':4 } });
      }

      map.addLayer({ id:srcId, type:'line', source:srcId,
        paint:{ 'line-color':color, 'line-width':lineWidth, 'line-opacity':lineOpacity,
          'line-cap':'round', 'line-join':'round' } });

      // Direction arrows (every ~200 m)
      if (!finished) {
        const arrowId = srcId + '-arrow';
        _layerIds.push(arrowId);
        map.addLayer({ id:arrowId, type:'symbol', source:srcId,
          layout:{ 'symbol-placement':'line', 'symbol-spacing':160,
            'icon-image':'arrow-right', 'icon-size':0.65, 'icon-rotate':0,
            'icon-allow-overlap':true, 'icon-ignore-placement':true } });
      }

      map.on('click', srcId, () => post({ type:'EVENT_PRESS', event }));
      map.on('mouseenter', srcId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', srcId, () => { map.getCanvas().style.cursor = ''; });
      const m = makePin(event, coords[0]);
      m.addTo(map); _markers.push(m);
    }
  });
}

window.updateEvents = function(events) {
  if (_mapReady) renderEvents(events); else _pending = events;
};

window.focusOnEvent = function(id, allEvents) {
  const event = allEvents.find(e => e.id === id);
  if (!event) return;
  let center;
  if (event.kind === 'static' && event.location) center = [event.location.lng, event.location.lat];
  else if (event.kind === 'mobile' && event.route && event.route.length > 0)
    center = [event.route[0].lng, event.route[0].lat];
  if (center) map.easeTo({ center, zoom: 16.5, duration: 600 });
};

map.on('load', () => {
  _mapReady = true;
  if (_pending) { renderEvents(_pending); _pending = null; }
  post({ type: 'MAP_READY' });
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
