/**
 * Global Jest setup, runs once per test file before the framework loads.
 *
 * jest-expo already mocks AsyncStorage, expo-constants, expo-font, the
 * native modules registry, etc. We only add stubs for things specific to
 * this app that the default preset doesn't cover.
 */

// AsyncStorage ships its own Jest mock — wire it up so any module that imports
// it (cache, persisted zustand stores) works in the Node test environment.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// `expo-localization` is consumed at module import time by `shared/i18n` to
// resolve the device locale. The default jest-expo mock returns an empty
// array, which is fine, but we lock it to Catalan here so locale-sensitive
// tests have a deterministic baseline.
jest.mock('expo-localization', () => ({
  getLocales: () => [
    { languageCode: 'ca', languageTag: 'ca-ES', regionCode: 'ES' },
  ],
}));

// expo-quick-actions / expo-notifications / expo-router are only required by
// UI code paths we don't exercise in unit tests yet; provide minimal stubs so
// any incidental import doesn't blow up the test runner.
jest.mock('expo-quick-actions', () => ({
  setItems: jest.fn(),
  isSupported: jest.fn(() => false),
}));

jest.mock('expo-quick-actions/router', () => ({
  useQuickActionRouting: jest.fn(),
}));

// Silence the noisy reanimated warning in tests — we don't run animations.
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// Default `__DEV__` to true; some code branches on it (analytics logging).
// @ts-expect-error - global injected by RN at runtime
global.__DEV__ = true;
