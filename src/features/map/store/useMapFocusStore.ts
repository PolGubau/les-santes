import { create } from 'zustand';

interface MapFocusState {
  focusedEventId: string | null;
  focusEvent: (id: string) => void;
  clearFocus: () => void;
}

export const useMapFocusStore = create<MapFocusState>((set) => ({
  focusedEventId: null,
  focusEvent: (id) => set({ focusedEventId: id }),
  clearFocus: () => set({ focusedEventId: null }),
}));
