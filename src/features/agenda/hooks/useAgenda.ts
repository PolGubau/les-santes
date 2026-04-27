import { useMemo, useState } from 'react';
import type { Event, EventCategory, EventType } from '@/entities/event';

export interface AgendaFilters {
  type?: EventType;
  category?: EventCategory;
}

export function useAgenda(events: Event[]) {
  const [filters, setFilters] = useState<AgendaFilters>({});

  const filtered = useMemo(() => {
    return events
      .filter((e) => {
        if (filters.type && e.type !== filters.type) return false;
        if (filters.category && e.category !== filters.category) return false;
        return true;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [events, filters]);

  const setType = (type: EventType | undefined) =>
    setFilters((f) => ({ ...f, type }));

  const setCategory = (category: EventCategory | undefined) =>
    setFilters((f) => ({ ...f, category }));

  const clearFilters = () => setFilters({});

  return { filtered, filters, setType, setCategory, clearFilters };
}
