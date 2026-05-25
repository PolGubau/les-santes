/**
 * AraScreen — integration tests for the three festival-window states.
 *
 * Strategy: mock `useNow` (and `useNowEvents` which also calls it) at the
 * module level so we can control the perceived clock without touching env
 * vars. Events are provided via the `useEvents` mock to produce a stable
 * "upcoming" list that feeds the "A continuació" section.
 */

// ─── Mocks (must be hoisted) ─────────────────────────────────────────────────

jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useRouter: () => ({ push: jest.fn() }) }));
jest.mock('expo-store-review', () => ({ isAvailableAsync: jest.fn().mockResolvedValue(false), requestReview: jest.fn() }));
jest.mock('expo-haptics', () => ({ impactAsync: jest.fn().mockResolvedValue(undefined), ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' } }));
jest.mock('@/features/analytics', () => ({ track: jest.fn() }));

// Stub heavy UI / native modules not relevant to these tests
jest.mock('@/features/now/components/HeroCard', () => {
  const { View, Text } = require('react-native');
  return { HeroCard: ({ event }: { event: { title: string } }) => <View><Text testID="hero-card">{event.title}</Text></View> };
});
jest.mock('@/features/now/components/NowCard', () => {
  const { View, Text } = require('react-native');
  return { NowCard: ({ event }: { event: { title: string } }) => <View><Text>{event.title}</Text></View> };
});
jest.mock('@/features/now/components/NowSkeleton', () => {
  const { View } = require('react-native');
  return { NowSkeleton: () => <View testID="now-skeleton" /> };
});
jest.mock('@/features/now/components/LiveClock', () => {
  const { View } = require('react-native');
  return { LiveClock: () => <View testID="live-clock" /> };
});
jest.mock('@/shared/ui/OfflineBanner', () => {
  const { View } = require('react-native');
  return { OfflineBanner: () => <View /> };
});

// Controllable clock — overridden per describe block
const mockClock = { current: new Date('2026-07-27T19:00:00') };
jest.mock('@/shared/hooks', () => {
  const actual = jest.requireActual('@/shared/hooks');
  return { ...actual, useNow: jest.fn(() => mockClock.current), useNavPush: jest.fn(() => jest.fn()) };
});
jest.mock('@/features/now/hooks/useNowEvents', () => ({
  useNowEvents: jest.fn(() => ({ now: [], upcoming: [] })),
}));

// Minimal event store
jest.mock('@/entities/event', () => ({
  ...jest.requireActual('@/entities/event'),
  useEvents: jest.fn(() => ({ events: [], loading: false, error: null, isOffline: false, isRefreshing: false, cacheTimestamp: null, refresh: jest.fn() })),
}));
jest.mock('@/entities/announcement', () => ({ useAnnouncements: jest.fn(() => []) }));
jest.mock('@/features/nudges', () => ({
  useNudge: jest.fn(() => ({ show: false })),
  useNudgeStore: jest.fn((selector: (s: { behavior: { appOpens: number } }) => unknown) => selector({ behavior: { appOpens: 0 } })),
  ContextualHint: () => null,
}));
jest.mock('@/features/favorites', () => ({
  useFavoritesStore: jest.fn(() => ({ favorites: {} })),
  FavoriteHeart: () => null,
}));

// ─── Imports ─────────────────────────────────────────────────────────────────

import { useNowEvents } from '@/features/now/hooks/useNowEvents';
import { render } from '@testing-library/react-native';
import React from 'react';

// Default export from the app directory
// eslint-disable-next-line @typescript-eslint/no-require-imports
const AraScreen = require('../../../../app/(tabs)/ara').default;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockUseNowEvents = useNowEvents as jest.Mock;

const UPCOMING_EVENT = {
  id: 'evt-upcoming',
  title: 'Cercavila de Gala',
  type: 'cercavila' as const,
  category: 'tradicional' as const,
  shortDescription: 'desc',
  start: '2026-07-24T18:00:00.000Z',
  end: '2026-07-24T20:00:00.000Z',
  kind: 'mobile' as const,
  state: 'upcoming' as const,
  route: [{ lat: 41.54, lng: 2.44 }],
};

const NOW_EVENT = { ...UPCOMING_EVENT, id: 'evt-now', state: 'now' as const };

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AraScreen — pre-festival (before 2026-07-24)', () => {
  beforeEach(() => {
    mockClock.current = new Date('2026-05-25T12:00:00');
    mockUseNowEvents.mockReturnValue({ now: [], upcoming: [UPCOMING_EVENT] });
  });

  it('shows the pre-festival countdown card', () => {
    const { getByText } = render(<AraScreen />);
    expect(getByText('Les Santes comença en')).toBeTruthy();
  });

  it('does NOT render the hero card', () => {
    const { queryByTestId } = render(<AraScreen />);
    expect(queryByTestId('hero-card')).toBeNull();
  });

  it('shows the upcoming section as a festival preview', () => {
    const { getByText } = render(<AraScreen />);
    expect(getByText('A continuació')).toBeTruthy();
    expect(getByText('Cercavila de Gala')).toBeTruthy();
  });
});

describe('AraScreen — festival active (2026-07-25)', () => {
  beforeEach(() => {
    mockClock.current = new Date('2026-07-25T19:00:00');
    mockUseNowEvents.mockReturnValue({ now: [NOW_EVENT], upcoming: [UPCOMING_EVENT] });
  });

  it('does NOT show the pre-festival countdown', () => {
    const { queryByText } = render(<AraScreen />);
    expect(queryByText('Les Santes comença en')).toBeNull();
  });

  it('renders the hero card with the live event', () => {
    const { getByTestId } = render(<AraScreen />);
    expect(getByTestId('hero-card')).toBeTruthy();
  });

  it('does NOT show the post-festival message', () => {
    const { queryByText } = render(<AraScreen />);
    expect(queryByText('Les Santes han acabat')).toBeNull();
  });
});

describe('AraScreen — post-festival (after 2026-07-29)', () => {
  beforeEach(() => {
    mockClock.current = new Date('2026-07-30T12:00:00');
    mockUseNowEvents.mockReturnValue({ now: [], upcoming: [] });
  });

  it('shows the festival-ended message', () => {
    const { getByText } = render(<AraScreen />);
    expect(getByText('Les Santes han acabat')).toBeTruthy();
  });

  it('does NOT show the pre-festival countdown', () => {
    const { queryByText } = render(<AraScreen />);
    expect(queryByText('Les Santes comença en')).toBeNull();
  });

  it('does NOT render the hero card', () => {
    const { queryByTestId } = render(<AraScreen />);
    expect(queryByTestId('hero-card')).toBeNull();
  });
});
