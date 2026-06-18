/**
 * Unit tests for buildDailyAgendaSchedule — the pure function that computes
 * which evening-before "tomorrow's programme" notifications to schedule.
 *
 * No async, no native modules, no mocks needed: the function is fully pure.
 * It only emits a slot for a festival day that has events, firing at 20:00
 * the previous calendar day, so "tomorrow" is never empty.
 */
import {
  buildDailyAgendaSchedule,
  DAILY_AGENDA_NOTIF_PREFIX,
} from '@/shared/lib/notifications';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Create a local Date (year, month 1-based, day, hour). */
function d(year: number, month: number, day: number, hour = 0): Date {
  return new Date(year, month - 1, day, hour);
}

// Well before the festival, so every computed trigger is in the future.
const BEFORE_FESTIVAL = d(2026, 7, 1);

describe('buildDailyAgendaSchedule', () => {
  describe('return value shape', () => {
    it('returns an array of DailyAgendaSlot objects', () => {
      const result = buildDailyAgendaSchedule(BEFORE_FESTIVAL, ['2026-07-18']);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);

      const [first] = result;
      expect(first.day).toBe('2026-07-18');
      expect(typeof first.identifier).toBe('string');
      expect(first.triggerDate).toBeInstanceOf(Date);
    });

    it('identifiers use the DAILY_AGENDA_NOTIF_PREFIX constant', () => {
      const schedule = buildDailyAgendaSchedule(BEFORE_FESTIVAL, [
        '2026-07-18',
        '2026-07-19',
      ]);
      for (const s of schedule) {
        expect(s.identifier).toBe(`${DAILY_AGENDA_NOTIF_PREFIX}${s.day}`);
      }
    });
  });

  // ── Trigger timing ─────────────────────────────────────────────────────────

  describe('trigger timing', () => {
    it('fires at 20:00 the calendar day before the festival day', () => {
      const [slot] = buildDailyAgendaSchedule(BEFORE_FESTIVAL, ['2026-07-18']);
      expect(slot.triggerDate.getFullYear()).toBe(2026);
      expect(slot.triggerDate.getMonth()).toBe(6); // July (0-based)
      expect(slot.triggerDate.getDate()).toBe(17); // eve before the 18th
      expect(slot.triggerDate.getHours()).toBe(20);
      expect(slot.triggerDate.getMinutes()).toBe(0);
      expect(slot.triggerDate.getSeconds()).toBe(0);
      expect(slot.triggerDate.getMilliseconds()).toBe(0);
    });

    it('honours a custom hour argument', () => {
      const [slot] = buildDailyAgendaSchedule(
        BEFORE_FESTIVAL,
        ['2026-07-18'],
        18,
      );
      expect(slot.triggerDate.getHours()).toBe(18);
    });

    it('crosses the month boundary correctly', () => {
      const [slot] = buildDailyAgendaSchedule(d(2026, 7, 1), ['2026-08-01']);
      expect(slot.triggerDate.getMonth()).toBe(6); // back into July
      expect(slot.triggerDate.getDate()).toBe(31);
    });
  });

  // ── Past cutoff ──────────────────────────────────────────────────────────

  describe('past cutoff', () => {
    it('skips slots whose trigger is already in the past', () => {
      // now = 20 Jul 21:00 → the 18th's eve (17 Jul 20:00) is long gone,
      // and the 21st's eve (20 Jul 20:00) is also past (now is 21:00).
      const now = d(2026, 7, 20, 21);
      const schedule = buildDailyAgendaSchedule(now, [
        '2026-07-18',
        '2026-07-21',
        '2026-07-25',
      ]);
      expect(schedule.map((s) => s.day)).toEqual(['2026-07-25']);
    });

    it('returns an empty array when every day is in the past', () => {
      const now = d(2026, 8, 1);
      expect(
        buildDailyAgendaSchedule(now, ['2026-07-18', '2026-07-19']),
      ).toHaveLength(0);
    });

    it('returns an empty array for no days with events', () => {
      expect(buildDailyAgendaSchedule(BEFORE_FESTIVAL, [])).toHaveLength(0);
    });
  });

  // ── Dedup & ordering ───────────────────────────────────────────────────────

  describe('dedup & ordering', () => {
    it('deduplicates repeated day keys', () => {
      const schedule = buildDailyAgendaSchedule(BEFORE_FESTIVAL, [
        '2026-07-18',
        '2026-07-18',
        '2026-07-18',
      ]);
      expect(schedule).toHaveLength(1);
    });

    it('sorts slots chronologically by trigger date', () => {
      const schedule = buildDailyAgendaSchedule(BEFORE_FESTIVAL, [
        '2026-07-25',
        '2026-07-18',
        '2026-07-21',
      ]);
      expect(schedule.map((s) => s.day)).toEqual([
        '2026-07-18',
        '2026-07-21',
        '2026-07-25',
      ]);
    });

    it('accepts any iterable (e.g. a Set) of day keys', () => {
      const days = new Set(['2026-07-18', '2026-07-19']);
      const schedule = buildDailyAgendaSchedule(BEFORE_FESTIVAL, days);
      expect(schedule).toHaveLength(2);
    });
  });
});
