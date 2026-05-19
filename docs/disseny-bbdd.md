# Base de dades i API — Festival App (multi-tenant)

> **Projecte Supabase:** `cvjjkzsflwksyvlasoij` (eu-west-1)
> **Schema SQL:** `app/supabase/schema.sql`

---

## 0. Arquitectura multi-tenant

Un sol projecte Supabase per a tots els festivals i edicions. Cada festival és una fila a `festivals`; tots els events i anuncis hi fan referència via `festival_id`.

```
festivals
  └── events          (festival_id FK)
  └── announcements   (festival_id FK)
```

**Com funciona per app build:**

| Variable | Valor exemple | Efecte |
|---|---|---|
| `EXPO_PUBLIC_FESTIVAL_ID` | `les-santes-2026` | L'app carrega NOMÉS els events d'aquest festival |
| `EXPO_PUBLIC_FESTIVAL_ID` | `les-santes-2027` | Mateixa app, nou any, nous events |
| `EXPO_PUBLIC_FESTIVAL_ID` | `granollers-2027` | App reutilitzada per a un festival diferent |

Metro inlina el valor en temps de build → zero overhead en runtime.

**Per a un festival nou:**
1. Crear el registre a `festivals` (via admin dashboard o seed script)
2. Inserir els events amb `festival_id` corresponent
3. Fer un build EAS amb `EXPO_PUBLIC_FESTIVAL_ID=nou-festival-2027`

---

## 1. Taula `festivals`

| Columna | Tipus | Notes |
|---|---|---|
| `id` | `text PK` | Slug únic: `les-santes-2026`, `granollers-2027` |
| `name` | `text` | "Les Santes 2026" |
| `city` | `text` | "Mataró" |
| `year` | `int` | 2026 |
| `starts_on` | `date` | Data d'inici del festival |
| `ends_on` | `date` | Data de fi del festival |
| `is_active` | `bool` | Útil per al dashboard d'admin |

---

## 2. Taula `events` (schema final)

Disseny pla (flat) — sense joins per simplicitat i rendiment en un festival de curta durada.

| Columna | Tipus | Notes |
|---|---|---|
| `id` | `text PK` | Format `ls26-001`. Human-readable, únic globalment per convenció. |
| `festival_id` | `text FK` | Referència a `festivals.id`. Scoping de tot. |
| `title` | `text` | Nom de l'acte |
| `type` | `text` | `cercavila \| correfoc \| concert \| sardanes \| castellera \| gegants \| havaneres \| exposicio \| espectacle \| missa \| focsartificials \| cursa \| jocs \| contes \| barram \| altres` |
| `category` | `text` | `familiar \| nocturn \| tradicional \| cultural` |
| `kind` | `text` | `static \| mobile` — determina si és pin o ruta |
| `icon_name` | `text` | Nom de l'icona Lucide (ex: `"Flame"`) |
| `short_description` | `text` | Descripció curta per a la llista |
| `start_time` | `timestamptz` | UTC. Festival a UTC+2. |
| `end_time` | `timestamptz` | UTC |
| `image_url` | `text?` | URL de la imatge |
| `blurhash` | `text?` | Placeholder mentre carrega la imatge |
| `location_lat` | `float8?` | Obligatori si `kind = 'static'` |
| `location_lng` | `float8?` | Obligatori si `kind = 'static'` |
| `location_name` | `text?` | Nom llegible del lloc |
| `route` | `jsonb?` | `Array<{lat,lng}>`. Obligatori si `kind = 'mobile'` |
| `is_cancelled` | `bool` | `false` per defecte. RLS filtra automàticament. |
| `cancelled_reason` | `text?` | Motiu de la cancel·lació per al dashboard |
| `created_at` | `timestamptz` | Auto |
| `updated_at` | `timestamptz` | Auto via trigger |

### Constraints
- `kind = 'static'` → `location_lat` i `location_lng` no nuls
- `kind = 'mobile'` → `route` no nul

---

## 2. Taula `announcements`

Avisos d'última hora (canvis d'hora, cancel·lacions, etc.) que es mostren com a banner a l'app.

