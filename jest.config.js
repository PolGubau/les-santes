/**
 * Jest configuration for the Expo app.
 *
 * - `jest-expo` preset bundles the right transformers, setup, and module
 *   stubs (AsyncStorage, expo-constants, etc.) for React Native + Expo.
 * - `@/` alias mirrors the babel/tsconfig path mapping so imports stay
 *   identical between runtime and tests.
 * - The default jest-expo `transformIgnorePatterns` excludes node_modules
 *   except the RN/Expo packages that ship ES modules; we extend that list
 *   for the extra ESM-only deps used by this app.
 */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@gorhom/.*|react-native-reanimated|react-native-gesture-handler|@supabase/.*|i18n-js))',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};
