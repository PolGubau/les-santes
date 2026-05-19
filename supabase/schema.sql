-- ============================================================
-- Festival App — Supabase Schema (multi-tenant)
-- Run this in the Supabase SQL editor (project: cliswtnozdmddtmkudfp)
--
-- Multi-tenancy model: one DB, festival_id scopes all data.
-- Each app build sets EXPO_PUBLIC_FESTIVAL_ID at compile time.
-- ============================================================

-- ─── FESTIVALS ───────────────────────────────────────────────
create table if not exists public.festivals (
  id          text primary key,          -- e.g. "les-santes-2026", "granollers-2027"
  name        text not null,             -- "Les Santes 2026"
  city        text not null,             -- "Mataró"
  year        int  not null,
  starts_on   date not null,
  ends_on     date not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.festivals enable row level security;

create policy "anon_read_festivals"
  on public.festivals for select using (true);

create policy "admin_all_festivals"
  on public.festivals for all
  using     (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── SHARED TRIGGER: auto-update updated_at ─────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── EVENTS ─────────────────────────────────────────────────
create table if not exists public.events (
  -- identity
  id                text primary key,          -- e.g. "ls26-001"
  festival_id       text not null references public.festivals(id) on delete cascade,

  -- content
  title             text not null,
  type              text not null check (type in (
                      'cercavila','correfoc','concert','sardanes','castellera',
                      'gegants','exposicio','espectacle','missa',
                      'focsartificials','cursa','jocs','contes','barram','altres'
                    )),
  category          text not null check (category in ('familiar','nocturn','tradicional','cultural')),
  kind              text not null default 'static' check (kind in ('static','mobile')),
  short_description text not null,

  -- timing (UTC stored)
  start_time        timestamptz not null,
  end_time          timestamptz not null,

  -- media
  image_url         text,
  blurhash          text,

  -- location — static events
  location_lat      double precision,
  location_lng      double precision,
  location_name     text,

  -- route — mobile events
  route             jsonb,

  -- admin
  is_cancelled      boolean not null default false,
  cancelled_reason  text,

  -- meta
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- integrity constraints
  constraint static_needs_location check (kind <> 'static' or (location_lat is not null and location_lng is not null)),
  constraint mobile_needs_route    check (kind <> 'mobile' or route is not null)
);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- Indexes
create index idx_events_festival    on public.events (festival_id);
create index idx_events_start_time  on public.events (festival_id, start_time);
create index idx_events_kind        on public.events (festival_id, kind);
create index idx_events_category    on public.events (festival_id, category);
create index idx_events_cancelled   on public.events (festival_id, is_cancelled);

-- RLS: anon sees non-cancelled events from any festival (app filters by festival_id in query)
alter table public.events enable row level security;

create policy "anon_read_active_events"
  on public.events for select
  using (is_cancelled = false);

create policy "admin_all_events"
  on public.events for all
  using     (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── ANNOUNCEMENTS ──────────────────────────────────────────
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  festival_id text not null references public.festivals(id) on delete cascade,
  title       text not null,
  message     text,
  severity    text not null default 'info' check (severity in ('info','warning','critical')),
  event_id    text references public.events(id) on delete set null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "anon_read_active_announcements"
  on public.announcements for select
  using (is_active = true);

create policy "admin_all_announcements"
  on public.announcements for all
  using     (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
