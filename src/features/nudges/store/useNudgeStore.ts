import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_NUDGE_STATE, type NudgeId, type NudgeState } from "../lib/types";

/**
 * Behaviour counters used by nudge triggers. They never decrement — the
 * engine reasons about thresholds, not deltas.
 */
export interface BehaviorCounters {
	appOpens: number;
	eventViews: number;
	mapVisits: number;
	agendaVisits: number;
}

interface NudgeStoreState {
	behavior: BehaviorCounters;
	nudges: Partial<Record<NudgeId, NudgeState>>;

	getState: (id: NudgeId) => NudgeState;
	recordShown: (id: NudgeId) => void;
	dismiss: (id: NudgeId) => void;
	complete: (id: NudgeId) => void;

	bumpAppOpen: () => void;
	bumpEventView: () => void;
	bumpMapVisit: () => void;
	bumpAgendaVisit: () => void;

	/** Test/debug only — clears persisted state. */
	resetAll: () => void;
}

const INITIAL_BEHAVIOR: BehaviorCounters = {
	appOpens: 0,
	eventViews: 0,
	mapVisits: 0,
	agendaVisits: 0,
};

export const useNudgeStore = create<NudgeStoreState>()(
	persist(
		(set, get) => ({
			behavior: INITIAL_BEHAVIOR,
			nudges: {},

			getState: (id) => get().nudges[id] ?? DEFAULT_NUDGE_STATE,

			recordShown: (id) =>
				set((s) => {
					const prev = s.nudges[id] ?? DEFAULT_NUDGE_STATE;
					return {
						nudges: {
							...s.nudges,
							[id]: {
								...prev,
								shownCount: prev.shownCount + 1,
								lastShownTs: Date.now(),
							},
						},
					};
				}),

			dismiss: (id) =>
				set((s) => {
					const prev = s.nudges[id] ?? DEFAULT_NUDGE_STATE;
					return {
						nudges: { ...s.nudges, [id]: { ...prev, dismissed: true } },
					};
				}),

			complete: (id) =>
				set((s) => {
					const prev = s.nudges[id] ?? DEFAULT_NUDGE_STATE;
					return {
						nudges: { ...s.nudges, [id]: { ...prev, completed: true } },
					};
				}),

			bumpAppOpen: () =>
				set((s) => ({ behavior: { ...s.behavior, appOpens: s.behavior.appOpens + 1 } })),
			bumpEventView: () =>
				set((s) => ({ behavior: { ...s.behavior, eventViews: s.behavior.eventViews + 1 } })),
			bumpMapVisit: () =>
				set((s) => ({ behavior: { ...s.behavior, mapVisits: s.behavior.mapVisits + 1 } })),
			bumpAgendaVisit: () =>
				set((s) => ({ behavior: { ...s.behavior, agendaVisits: s.behavior.agendaVisits + 1 } })),

			resetAll: () => set({ behavior: INITIAL_BEHAVIOR, nudges: {} }),
		}),
		{
			name: "santes-nudges",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (s) => ({ behavior: s.behavior, nudges: s.nudges }),
		},
	),
);