| Columna | Tipus | Notes |
|---|---|---|
| `id` | `uuid PK` | Auto-generat |
| `title` | `text` | Titular breu |
| `message` | `text?` | Detall opcional |
| `severity` | `text` | `info \| warning \| critical` |
| `event_id` | `text? FK` | Referència a `events.id` (opcional) |
| `is_active` | `bool` | `true` per defecte. Desactiva per amagar. |
| `created_at` | `timestamptz` | Auto |

---

## 3. Row Level Security (RLS)

| Taula | Rol anon (app) | Rol authenticated (admin) |
|---|---|---|
| `events` | SELECT on `is_cancelled = false` | CRUD complet |
| `announcements` | SELECT on `is_active = true` | CRUD complet |

**L'app mai veu events cancel·lats.** El filtre és a nivell de BD, no de codi.

---

## 4. API — Supabase client (app mòbil)

El client ja és a `app/src/shared/lib/supabase.ts`. Configuració via env vars:

```
EXPO_PUBLIC_SUPABASE_URL=https://cvjjkzsflwksyvlasoij.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Queries que usa l'app

```typescript
// Tots els events actius (RLS filtra is_cancelled automàticament)
const { data } = await supabase
  .from('events')
  .select('*')
  .order('start_time', { ascending: true });

// Event per ID
const { data } = await supabase
  .from('events')
  .select('*')
  .eq('id', 'ls25-042')
  .single();

// Avisos actius
const { data } = await supabase
  .from('announcements')
  .select('*')
  .order('created_at', { ascending: false });
```

---

## 5. API — Admin dashboard (Next.js landing)

Per al dashboard d'administració, usar **Supabase SSR** amb la service role key (servidor únicament).

```
SUPABASE_URL=https://cvjjkzsflwksyvlasoij.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  ← mai al client
```

### Operacions admin principals

```typescript
// Cancel·lar un event
await supabase
  .from('events')
  .update({ is_cancelled: true, cancelled_reason: 'Pluja' })
  .eq('id', 'ls25-042');

// Restaurar event cancel·lat
await supabase
  .from('events')
  .update({ is_cancelled: false, cancelled_reason: null })
  .eq('id', 'ls25-042');

// Canviar hora d'un event
await supabase
  .from('events')
  .update({ start_time: '2026-07-27T20:00:00+02:00', end_time: '2026-07-27T22:00:00+02:00' })
  .eq('id', 'ls25-042');

// Crear avís urgent
await supabase
  .from('announcements')
  .insert({
    title: 'Canvi d\'hora',
    message: 'El concert es retarda 1 hora per pluja.',
    severity: 'warning',
    event_id: 'ls25-042',
  });

// Desactivar avís
await supabase
  .from('announcements')
  .update({ is_active: false })
  .eq('id', 'uuid-aqui');
```

---

## 6. Seed inicial (i nous festivals)

Migra els events de `mock.ts` a Supabase per a un festival concret:

```bash
cd app

# Les Santes 2026 (per defecte)
SUPABASE_URL=https://cvjjkzsflwksyvlasoij.supabase.co \
SUPABASE_SERVICE_KEY=eyJ... \
FESTIVAL_ID=les-santes-2026 \
pnpm seed

# Nou any — canvia FESTIVAL_ID i apunta a un nou mock
FESTIVAL_ID=les-santes-2027 \
FESTIVAL_NAME="Les Santes 2027" \
FESTIVAL_START=2027-07-23 \
FESTIVAL_END=2027-07-28 \
pnpm seed
```

Safe to re-run — usa `upsert` amb `on conflict id`.
El script crea el registre de festival automàticament si no existeix.

---

## 7. Dashboard d'administració — On posar-lo?

**→ A la landing** (`/admin`), no en una web nova.

Raons:
- Next.js ja configurat amb Tailwind + shadcn
- Supabase SSR funciona perfectament amb Next.js (proxy d'auth)
- Un sol projecte, un sol deploy
- Autenticació: Supabase Auth amb email/password (un usuari admin)

**Rutes previstes:**

| Ruta | Funció |
|---|---|
| `/admin` | Login |
| `/admin/events` | Llistat amb filtre, cerca i accions ràpides |
| `/admin/events/[id]` | Editar event (hora, cancel·lar, restaurar) |
| `/admin/announcements` | Gestionar avisos actius |

**Stack a afegir a la landing:**
```bash
cd landing
pnpm add @supabase/supabase-js @supabase/ssr
```
