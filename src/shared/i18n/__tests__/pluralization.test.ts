import { i18n, t } from '@/shared/i18n';

/**
 * Locks down pluralization of the local-notification body across all three
 * supported locales. Regression coverage for the "1 minuts" bug.
 */
describe('notification.eventStartingSoonBody pluralization', () => {
  const originalLocale = i18n.locale;
  afterAll(() => {
    i18n.locale = originalLocale;
  });

  const cases: Array<{
    locale: 'ca' | 'es' | 'en';
    one: (title: string) => string;
    other: (title: string, n: number) => string;
  }> = [
    {
      locale: 'ca',
      one: (title) => `${title} comença en 1 minut`,
      other: (title, n) => `${title} comença en ${n} minuts`,
    },
    {
      locale: 'es',
      one: (title) => `${title} empieza en 1 minuto`,
      other: (title, n) => `${title} empieza en ${n} minutos`,
    },
    {
      locale: 'en',
      one: (title) => `${title} starts in 1 minute`,
      other: (title, n) => `${title} starts in ${n} minutes`,
    },
  ];

  for (const { locale, one, other } of cases) {
    describe(locale, () => {
      beforeEach(() => {
        i18n.locale = locale;
      });

      it('uses singular form for count = 1', () => {
        expect(
          t('notification.eventStartingSoonBody', { title: 'Cercavila', count: 1 }),
        ).toBe(one('Cercavila'));
      });

      it.each([2, 5, 10, 30])('uses plural form for count = %i', (count) => {
        expect(
          t('notification.eventStartingSoonBody', { title: 'Cercavila', count }),
        ).toBe(other('Cercavila', count));
      });
    });
  }
});
