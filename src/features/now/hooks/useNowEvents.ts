import { useMemo } from 'react';
import type { Event } from '@/entities/event';
import { useNow } from '@/shared/hooks';
import { computeState } from '@/shared/lib';

export function useNowEvents(events: Event[]): Event[] {
  useNow(15_000); // re-render every 15 s

  return useMemo(
    () =>
      events.filter(
        (e) => computeState(e.start, e.end) === 'now',
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, Date.now()],
  );
}
