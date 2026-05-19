/**
 * Seed script — migrates MOCK_EVENTS (arxiu Les Santes 2025) to Supabase.
 *
 * MOCK_EVENTS conté el programa de Les Santes 2025 (dates juliol 2025, IDs
 * `ls25-XXX`). Per defecte aquest script els sembra amb `festival_id =
 * 'les-santes-2025'`. Per a edicions futures (2026, 2027, …) NO es reutilitza
 * aquest mock: els nous events s'insereixen directament a la taula `events`
 * (via dashboard d'admin) amb el seu propi `festival_id`.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJ... \
 *   FESTIVAL_ID=les-santes-2025 \
 *   npx tsx scripts/seed-events.ts
 *
 * Use the SERVICE ROLE key (bypasses RLS) — never expose it in the app.
 * Get it from: Supabase Dashboard → Settings → API → service_role
 *
 * Run AFTER executing app/supabase/schema.sql in the Supabase SQL editor.
 * Safe to re-run: uses upsert (on conflict id → update).
 */

import { createClient } from '@supabase/supabase-js';
import { MOCK_EVENTS_2026, MOCK_FESTIVAL_ID_2026 } from '../src/entities/event/mock-2026';
import type { RawEvent, RoutePoint } from '../src/entities/event/types';

const url        = process.env.SUPABASE_URL ?? '';
const key        = process.env.SUPABASE_SERVICE_KEY ?? '';
const FESTIVAL_ID = process.env.FESTIVAL_ID ?? MOCK_FESTIVAL_ID_2026;

if (!url || !key) {
  console.error('❌  Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

interface EventInsertRow {
  id: string;
  festival_id: string;
  title: string;
  type: string;
  category: string;
  kind: string;
  short_description: string;
  start_time: string;
  end_time: string;
  image_url: string | null;
  blurhash: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_name: string | null;
  route: RoutePoint[] | null;
  is_cancelled: boolean;
}

function toRow(event: RawEvent): EventInsertRow {
  const base = {
    id: event.id,
    festival_id: FESTIVAL_ID,
    title: event.title,
    type: event.type,
    category: event.category,
    kind: event.kind,
    short_description: event.shortDescription,
    start_time: event.start,
    end_time: event.end,
    image_url: event.imageUrl ?? null,
    blurhash: event.blurhash ?? null,
    location_name: event.locationName ?? null,
    is_cancelled: false,
  };

  if (event.kind === 'mobile') {
    return { ...base, route: event.route, location_lat: null, location_lng: null };
  }

  return {
    ...base,
    location_lat: event.location.lat,
    location_lng: event.location.lng,
    route: null,
  };
}

async function seed() {
  // 1. Upsert the festival record first (FK constraint)
  console.log(`⏳  Upserting festival "${FESTIVAL_ID}"...`);
  const { error: festivalError } = await supabase
    .from('festivals')
    .upsert({
      id:        FESTIVAL_ID,
      name:      process.env.FESTIVAL_NAME      ?? 'Les Santes 2026',
      city:      process.env.FESTIVAL_CITY      ?? 'Mataró',
      year:      parseInt(process.env.FESTIVAL_YEAR ?? '2026', 10),
      starts_on: process.env.FESTIVAL_START     ?? '2026-07-18',
      ends_on:   process.env.FESTIVAL_END       ?? '2026-07-29',
    }, { onConflict: 'id' });

  if (festivalError) {
    console.error('❌  Festival upsert failed:', festivalError.message);
    process.exit(1);
  }
  console.log(`   ✓  Festival record ready`);

  // 2. Seed events with festival_id
  const rows = MOCK_EVENTS_2026.map(toRow);
  console.log(`⏳  Seeding ${rows.length} events...`);

  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('events')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌  Batch ${i}–${i + batch.length} failed:`, error.message);
      process.exit(1);
    }
    console.log(`   ✓  ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }

  console.log(`✅  All ${rows.length} events seeded for "${FESTIVAL_ID}".`);
}

seed().catch((err) => {
  console.error('❌  Unexpected error:', err);
  process.exit(1);
});
