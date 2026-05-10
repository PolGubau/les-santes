import type { Event } from '@/entities/event';
import { useCallback, useMemo, useState } from 'react';

interface UseMapSearchReturn {
  searchText: string;
  filteredEvents: Event[];
  isSearching: boolean;
  handleSearchChange: (text: string) => void;
  handleSearchFocus: () => void;
}

/**
 * SRP: owns search text and filtered events derivation.
 * Notifies the caller when search active state changes so selection
 * can be reset externally — no cross-concern coupling inside this hook.
 */
export function useMapSearch(
  events: Event[],
  onIsSearchingChange: (isSearching: boolean) => void,
): UseMapSearchReturn {
  const [searchText, setSearchText] = useState('');

  const isSearching = searchText.trim().length > 0;

  const filteredEvents = useMemo(() => {
    if (!isSearching) return events;
    const q = searchText.toLowerCase();
    return events.filter((e) => e.title.toLowerCase().includes(q));
  }, [events, searchText, isSearching]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      onIsSearchingChange(text.trim().length > 0);
    },
    [onIsSearchingChange],
  );

  const handleSearchFocus = useCallback(() => {
    if (searchText.trim().length > 0) onIsSearchingChange(true);
  }, [searchText, onIsSearchingChange]);

  return { searchText, filteredEvents, isSearching, handleSearchChange, handleSearchFocus };
}
