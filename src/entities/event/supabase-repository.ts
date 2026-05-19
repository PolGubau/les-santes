/**
 * SupabaseEventRepository
 *
 * Fetches events from the `events` table in Supabase.
 * RLS ensures anon users only see non-cancelled events.
 *
 * Column mapping (snake_case → camelCase):
 *   start_time        → start
 *   end_time          → end
 *   short_description → shortDescription
 *   image_url         → imageUrl
 *   location_lat/lng  → location.lat/lng
 *   location_name     → locationName
 *   route             → route (jsonb → RoutePoint[])
 *
 * icon is derived from `type` — no longer stored in the DB.
 */

import { FESTIVAL_ID } from '@/shared/constants/festival';
import { getSupabaseClient } from '@/shared/lib/supabase';
import { withState } from './state';
import type { Event, EventCategory, EventType, RawEvent, RoutePoint } from './types';
import type { EventRepository } from './repository';


/** Shape of a row returned by Supabase (snake_case, all nullable optional fields). */
interface EventRow {
  id: string;
  title: string;
  type: string;
  category: string;
  kind: string;
  short_description: string;
  description: string | null;
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

function rowToRawEvent(row: EventRow): RawEvent {
  const base = {
    id: row.id,
    title: row.title,
    type: row.type as EventType,
    category: row.category as EventCategory,
    shortDescription: row.short_description,
    description: row.description ?? undefined,
    start: row.start_time,
    end: row.end_time,
    imageUrl: row.image_url ?? undefined,
    blurhash: row.blurhash ?? undefined,
    locationName: row.location_name ?? undefined,
  };

  if (row.kind === 'mobile') {
    return { ...base, kind: 'mobile', route: row.route ?? [] };
  }

  return {
    ...base,
    kind: 'static',
    location: {
      lat: row.location_lat!,
      lng: row.location_lng!,
    },
  };
}

export class SupabaseEventRepository implements EventRepository {
  private get db() {
    return getSupabaseClient();
  }

  async getAll(): Promise<Event[]> {
    const { data, error } = await this.db
      .from('events')
      .select('*')
      .eq('festival_id', FESTIVAL_ID)
      .order('start_time', { ascending: true });

    if (error) throw new Error(`[EventRepository] getAll: ${error.message}`);

    const now = new Date();
    return (data as EventRow[]).map((row) => withState(rowToRawEvent(row), now));
  }

  async getById(id: string): Promise<Event | undefined> {
    const { data, error } = await this.db
      .from('events')
      .select('*')
      .eq('festival_id', FESTIVAL_ID)
      .eq('id', id)
      .single();

    if (error) {
      // PGRST116 = row not found — not an exception, just undefined
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`[EventRepository] getById(${id}): ${error.message}`);
    }

    const now = new Date();
    return withState(rowToRawEvent(data as EventRow), now);
  }
}
