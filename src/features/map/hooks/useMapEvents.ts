import type { RawEvent } from '@/entities/event';
import { useAgenda } from '@/features/agenda';
import { useMemo } from 'react';

/**
 * Map-specific event hook.
 * - mapEvents:    only 'now' + 'upcoming' — actionable, shown as markers
 * - drawerEvents: all events of the selected day (including 'finished') — shown in list
 * - rest:         day navigation from useAgenda
 */
export function useMapEvents(events: RawEvent[]) {
  const agenda = useAgenda(events);

  const mapEvents = useMemo(
    () => agenda.filtered.filter((e) => e.state !== 'finished'),
    [agenda.filtered],
  );

  return {
    ...agenda,
    mapEvents,
    drawerEvents: agenda.filtered,
  };
}
