import type { Event } from '@/entities/event';
import { Colors } from '@/shared/constants';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import WebView from 'react-native-webview';

declare const process: { env: Record<string, string | undefined> };
const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY ?? 'xvhIdcAsn7WrwOYPt8W2';

// Route palette — same hash function as EventMap for consistent coloring
const ROUTE_PALETTE = ['#E63946','#FF6B35','#F7C948','#2EC4B6','#3A86FF','#8338EC'];
function routeColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return ROUTE_PALETTE[Math.abs(h) % ROUTE_PALETTE.length];
}

function buildMiniHtml(event: Event, isDark: boolean): string {
  const style = isDark
    ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`
    : `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
  const fallback = 'https://tiles.openfreemap.org/styles/liberty';

  // Determine center + zoom
  let centerLng: number;
  let centerLat: number;
  let zoom: number;
  let routeCoords = '';
  let pinMarker = '';
  const color = routeColor(event.id);

  if (event.kind === 'static') {
    centerLng = event.location.lng;
    centerLat = event.location.lat;
    zoom = 15.5;
    pinMarker = `
      const el = document.createElement('div');
      el.style.cssText = 'width:28px;height:28px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);';
      new maplibregl.Marker({ element: el }).setLngLat([${centerLng},${centerLat}]).addTo(map);
    `;
  } else {
    const pts = event.route;
    const lngs = pts.map(p => p.lng);
    const lats = pts.map(p => p.lat);
    centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    zoom = 13.5;
    const coords = JSON.stringify(pts.map(p => [p.lng, p.lat]));
    routeCoords = `
      map.on('load', () => {
        map.addSource('route', { type:'geojson', data:{ type:'Feature', properties:{}, geometry:{ type:'LineString', coordinates:${coords} } } });
        map.addLayer({ id:'route-casing', type:'line', source:'route', layout:{'line-cap':'round','line-join':'round'}, paint:{'line-color':'#fff','line-width':8,'line-opacity':0.9} });
        map.addLayer({ id:'route-line',   type:'line', source:'route', layout:{'line-cap':'round','line-join':'round'}, paint:{'line-color':'${color}','line-width':5} });
        const el = document.createElement('div');
        el.style.cssText = 'width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
        new maplibregl.Marker({ element:el }).setLngLat(${JSON.stringify([pts[0].lng, pts[0].lat])}).addTo(map);
      });
    `;
  }

  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link href="https://cdn.jsdelivr.net/npm/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box;}body,#map{width:100%;height:100vh;}</style>
</head><body><div id="map"></div><script>
const map = new maplibregl.Map({
  container:'map', style:'${style}',
  center:[${centerLng},${centerLat}], zoom:${zoom},
  interactive:false, attributionControl:false,
});
map.on('error', () => { map.setStyle('${fallback}'); });
${pinMarker}
${routeCoords}
map.on('load', () => { window.ReactNativeWebView?.postMessage('ready'); });
</script></body></html>`;
}

interface Props {
  event: Event;
  onPress: () => void;
}

const MAP_H = 180;

export function EventMiniMap({ event, onPress }: Props) {
  const isDark = useColorScheme() === 'dark';
  const [ready, setReady] = useState(false);
  const html = useRef(buildMiniHtml(event, isDark)).current;

  const hasLocation = event.kind === 'static'
    ? !!event.location
    : event.route.length >= 2;

  if (!hasLocation) return null;

  const label = event.kind === 'mobile' ? 'Veure la ruta completa' : 'Obrir al mapa';

  return (
    <View style={s.wrap}>
      <WebView
        style={StyleSheet.absoluteFill}
        source={{ html, baseUrl: 'https://localhost' }}
        originWhitelist={['*']}sigo viendo lcu
        javaScriptEnabled
        scrollEnabled={false}
        onMessage={() => setReady(true)}
      />
      {!ready && (
        <View style={s.loader}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
      {/* Tap overlay — prevents map interaction and opens full map */}
      <Pressable
        style={({ pressed }) => [s.overlay, pressed && s.overlayPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={s.cta}>
          <Text style={s.ctaText}>{label} →</Text>
        </View>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    height: MAP_H,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceHigh,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayPressed: { backgroundColor: 'rgba(0,0,0,0.06)' },
  cta: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ctaText: { color: Colors.text, fontSize: 12, fontWeight: '700' },
});
