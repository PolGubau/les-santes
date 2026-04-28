/**
 * Event repository — single source of truth for event data.
 *
 * Currently backed by static mock data.
 * Swap `fetchEvents` implementation to hit Supabase when ready:
 *
 *   import { supabase } from '@/shared/lib/supabase';
 *   const { data } = await supabase.from('events').select('*');
 */

import { MOCK_EVENTS } from "./mock";
import { withState } from "./state";
import type { Event } from "./types";

export interface EventRepository {
	getAll(): Promise<Event[]>;
	getById(id: string): Promise<Event | undefined>;
}

/** In-memory repository backed by mock data. */
class MockEventRepository implements EventRepository {
	async getAll(): Promise<Event[]> {
		const now = new Date();
		return MOCK_EVENTS.map((e) => withState(e, now));
	}

	async getById(id: string): Promise<Event | undefined> {
		const now = new Date();
		const raw = MOCK_EVENTS.find((e) => e.id === id);
		return raw ? withState(raw, now) : undefined;
	}
}

export const eventRepository: EventRepository = new MockEventRepository();
