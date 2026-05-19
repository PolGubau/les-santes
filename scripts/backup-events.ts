/**
 * Backup script — dumps all events of a festival to a JSON file.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJ... \
 *   FESTIVAL_ID=les-santes-2025 \
 *   npx tsx scripts/backup-events.ts
 *
 * Output: internal/data/events-<FESTIVAL_ID>.json
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const url         = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key         = process.env.SUPABASE_SERVICE_KEY ?? '';
const FESTIVAL_ID = process.env.FESTIVAL_ID ?? 'les-santes-2025';

if (!url || !key) {
  console.error('❌  Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log(`⬇️  Fetching events for festival: ${FESTIVAL_ID} …`);

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('festival_id', FESTIVAL_ID)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('❌  Supabase error:', error.message);
    process.exit(1);
  }

  const outPath = join(__dirname, '..', 'internal', 'data', `events-${FESTIVAL_ID}.json`);
  const payload = {
    _meta: {
      festival_id:  FESTIVAL_ID,
      exported_at:  new Date().toISOString(),
      total_events: data?.length ?? 0,
    },
    events: data ?? [],
  };

  writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`✅  ${data?.length} events saved to ${outPath}`);
}

main();
