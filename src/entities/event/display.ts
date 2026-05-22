import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import type { EventState, EventType } from './types';

/**
 * Maps event state to its accent color.
 * Single source of truth – used by StateBadge, AgendaList, EventDetailSheet,
 * MapEventsDrawer, etc.
 */
export const STATE_COLOR: Record<EventState, string> = {
  now: Colors.stateNow,
  upcoming: Colors.stateUpcoming,
  finished: Colors.stateFinished,
};

/**
 * Returns the short label for an event state using the current locale.
 * Called lazily at render time so it always reflects the hydrated locale.
 */
export function getStateLabel(state: EventState): string {
  return t(`eventState.${state}`);
}

/**
 * Returns the localized label for an event type (backend identifier).
 * Called lazily so it reflects the hydrated locale at render time.
 */
export function getEventTypeLabel(type: EventType): string {
  return t(`eventTypes.${type}`);
}
