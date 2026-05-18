import { create } from 'zustand';

/**
 * Global store to request the agenda tab to jump to a specific day.
 * Works similarly to useMapFocusStore — any screen can call requestDay()
 * and the agenda screen will sync the selection on the next render.
 */
interface AgendaFocusState {
  requestedDay: string | null; // YYYY-MM-DD
  requestDay: (day: string) => void;
  clearDay: () => void;
}

export const useAgendaFocusStore = create<AgendaFocusState>((set) => ({
  requestedDay: null,
  requestDay: (day) => set({ requestedDay: day }),
  clearDay: () => set({ requestedDay: null }),
}));
