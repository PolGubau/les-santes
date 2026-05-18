import { Colors } from '@/shared/constants';
import { t } from '@/shared/i18n';
import type { EventState } from './types';

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
