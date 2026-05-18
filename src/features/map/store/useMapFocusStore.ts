import { create } from 'zustand';

interface MapFocusState {
  focusedEventId: string | null;
  /** ISO 8601 start of the focused event — stored alongside id so consumers
   *  can resolve the festival day without looking up MOCK_EVENTS. */
  focusedEventStart: string | null;
  focusEvent: (id: string, start: string) => void;
  clearFocus: () => void;
}

export const useMapFocusStore = create<MapFocusState>((set) => ({
  focusedEventId: null,
  focusedEventStart: null,
  focusEvent: (id, start) => set({ focusedEventId: id, focusedEventStart: start }),
  clearFocus: () => set({ focusedEventId: null, focusedEventStart: null }),
}));
