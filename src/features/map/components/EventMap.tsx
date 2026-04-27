import type { Event } from '@/entities/event';
import React, { useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

const CENTER_LNG = 2.444;
const CENTER_LAT = 41.5378;

const STATE_COLOR: Record<string, string> = {
  now: '#00C896',
  upcoming: '#4A9EFF',
  finished: '#555555',
};

// WebView can't use @expo/vector-icons — map icon names to emojis
const ICON_EMOJI: Record<string, string> = {
  drum: '🥁',
  church: '⛪',
  'musical-notes': '🎵',
  crown: '👑',
  happy: '😊',
  candle: '🕯️',
  fire: '🔥',
  mic: '🎤',
  'map-marker': '📍',
};

function buildHtml(events: Event[]): string {
  const eventsJson = JSON.stringify(events);
  return `<!DOCTYPE html>
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
const STATE_COLOR = ${JSON.stringify(STATE_COLOR)};
const ICON_EMOJI_MAP = ${JSON.stringify(ICON_EMOJI)};
const events = ${eventsJson};

function resolveEmoji(icon) {
  if (typeof icon === 'string') return icon;
  return ICON_EMOJI_MAP[icon && icon.name] || '\u{1F4CD}';
}

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [${CENTER_LNG}, ${CENTER_LAT}],
  zoom: 14.5,
  attributionControl: false,
});

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

map.on('load', () => {
  events.forEach(event => {
    const color = STATE_COLOR[event.state] || '#888';
    const width = event.state === 'now' ? 6 : 3;
    const opacity = event.state === 'finished' ? 0.35 : 0.9;

    if (event.kind === 'static' && event.location) {
      makeMarker(event, [event.location.lng, event.location.lat]).addTo(map);
    }

    if (event.kind === 'mobile' && event.route && event.route.length > 1) {
      const coords = event.route.map(p => [p.lng, p.lat]);
      const srcId = 'route-' + event.id;
      map.addSource(srcId, {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
      });
      // Halo for active routes
      if (event.state === 'now') {
        map.addLayer({ id: srcId + '-halo', type: 'line', source: srcId,
          paint: { 'line-color': color, 'line-width': 14, 'line-opacity': 0.15 } });
      }
      map.addLayer({ id: srcId, type: 'line', source: srcId,
        paint: { 'line-color': color, 'line-width': width, 'line-opacity': opacity, 'line-cap': 'round', 'line-join': 'round' } });

      // Clickable layer
      map.on('click', srcId, () => postEvent(event));
      map.on('mouseenter', srcId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', srcId, () => { map.getCanvas().style.cursor = ''; });

      // Icon marker at route start
      makeMarker(event, coords[0]).addTo(map);
    }
  });
});
</script>
</body>
</html>`;
}

interface Props {
  events: Event[];
  onEventPress?: (event: Event) => void;
}

export function EventMap({ events, onEventPress }: Props) {
  const webviewRef = useRef<WebView>(null);

  const handleMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'EVENT_PRESS' && onEventPress) {
        onEventPress(data.event as Event);
      }
    } catch { /* ignore malformed messages */ }
  }, [onEventPress]);

  return (
    <WebView
      ref={webviewRef}
      style={styles.map}
      source={{ html: buildHtml(events) }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      allowUniversalAccessFromFileURLs
      onMessage={handleMessage}
    />
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
