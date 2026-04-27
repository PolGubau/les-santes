# 2. ROADMAP

## Fase 0 — Setup (1-2 días)

* proyecto Expo + TS
* Supabase proyecto
* estructura hexagonal ligera (features/entities/shared)
* Toda la UI debe ser abstracta de la lógica, pues debe ser fácilmente reemplazable por React Web (repitiendo hook y lógica, pero con componentes web).

---

## Fase 1 — Base funcional (3-5 días)

### Backend

* crear tablas Supabase
* insertar datos mock de eventos

### Frontend

* mapa base
* render markers estáticos
* render rutas móviles (polyline)

---

## Fase 2 — Simulación móvil (3-4 días)

* interpolación de posición por tiempo
* animación de marker sobre ruta
* lógica:

  * start_time
  * duration
  * progress → punto en polyline

---

## Fase 3 — Agenda + UX (2-3 días)

* lista de eventos por día
* vista “Ahora”
* filtros básicos

---

## Fase 4 — Sharing (2 días)

* compartir evento (link)
* generar `.ics` calendario
* deep link a evento

---

## Fase 5 — Pulido demo (2-4 días)

* UI básica limpia
* iconografía eventos
* performance mapa
* datos reales de Les Santes

---

## Fase 6 — Demo institucional

* vídeo + app funcionando
* simulación de eventos móviles en tiempo real
* presentación a ayuntamiento
