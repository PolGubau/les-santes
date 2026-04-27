
# 3. DOCUMENTACIÓN BBDD (SUPABASE)

## 3.1 Principios

* eventos como entidad central
* separación clara: estático vs móvil
* rutas en GeoJSON
* sin realtime obligatorio en MVP

---

## 3.2 TABLAS

---

## EVENTS (núcleo)

```sql id="events"
create table events (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  description text,

  type text not null check (type in ('static','mobile')),

  category text,

  start_time timestamp with time zone not null,
  end_time timestamp with time zone,

  estimated_duration_minutes int,

  status text default 'scheduled'
    check (status in ('scheduled','live','finished','cancelled')),

  created_at timestamp default now()
);
```

---

## EVENT STATIC LOCATION

```sql id="static"
create table event_static_location (
  id uuid primary key default gen_random_uuid(),

  event_id uuid unique references events(id) on delete cascade,

  latitude double precision not null,
  longitude double precision not null,

  label text
);
```

---

## EVENT ROUTES (móviles)

```sql id="routes"
create table event_routes (
  id uuid primary key default gen_random_uuid(),

  event_id uuid references events(id) on delete cascade,

  geometry jsonb not null
);
```

### Ejemplo GeoJSON

```json id="geojson"
{
  "type": "LineString",
  "coordinates": [
    [2.44, 41.53],
    [2.441, 41.531],
    [2.442, 41.532]
  ]
}
```

---

## EVENT CATEGORIES

```sql id="categories"
create table event_categories (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  color text,
  icon text
);
```

---

## EVENT PLANS (sharing básico)

```sql id="plans"
create table user_event_plans (
  id uuid primary key default gen_random_uuid(),

  user_id uuid,

  event_id uuid references events(id) on delete cascade,

  status text default 'going'
    check (status in ('going','maybe')),

  created_at timestamp default now()
);
```

---

## ANNOUNCEMENTS (opcional MVP pero recomendable)

```sql id="announcements"
create table announcements (
  id uuid primary key default gen_random_uuid(),

  title text,
  message text,

  severity text default 'info'
    check (severity in ('info','warning','critical')),

  event_id uuid references events(id),

  created_at timestamp default now()
);
```

---

## 3.3 ÍNDICES

```sql id="indexes"
create index idx_events_time on events(start_time);
create index idx_events_type on events(type);
create index idx_plans_user on user_event_plans(user_id);
create index idx_routes_event on event_routes(event_id);
```

---

## 3.4 MODELO DE EJECUCIÓN (CLAVE)

### Evento estático

* marker fijo

### Evento móvil

* polyline (route)
* marker interpolado por tiempo:

```ts id="interp"
progress = (now - start_time) / duration
position = interpolate(route, progress)
```

---

## 3.5 DECISIÓN IMPORTANTE

### NO incluir en MVP:

* GPS real
* streaming realtime complejo
* historial de posiciones

### SÍ incluir:

* simulación por tiempo
* rutas predefinidas
* UI limpia y rápida

---

# RESUMEN FINAL

Esto es lo que estás construyendo realmente:

> Un sistema de representación temporal de eventos culturales en el espacio urbano

No es una app de mapas.
No es tracking.
No es red social.

Es:
**una capa digital de Les Santes basada en tiempo + espacio.**

---

Si quieres el siguiente paso útil de verdad, puedo darte:

* estructura de carpetas hexagonal exacta para React Native
* o algoritmo de interpolación robusto (sin jitter en mapas)
* o diseño de pantallas completo (UI flow tipo Figma descrito)
