# Roadmap

## Fase 0 - Setup (1-2 dies)

* Projecte Expo + TypeScript
* Projecte Supabase + esquema inicial
* Estructura per funcionalitats: `features / entities / shared`
* La UI ha de ser independent de la lògica - fàcilment substituïble per React Web reutilitzant hooks.

---

## Fase 1 - Base funcional (3-5 dies)

### Backend

* Crear taules: `events`, `event_static_location`, `event_routes`, `announcements`
* Inserir dades mock d'actes de Les Santes

### Frontend

* Mapa base
* Marcadors estàtics (actes fixos)
* Polilínia de ruta (actes itinerants)

---

## Fase 2 - Simulació mòbil (3-4 dies)

* Interpolació de posició per temps (sense GPS real)
* Animació de marcador sobre ruta
* Lògica:

  ```ts
  progress = (now - start_time) / duration_minutes
  position = interpolate(route.geometry, progress)
  ```

---

## Fase 3 - Agenda + UX (2-3 dies)

* Llista d'actes per dia
* Pantalla "Ara mateix" (`state = 'now'`)
* Filtres: tipus / categoria

---

## Fase 4 - Poliment demo (2-4 dies)

* UI neta i consistent
* Iconografia d'actes (`icon` al model)
* Rendiment del mapa
* Dades reals de Les Santes

---

## Fase 5 - Demo institucional

* Vídeo + app funcionant
* Simulació d'actes itinerants en temps real
* Presentació a l'ajuntament

---

## Fora de l'abast (MVP)

* Sharing / plans d'usuari
* GPS real
* Autenticació d'usuaris
* Panell d'administració
