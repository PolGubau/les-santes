import { i18n } from '@/shared/i18n';
import {
  formatDayChip,
  formatDayChipFromKey,
  formatDayFull,
  formatTime,
  toDateKey,
  toFestivalDayKey,
} from '@/shared/lib/time';

describe('time helpers', () => {
  const originalLocale = i18n.locale;
  afterEach(() => {
    i18n.locale = originalLocale;
  });

  describe('toDateKey', () => {
    it('formats local Y-M-D with zero-padding', () => {
      expect(toDateKey(new Date(2026, 6, 27, 14, 0))).toBe('2026-07-27');
      expect(toDateKey(new Date(2026, 0, 5, 0, 0))).toBe('2026-01-05');
    });
  });

  describe('toFestivalDayKey', () => {
    it('returns the calendar day after 06:00', () => {
      expect(toFestivalDayKey(new Date(2026, 6, 27, 10, 0))).toBe('2026-07-27');
    });

    it('counts post-midnight events as the previous festival day', () => {
      // 01:00 Sunday belongs to "Saturday night"
      expect(toFestivalDayKey(new Date(2026, 6, 27, 1, 0))).toBe('2026-07-26');
      expect(toFestivalDayKey(new Date(2026, 6, 27, 5, 59))).toBe('2026-07-26');
    });

    it('flips at 06:00 sharp', () => {
      expect(toFestivalDayKey(new Date(2026, 6, 27, 6, 0))).toBe('2026-07-27');
    });
  });

  describe('formatTime', () => {
    it('returns 24h HH:MM zero-padded', () => {
      expect(formatTime('2026-07-27T09:05:00')).toBe('09:05');
      expect(formatTime('2026-07-27T23:59:00')).toBe('23:59');
    });
  });

  describe('locale-aware formatters', () => {
    it('formatDayFull returns Catalan strings in ca', () => {
      i18n.locale = 'ca';
      const out = formatDayFull('2026-07-27');
      // "Dilluns 27 de juliol" — assert weekday capitalization + month name
      expect(out).toMatch(/^Dilluns/);
      expect(out.toLowerCase()).toContain('juliol');
    });

    it('formatDayFull returns Spanish strings in es', () => {
      i18n.locale = 'es';
      const out = formatDayFull('2026-07-27');
      expect(out).toMatch(/^Lunes/);
      expect(out.toLowerCase()).toContain('julio');
    });

    it('formatDayFull returns English strings in en', () => {
      i18n.locale = 'en';
      const out = formatDayFull('2026-07-27');
      expect(out).toMatch(/^Monday/);
      expect(out).toContain('July');
    });

    it('formatDayChip strips trailing punctuation from short weekday', () => {
      i18n.locale = 'es';
      const out = formatDayChipFromKey('2026-07-27');
      // Spanish short weekday is "lun." — capitalized, no trailing dot
      expect(out).not.toContain('.');
      expect(out).toMatch(/^[A-Za-zÁ-ÿ]+ 27$/);
    });

    it('formatDayChip from Date matches formatDayChipFromKey for the same day', () => {
      i18n.locale = 'ca';
      const date = new Date(2026, 6, 27, 12, 0); // noon avoids TZ flips
      expect(formatDayChip(date)).toBe(formatDayChipFromKey('2026-07-27'));
    });
  });
});
