import type { Event, EventState } from '@/entities/event';
import { t } from '@/shared/i18n';

export interface Section {
  title: string;
  state: EventState;
  data: Event[];
}

const STATE_ORDER: EventState[] = ['now', 'upcoming', 'finished'];

/** Agenda-specific section titles (longer form, not shared with badges). */
const SECTION_LABEL_KEY: Record<EventState, string> = {
  now: 'agenda.sectionNow',
  upcoming: 'agenda.sectionUpcoming',
  finished: 'agenda.sectionFinished',
};

/** Groups events by state and returns ordered, non-empty sections. */
export function buildSections(events: Event[]): Section[] {
  const groups: Record<EventState, Event[]> = { now: [], upcoming: [], finished: [] };
  for (const e of events) groups[e.state].push(e);
  return STATE_ORDER
    .filter((s) => groups[s].length > 0)
    .map((s) => ({ title: t(SECTION_LABEL_KEY[s]), state: s, data: groups[s] }));
}
