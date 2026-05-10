/**
 * Event repository — single source of truth for event data.
 * Backed by Supabase (`events` table). RLS handles visibility.
 *
 * To fall back to mock data during development without Supabase credentials,
 * swap the export to `new MockEventRepository()` and import from "./mock".
 */

import { SupabaseEventRepository } from "./supabase-repository";
import type { Event } from "./types";

export interface EventRepository {
	getAll(): Promise<Event[]>;
	getById(id: string): Promise<Event | undefined>;
}

export const eventRepository: EventRepository = new SupabaseEventRepository();
