import type { Event, EventState } from '@/entities/event';

export interface Section {
  title: string;
  state: EventState;
  data: Event[];
}

const STATE_ORDER: EventState[] = ['now', 'upcoming', 'finished'];

/** Agenda-specific section titles (longer form, not shared with badges). */
const SECTION_LABEL: Record<EventState, string> = {
  now: 'Ara mateix',
  upcoming: 'Pròxims',
  finished: 'Finalitzats',
};

/** Groups events by state and returns ordered, non-empty sections. */
export function buildSections(events: Event[]): Section[] {
  const groups: Record<EventState, Event[]> = { now: [], upcoming: [], finished: [] };
  for (const e of events) groups[e.state].push(e);
  return STATE_ORDER
    .filter((s) => groups[s].length > 0)
    .map((s) => ({ title: SECTION_LABEL[s], state: s, data: groups[s] }));
}
