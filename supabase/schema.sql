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

-- ─── FEEDBACK ───────────────────────────────────────────────
-- In-app, context-aware user feedback. Anon clients may INSERT only;
-- reads are reserved for authenticated admins. festival_id is nullable
-- (set client-side from EXPO_PUBLIC_FESTIVAL_ID) so anon inserts never
-- require a join against festivals to pass RLS.
create table if not exists public.feedback (
  id           uuid primary key default gen_random_uuid(),
  festival_id  text references public.festivals(id) on delete set null,
  rating       int  not null check (rating between 1 and 5),
  type         text not null check (type in ('bug','suggestion','general')),
  message      text,
  tags         text[] not null default '{}',
  context      jsonb  not null default '{}'::jsonb,
  app_version  text,
  platform     text check (platform in ('ios','android','web')),
  locale       text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_feedback_festival   on public.feedback (festival_id);
create index if not exists idx_feedback_created_at on public.feedback (created_at desc);
create index if not exists idx_feedback_type       on public.feedback (type);

alter table public.feedback enable row level security;

create policy "anon_insert_feedback"
  on public.feedback for insert
  with check (true);

create policy "admin_read_feedback"
  on public.feedback for select
  using (auth.role() = 'authenticated');

create policy "admin_all_feedback"
  on public.feedback for all
  using     (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── ANALYTICS EVENTS ───────────────────────────────────────
-- Anonymous, install-scoped behavioural events. The app fires
-- inserts only; the admin panel reads aggregates.
create table if not exists public.analytics_events (
  id           bigserial primary key,
  festival_id  text not null references public.festivals(id) on delete cascade,
  event_name   text not null,
  properties   jsonb not null default '{}'::jsonb,
  install_id   text not null,
  session_id   text,
  platform     text,
  app_version  text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_analytics_event_name on public.analytics_events (event_name, created_at desc);
create index if not exists idx_analytics_festival   on public.analytics_events (festival_id, created_at desc);
create index if not exists idx_analytics_install    on public.analytics_events (install_id);
create index if not exists idx_analytics_created    on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;

create policy "anon_insert_analytics"
  on public.analytics_events for insert with check (true);

create policy "admin_read_analytics"
  on public.analytics_events for select
  using (auth.role() = 'authenticated');

-- ─── ANALYTICS RETENTION ────────────────────────────────────
-- Behavioural data is only useful while it is recent. Anything older than
-- 90 days is dropped to keep the table small and respect free-tier limits.
-- The function is SECURITY DEFINER so the scheduled job can run without
-- needing extra grants on public.analytics_events.
create or replace function public.prune_old_analytics()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.analytics_events
  where created_at < now() - interval '90 days';
$$;

-- Schedule a daily prune at 03:30 UTC. pg_cron lives in the `cron` schema
-- and is a no-op when the extension is not available (e.g. local dev).
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.unschedule('prune-analytics-events-daily')
      where exists (
        select 1 from cron.job where jobname = 'prune-analytics-events-daily'
      );
    perform cron.schedule(
      'prune-analytics-events-daily',
      '30 3 * * *',
      $cron$select public.prune_old_analytics();$cron$
    );
  end if;
end
$$;
