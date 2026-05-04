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
 * Short labels for badges and list rows.
 * For section headers use context-specific labels co-located with the UI.
 */
export const STATE_LABEL_SHORT: Record<EventState, string> = {
  now: t('eventState.now'),
  upcoming: t('eventState.upcoming'),
  finished: t('eventState.finished'),
};
