import { useMemo } from 'react';
import type { Event, RoutePoint } from '@/entities/event';
import { interpolatePosition } from '@/shared/lib';
import { useNow } from '@/shared/hooks';

export interface MobilePosition {
  eventId: string;
  position: RoutePoint;
}

export function useEventPositions(events: Event[]): MobilePosition[] {
  useNow(5_000); // re-render every 5 s

  return useMemo(() => {
    return events
      .filter((e) => e.kind === 'mobile' && e.route && e.durationMinutes)
      .flatMap((e) => {
        const pos = interpolatePosition(e.route!, e.start, e.durationMinutes!);
        if (!pos) return [];
        return [{ eventId: e.id, position: pos }];
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, Date.now()]);
}
