import { normalizeLocale } from '@/shared/i18n';

describe('normalizeLocale', () => {
  it.each([
    ['ca', 'ca'],
    ['es', 'es'],
    ['en', 'en'],
  ])('passes through supported bare codes (%s)', (input, expected) => {
    expect(normalizeLocale(input)).toBe(expected);
  });

  it.each([
    ['en-US', 'en'],
    ['en-GB', 'en'],
    ['es-419', 'es'],
    ['es_MX', 'es'],
    ['ca-ES', 'ca'],
    ['CA', 'ca'],
    ['EN-us', 'en'],
  ])('strips region and lowercases (%s -> %s)', (input, expected) => {
    expect(normalizeLocale(input)).toBe(expected);
  });

  it.each([
    null,
    undefined,
    '',
    'fr',
    'pt-BR',
    'zh-CN',
    'xx',
  ])('returns null for unsupported or empty input (%p)', (input) => {
    expect(normalizeLocale(input as string | null | undefined)).toBeNull();
  });
});
