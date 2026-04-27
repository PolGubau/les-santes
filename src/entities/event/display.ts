import { Colors } from '@/shared/constants';
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
 * Short labels for badges and list rows.
 * For section headers use context-specific labels co-located with the UI.
 */
export const STATE_LABEL_SHORT: Record<EventState, string> = {
  now: 'Ara',
  upcoming: 'Pròxim',
  finished: 'Finalitzat',
};
