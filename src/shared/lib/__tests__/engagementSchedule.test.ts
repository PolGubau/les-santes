/**
 * Unit tests for buildEngagementSchedule — the pure function that computes
 * which notifications to schedule and when.
 *
 * No async, no native modules, no mocks needed: the function is fully pure.
 */
import {
  buildEngagementSchedule,
  ENGAGEMENT_NOTIF_PREFIX,
} from '@/shared/lib/notifications';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Create a Date at a specific UTC-like local date (year, month 1-based, day). */
function d(year: number, month: number, day: number, hour = 0): Date {
  return new Date(year, month - 1, day, hour);
}

/**
 * Festival stand-in: always 60 days from now in the baseline tests so the
 * date wall doesn't interfere unless we're explicitly testing it.
 */
const FAR_FESTIVAL = d(2099, 12, 31);

// ── Core contract ──────────────────────────────────────────────────────────

describe('buildEngagementSchedule', () => {
  describe('return value shape', () => {
    it('returns an array of EngagementSlot objects', () => {
      const result = buildEngagementSchedule(d(2026, 5, 1), 1, FAR_FESTIVAL, 3);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);

      const [first] = result;
      expect(typeof first.slot).toBe('number');
      expect(typeof first.identifier).toBe('string');
      expect(first.triggerDate).toBeInstanceOf(Date);
      expect(typeof first.bodyIndex).toBe('number');
    });

    it('identifiers use the ENGAGEMENT_NOTIF_PREFIX constant', () => {
      const schedule = buildEngagementSchedule(d(2026, 5, 1), 1, FAR_FESTIVAL, 5);
      for (const s of schedule) {
        expect(s.identifier).toMatch(new RegExp(`^${ENGAGEMENT_NOTIF_PREFIX}`));
        expect(s.identifier).toBe(`${ENGAGEMENT_NOTIF_PREFIX}${s.slot}`);
      }
    });

    it('triggers are always set to 11:00:00.000', () => {
      const schedule = buildEngagementSchedule(d(2026, 5, 1), 1, FAR_FESTIVAL);
      for (const { triggerDate } of schedule) {
        expect(triggerDate.getHours()).toBe(11);
        expect(triggerDate.getMinutes()).toBe(0);
        expect(triggerDate.getSeconds()).toBe(0);
        expect(triggerDate.getMilliseconds()).toBe(0);
      }
    });
  });

  // ── Cadence ──────────────────────────────────────────────────────────────

  describe('daily cadence (frequencyDays = 1)', () => {
    it('schedules slots on consecutive days starting tomorrow', () => {
      const now = d(2026, 5, 1); // 1 May
      const schedule = buildEngagementSchedule(now, 1, FAR_FESTIVAL, 5);

      expect(schedule[0].triggerDate.getDate()).toBe(2); // 2 May
      expect(schedule[1].triggerDate.getDate()).toBe(3); // 3 May
      expect(schedule[4].triggerDate.getDate()).toBe(6); // 6 May
    });

    it('produces 14 slots by default', () => {
      expect(buildEngagementSchedule(d(2026, 1, 1), 1, FAR_FESTIVAL)).toHaveLength(14);
    });
  });

  describe('every-2-days cadence (frequencyDays = 2)', () => {
    it('schedules slots every 2 days', () => {
      const now = d(2026, 5, 1); // 1 May
      const schedule = buildEngagementSchedule(now, 2, FAR_FESTIVAL, 5);

      expect(schedule[0].triggerDate.getDate()).toBe(3);  // +2 days
      expect(schedule[1].triggerDate.getDate()).toBe(5);  // +4 days
      expect(schedule[2].triggerDate.getDate()).toBe(7);  // +6 days
    });
  });

  // ── Festival cutoff ───────────────────────────────────────────────────────

  describe('festival start cutoff', () => {
    it('returns empty array when now >= festivalStart', () => {
      const festivalStart = d(2026, 7, 24);
      expect(buildEngagementSchedule(festivalStart, 1, festivalStart)).toHaveLength(0);
      expect(buildEngagementSchedule(d(2026, 8, 1), 1, festivalStart)).toHaveLength(0);
    });

    it('stops before the festival date', () => {
      // now = 3 days before festival, daily cadence, 14 slots
      const now = d(2026, 7, 21);            // 21 Jul
      const festivalStart = d(2026, 7, 24);  // 24 Jul
      const schedule = buildEngagementSchedule(now, 1, festivalStart);

      // Only slots for 22 Jul, 23 Jul should be included (24 Jul is cutoff)
      expect(schedule).toHaveLength(2);
      expect(schedule[0].triggerDate.getDate()).toBe(22);
      expect(schedule[1].triggerDate.getDate()).toBe(23);
    });

    it('returns zero slots when every computed date lands on/after festival', () => {
      const now = d(2026, 7, 23);            // 23 Jul (day before festival)
      const festivalStart = d(2026, 7, 24);  // 24 Jul
      // frequencyDays = 2 → first slot would be 25 Jul → beyond cutoff
      const schedule = buildEngagementSchedule(now, 2, festivalStart);
      expect(schedule).toHaveLength(0);
    });
  });

  // ── Body index cycling ────────────────────────────────────────────────────

  describe('body index cycling', () => {
    it('bodyIndex stays in [0, 13] for the default 14-slot window', () => {
      const schedule = buildEngagementSchedule(d(2026, 1, 1), 1, FAR_FESTIVAL);
      for (const { bodyIndex } of schedule) {
        expect(bodyIndex).toBeGreaterThanOrEqual(0);
        expect(bodyIndex).toBeLessThanOrEqual(13);
      }
    });

    it('cycles body index when slots > 14', () => {
      // Use a very far festival and 28 slots to force 2 full cycles
      const schedule = buildEngagementSchedule(d(2026, 1, 1), 1, FAR_FESTIVAL, 28);
      expect(schedule[0].bodyIndex).toBe(0);
      expect(schedule[13].bodyIndex).toBe(13);
      expect(schedule[14].bodyIndex).toBe(0); // wraps
      expect(schedule[27].bodyIndex).toBe(13);
    });
  });

  // ── Slot index / identifier consistency ───────────────────────────────────

  describe('slot index consistency', () => {
    it('slot values are sequential from 0', () => {
      const schedule = buildEngagementSchedule(d(2026, 5, 1), 1, FAR_FESTIVAL, 5);
      schedule.forEach((s, i) => expect(s.slot).toBe(i));
    });
  });
});
