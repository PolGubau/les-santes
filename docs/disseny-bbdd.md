# Disseny de la base de dades (Supabase)

## Principi de disseny

> Si un camp no ajuda l'usuari a decidir **què fer ara mateix**, s'elimina.

Els esdeveniments no són fitxes de CMS. Són **decisions ràpides** amb context temporal i espacial.

---

## Model final

### EVENT (nucli)

```sql
create table events (
  id            uuid primary key default gen_random_uuid(),

  title         text not null,
  short_desc    text,

  type          text not null check (type in ('static', 'mobile')),
  category      text,
  icon          text,

  start_time    timestamptz not null,
  end_time      timestamptz,

  state         text generated always as (
    case
      when now() between start_time and coalesce(end_time, start_time + interval '2h') then 'now'
      when now() < start_time then 'upcoming'
      else 'finished'
    end
  ) stored,

  created_at    timestamptz default now()
);
```

**Camps eliminats intencionadament:** `description` llarga, `estimated_duration_minutes`, `status` manual (substituït per `state` calculat).

---

### STATIC DATA - ubicació fixa

```sql
create table event_static_location (
  event_id  uuid primary key references events(id) on delete cascade,
  lat       double precision not null,
  lng       double precision not null
);
```

---

### MOBILE DATA - ruta itinerant

```sql
create table event_routes (
  event_id          uuid primary key references events(id) on delete cascade,
  geometry          jsonb not null,  -- GeoJSON LineString
  duration_minutes  int not null
);
```

**Exemple GeoJSON:**

```json
{
  "type": "LineString",
  "coordinates": [[2.44, 41.53], [2.441, 41.531], [2.442, 41.532]]
}
```

**Interpolació de posició (sense GPS real):**

```ts
const progress = (now - start_time) / duration_minutes
const position = interpolate(route.geometry, progress)
```

---

### ANNOUNCEMENTS - canvis d'última hora

```sql
create table announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  message    text,
  severity   text default 'info' check (severity in ('info', 'warning', 'critical')),
  event_id   uuid references events(id),
  created_at timestamptz default now()
);
```

---

## Índexs

```sql
create index idx_events_start  on events(start_time);
create index idx_events_type   on events(type);
create index idx_events_state  on events(state);
```

---

## Què es pot construir amb aquest model

| Pantalla       | Dades necessàries                    |
|----------------|--------------------------------------|
| Feed simple    | `events` filtrat per `state`         |
| Mapa clar      | `event_static_location` + `event_routes` |
| "Ara" potent   | `events where state = 'now'`         |
| Recomanació    | `state + category + proximitat`      |

Sense complicar el backend.

---

## Fora de l'MVP

| Funcionalitat       | Motiu                                         |
|---------------------|-----------------------------------------------|
| GPS real            | Complexitat sense valor MVP                   |
| Historial posicions | No ajuda a decidir ara                        |
| Sharing / plans     | Xarxa social fora de l'abast                  |
| Categories com taula| Sobrecomplexitat - un camp `category` és suficient |

---

## Insight clau

> El valor no està en l'esdeveniment.
> Està en: **"Què hauria de fer l'usuari ara mateix"**
