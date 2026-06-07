# ASO — Les Santes (Google Play + App Store)

> Guía operativa para optimitzar la ficha de la app. Tot el text final ha
> d'anar a Play Console / App Store Connect — aquest document és la font de
> veritat editorial.

## 1. Keywords principals

Investigades sobre cerques reals (julio Mataró, festes majors Catalunya):

**Tier 1 — alta intenció**
`festa major Mataró` · `Les Santes` · `programa Les Santes` ·
`agenda Les Santes` · `festes Mataró 2026`

**Tier 2 — semàntic**
`correfoc Mataró` · `cercavila gegants` · `castellers Mataró` ·
`focs artificials Mataró` · `sardanes` · `concert festa major`

**Tier 3 — long tail**
`mapa festa major` · `actes festa major nens` · `programa festes Catalunya` ·
`festes juliol Catalunya` · `Mataró agost` · `festes populars`

## 2. Play Store — Short description (80 char)

```
La guia oficial de Les Santes: agenda, mapa i avisos en directe.
```

(78 chars — keyword principal "Les Santes" + 3 features clau)

## 3. Play Store — Full description (~3.500/4.000 char)

Estructura obligatòria:

1. **Hook** (2 línies) amb keyword principal.
2. **Bullets de features** (skimmable, com sol·licita el report).
3. **Bloc per cada feature principal** (3-4 línies cada un, repetint keywords secundàries amb naturalitat).
4. **Bloc "Per a qui"** (segmentació: famílies, visitants, vinguts de fora).
5. **Bloc d'offline / privacitat** (diferenciador real).
6. **Footer** (web oficial, contacte, llicència de dades).

### Esborrany (CA)

```
Tota la Festa Major de Mataró a la teva butxaca. Programa, mapa,
favorits i notificacions de Les Santes 2026.

Què trobaràs:
• Agenda completa amb tots els actes — cercaviles, correfocs,
  gegants, castellers, sardanes, concerts i focs artificials.
• Mapa interactiu amb la ubicació exacta de cada acte, rutes
  mòbils en directe i el teu punt blau.
• "Ara mateix" — què està passant en aquest instant.
• Favorits sincronitzats amb el teu calendari del telèfon.
• Avisos en directe quan canvia l'hora o la ubicació d'un acte.
• Funciona offline — descarrega't el programa i el mapa abans
  d'arribar al centre, on la cobertura sol saturar-se.

Per als de casa, per als que vénen de fora i per a les famílies
que volen no perdre's res del programa de Les Santes a Mataró.

Privacitat: no demanem comptes, no recopilem dades personals.
Només estadístiques anònimes que pots desactivar a Ajustos.

Web: lessantes.polgubau.com
```

→ Repetir en **ES** i **EN** (Play Console permet localitzar fitxa per idioma — fer‑ho per als 3 locales que ja suporta l'app).

## 4. App Store (iOS, quan es publiqui)

- **Name** (30 char): `Les Santes — Festa Major`
- **Subtitle** (30 char): `Programa, mapa i avisos`
- **Keywords field** (100 char, separades per coma, no repetir name/subtitle):
  `mataro,festa,correfoc,gegants,castellers,sardanes,agenda,programa,festes,catalunya`
- **Promotional text** (170 char, editable sense review): usar per actes destacats del dia.

## 5. Screenshots — pla (Play + iOS)

Mateix joc per a CA / ES / EN, 5 captures **amb caption a sobre** (en blanc trencat càlid de la marca):

| # | Pantalla | Caption proposat |
|---|---|---|
| 1 | `Now` amb hero card | "Què està passant ARA" |
| 2 | Agenda d'un dia | "Tot el programa a un cop d'ull" |
| 3 | Detall d'acte | "Cada acte amb mapa, durada i avisos" |
| 4 | Mapa amb clusters | "Mapa interactiu — funciona offline" |
| 5 | Favorits + recursos | "Els teus actes, al teu calendari" |

Format: 1080 × 1920 (vertical), exportat des de simulador iPhone 15 / Pixel 8.
Script suggerit: utilitzar `react-native-view-shot` en mode `__DEV__` per generar les captures programàticament i mantenir consistència entre re‑llançaments.

## 6. Featured graphic (Play Store, 1024 × 500)

- Fons: blanc trencat `#FAF8F5`.
- Logo Les Santes centrat-esquerra + mockup d'iPhone amb la pantalla "Now".
- Sense text llarg — només wordmark.

## 7. Video preview (30 s, opcional però recomanat)

Storyboard mínim:
0–3 s logo · 3–10 s scroll d'agenda · 10–18 s mapa amb clusters · 18–24 s favorit + notificació · 24–30 s "Descarrega Les Santes 2026".

## 8. Checklist de publicació

- [ ] Traduir short + full description als 3 locales.
- [ ] Pujar 5 screenshots × 3 locales.
- [ ] Featured graphic.
- [ ] Política de privacitat (apunta a `lessantes.polgubau.com/privacy`).
- [ ] Categoria primària: **Events**. Secundària: **Travel & Local**.
- [ ] Tag de contingut: **Tothom**.
- [ ] Marcar app com a "no es ven res, no hi ha anuncis".
- [ ] Test intern → tancat → obert → producció (sense saltar fases).

## 9. KPIs a monitoritzar (Play Console > Acquisition)

- **Store listing visitors** abans/després del canvi.
- **Conversion rate** (instal·lacions / visites) — objectiu > 30 %.
- **Search-vs-Explore** ratio — pujar "Search" indica que les keywords funcionen.
- Revisar setmanalment durant les 4 setmanes pre-festival.
