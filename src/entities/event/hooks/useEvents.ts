import { useEffect, useState } from "react";
import { eventRepository } from "../repository";
import type { Event } from "../types";

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Hook to load all events from the repository.
 * The `state` (now / upcoming / finished) is recomputed on each fetch.
 * Call `refresh()` to force a re-fetch (e.g. pull-to-refresh).
 */
export function useEvents(): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    eventRepository
      .getAll()
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refresh = () => setTick((t) => t + 1);

  return { events, loading, error, refresh };
}
